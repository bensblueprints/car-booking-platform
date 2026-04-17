import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000),
});

export default async function reviewRoutes(app: FastifyInstance) {
  app.post('/v1/bookings/:id/review', { preHandler: [app.authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });

    const booking = await app.prisma.booking.findFirst({
      where: { id, tenantId: req.tenantId, userId: req.user.sub },
    });
    if (!booking) return reply.code(404).send({ error: 'Booking not found' });
    if (booking.status !== 'completed') {
      return reply.code(400).send({ error: 'Can only review completed bookings' });
    }

    const existing = await app.prisma.review.findUnique({ where: { bookingId: id } });
    if (existing) return reply.code(409).send({ error: 'Review already submitted' });

    const review = await app.prisma.review.create({
      data: {
        tenantId: req.tenantId,
        bookingId: id,
        carId: booking.carId,
        userId: req.user.sub,
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        approved: false,
      },
    });
    return review;
  });

  app.get('/v1/cars/:carId/reviews', async (req) => {
    const { carId } = req.params as { carId: string };
    return app.prisma.review.findMany({
      where: { carId, tenantId: req.tenantId, approved: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  });
}
