import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { quoteBooking } from '../lib/pricing.js';
import { isCarAvailable } from '../lib/availability.js';
import { getStripe, stripeConfigured } from '../lib/stripe.js';

const quoteSchema = z.object({
  carId: z.string(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  youngDriver: z.boolean().optional(),
  airportPickup: z.boolean().optional(),
});

const createSchema = quoteSchema.extend({
  pickupLocationId: z.string().optional(),
  dropoffLocationId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export default async function bookingRoutes(app: FastifyInstance) {
  app.post('/v1/bookings/quote', async (req, reply) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const { carId, start, end, youngDriver, airportPickup } = parsed.data;

    const car = await app.prisma.car.findFirst({
      where: { id: carId, tenantId: req.tenantId, status: 'active' },
    });
    if (!car) return reply.code(404).send({ error: 'Car not found' });

    const tenant = await app.prisma.tenant.findUnique({ where: { id: req.tenantId } });
    const fees = (tenant?.fees as any) ?? {};

    const startD = new Date(start);
    const endD = new Date(end);
    const available = await isCarAvailable(app.prisma, carId, startD, endD);

    const quote = quoteBooking({
      dailyRate: car.dailyRate,
      weeklyRate: car.weeklyRate,
      monthlyRate: car.monthlyRate,
      depositAmount: car.depositAmount,
      start: startD,
      end: endD,
      fees,
      youngDriver,
      airportPickup,
    });

    return { available, quote };
  });

  app.post('/v1/bookings', { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const data = parsed.data;

    const car = await app.prisma.car.findFirst({
      where: { id: data.carId, tenantId: req.tenantId, status: 'active' },
    });
    if (!car) return reply.code(404).send({ error: 'Car not found' });

    const startD = new Date(data.start);
    const endD = new Date(data.end);
    const available = await isCarAvailable(app.prisma, data.carId, startD, endD);
    if (!available) return reply.code(409).send({ error: 'Car is not available for those dates' });

    const tenant = await app.prisma.tenant.findUnique({ where: { id: req.tenantId } });
    const feesCfg = (tenant?.fees as any) ?? {};

    const quote = quoteBooking({
      dailyRate: car.dailyRate,
      weeklyRate: car.weeklyRate,
      monthlyRate: car.monthlyRate,
      depositAmount: car.depositAmount,
      start: startD,
      end: endD,
      fees: feesCfg,
      youngDriver: data.youngDriver,
      airportPickup: data.airportPickup,
    });

    // Create booking in pending state, then create Stripe PaymentIntent.
    const booking = await app.prisma.booking.create({
      data: {
        tenantId: req.tenantId,
        userId: req.user.sub,
        carId: data.carId,
        pickupLocationId: data.pickupLocationId ?? car.locationId,
        dropoffLocationId: data.dropoffLocationId ?? car.locationId,
        startDate: startD,
        endDate: endD,
        days: quote.days,
        dailyRate: quote.dailyRate,
        subtotal: quote.subtotal,
        taxes: quote.taxes,
        fees: quote.fees,
        depositHeld: quote.depositHeld,
        totalAmount: quote.totalAmount,
        status: 'pending',
        notes: data.notes,
      },
    });

    let clientSecret: string | null = null;
    if (stripeConfigured()) {
      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(quote.totalAmount * 100),
        currency: (tenant?.currency ?? 'USD').toLowerCase(),
        metadata: {
          bookingId: booking.id,
          tenantId: req.tenantId,
          userId: req.user.sub,
          carId: data.carId,
        },
        automatic_payment_methods: { enabled: true },
      });
      clientSecret = intent.client_secret;
      await app.prisma.booking.update({
        where: { id: booking.id },
        data: { stripePaymentId: intent.id },
      });
    }

    return { booking, quote, clientSecret };
  });

  app.get('/v1/bookings/:id', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const booking = await app.prisma.booking.findFirst({
      where: { id, tenantId: req.tenantId, userId: req.user.sub },
      include: {
        car: { include: { category: true } },
        pickupLocation: true,
        dropoffLocation: true,
        review: true,
      },
    });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    return booking;
  });

  app.post('/v1/bookings/:id/cancel', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const booking = await app.prisma.booking.findFirst({
      where: { id, tenantId: req.tenantId, userId: req.user.sub },
    });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return reply.code(400).send({ error: `Cannot cancel booking in status ${booking.status}` });
    }
    const updated = await app.prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });
    // TODO: Stripe refund based on cancellation policy
    return updated;
  });
}
