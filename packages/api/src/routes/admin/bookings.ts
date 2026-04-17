import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { quoteBooking } from '../../lib/pricing.js';
import { isCarAvailable } from '../../lib/availability.js';
import { getStripe, stripeConfigured } from '../../lib/stripe.js';

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded']).optional(),
  notes: z.string().max(2000).optional(),
  // Data URL or http(s) URL to the signed rental agreement.
  contractUrl: z.string().optional().nullable(),
  // Additional document URLs/data URLs (inspection photos, misc receipts).
  documents: z.array(z.string()).optional(),
});

const markPaidSchema = z.object({
  method: z.enum(['cash', 'card_at_location', 'check', 'other']).default('cash'),
});

const createSchema = z.object({
  userId: z.string(),
  carId: z.string(),
  start: z.string(),
  end: z.string(),
  pickupLocationId: z.string().optional().nullable(),
  dropoffLocationId: z.string().optional().nullable(),
  youngDriver: z.boolean().optional(),
  airportPickup: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  // When true, book even if the window overlaps another booking.
  override: z.boolean().optional(),
  // Default 'confirmed' for manual admin bookings (they're not going through Stripe).
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed']).optional(),
});

export default async function adminBookingRoutes(app: FastifyInstance) {
  app.get('/v1/admin/bookings', { preHandler: [app.requireAdmin] }, async (req) => {
    const { status } = req.query as { status?: string };
    return app.prisma.booking.findMany({
      where: {
        tenantId: req.tenantId,
        ...(status && { status }),
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        car: { select: { id: true, make: true, model: true, year: true, images: true } },
        pickupLocation: { select: { name: true } },
        dropoffLocation: { select: { name: true } },
      },
      orderBy: { startDate: 'desc' },
      take: 500,
    });
  });

  app.get('/v1/admin/bookings/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const booking = await app.prisma.booking.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        user: true,
        car: { include: { category: true } },
        pickupLocation: true,
        dropoffLocation: true,
        review: true,
      },
    });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    return booking;
  });

  app.post('/v1/admin/bookings', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const data = parsed.data;

    const car = await app.prisma.car.findFirst({ where: { id: data.carId, tenantId: req.tenantId } });
    if (!car) return reply.code(404).send({ error: 'Car not found' });
    const user = await app.prisma.user.findFirst({ where: { id: data.userId, tenantId: req.tenantId } });
    if (!user) return reply.code(404).send({ error: 'Customer not found' });

    const startD = new Date(data.start);
    const endD = new Date(data.end);
    if (isNaN(startD.getTime()) || isNaN(endD.getTime())) return reply.code(400).send({ error: 'Invalid dates' });
    if (endD <= startD) return reply.code(400).send({ error: 'End must be after start' });

    if (!data.override) {
      const available = await isCarAvailable(app.prisma, data.carId, startD, endD);
      if (!available) return reply.code(409).send({ error: 'Car is not available for those dates. Set override=true to force.' });
    }

    const tenant = await app.prisma.tenant.findUnique({ where: { id: req.tenantId } });
    const fees = (tenant?.fees as any) ?? {};
    const quote = quoteBooking({
      dailyRate: car.dailyRate,
      weeklyRate: car.weeklyRate,
      monthlyRate: car.monthlyRate,
      depositAmount: car.depositAmount,
      start: startD,
      end: endD,
      fees,
      youngDriver: data.youngDriver,
      airportPickup: data.airportPickup,
    });

    const booking = await app.prisma.booking.create({
      data: {
        tenantId: req.tenantId,
        userId: user.id,
        carId: car.id,
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
        status: data.status ?? 'confirmed',
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        car: { select: { id: true, make: true, model: true, year: true } },
      },
    });
    return booking;
  });

  // Mark an in-person payment. Sets status=confirmed, paidAt=now, paymentMethod.
  app.post('/v1/admin/bookings/:id/mark-paid', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = markPaidSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const booking = await app.prisma.booking.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    return app.prisma.booking.update({
      where: { id },
      data: {
        paymentMethod: parsed.data.method,
        paidAt: new Date(),
        status: booking.status === 'pending' ? 'confirmed' : booking.status,
      },
    });
  });

  // Generate a Stripe Payment Link the customer can pay with later (email/SMS).
  app.post('/v1/admin/bookings/:id/payment-link', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    if (!stripeConfigured()) return reply.code(400).send({ error: 'Stripe not configured for this tenant' });
    const { id } = req.params as { id: string };
    const booking = await app.prisma.booking.findFirst({
      where: { id, tenantId: req.tenantId },
      include: { car: { select: { make: true, model: true, year: true } }, user: { select: { email: true, firstName: true, lastName: true } } },
    });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });

    // If we already created one, return it instead of burning a new product.
    if (booking.stripePaymentLinkUrl) {
      return { url: booking.stripePaymentLinkUrl, reused: true };
    }

    const stripe = getStripe();
    const tenant = await app.prisma.tenant.findUnique({ where: { id: req.tenantId } });
    const currency = (tenant?.currency ?? 'USD').toLowerCase();

    const price = await stripe.prices.create({
      currency,
      unit_amount: Math.round(Number(booking.totalAmount) * 100),
      product_data: {
        name: `${booking.car.year} ${booking.car.make} ${booking.car.model} — Booking ${booking.id.slice(0, 8)}`,
      },
    });

    const link = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: { bookingId: booking.id, tenantId: req.tenantId },
      after_completion: { type: 'hosted_confirmation', hosted_confirmation: { custom_message: 'Thank you — your booking is confirmed.' } },
    });

    await app.prisma.booking.update({
      where: { id: booking.id },
      data: { stripePaymentLinkUrl: link.url },
    });

    return { url: link.url, reused: false };
  });

  app.patch('/v1/admin/bookings/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const booking = await app.prisma.booking.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    return app.prisma.booking.update({ where: { id }, data: parsed.data });
  });
}
