import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const patchSchema = z.object({
  approved: z.boolean().optional(),
  adminReply: z.string().max(1000).optional().nullable(),
});

export default async function adminReviewRoutes(app: FastifyInstance) {
  app.get('/v1/admin/reviews', { preHandler: [app.requireAdmin] }, async (req) => {
    const { approved } = req.query as { approved?: string };
    return app.prisma.review.findMany({
      where: {
        tenantId: req.tenantId,
        ...(approved !== undefined && { approved: approved === 'true' }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        car: { select: { make: true, model: true, year: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.patch('/v1/admin/reviews/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const review = await app.prisma.review.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!review) return reply.code(404).send({ error: 'Review not found' });
    return app.prisma.review.update({ where: { id }, data: parsed.data });
  });

  app.delete('/v1/admin/reviews/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const review = await app.prisma.review.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!review) return reply.code(404).send({ error: 'Review not found' });
    await app.prisma.review.delete({ where: { id } });
    return { ok: true };
  });
}
