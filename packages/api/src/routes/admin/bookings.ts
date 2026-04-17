import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded']).optional(),
  notes: z.string().max(2000).optional(),
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

  app.patch('/v1/admin/bookings/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const booking = await app.prisma.booking.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    return app.prisma.booking.update({ where: { id }, data: parsed.data });
  });
}
