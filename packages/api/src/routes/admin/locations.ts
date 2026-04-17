import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

export default async function adminLocationRoutes(app: FastifyInstance) {
  app.get('/v1/admin/locations', { preHandler: [app.requireAdmin] }, async (req) => {
    return app.prisma.location.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { name: 'asc' },
    });
  });

  app.post('/v1/admin/locations', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const parsed = locationSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    return app.prisma.location.create({ data: { ...parsed.data, tenantId: req.tenantId } });
  });

  app.patch('/v1/admin/locations/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = locationSchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const loc = await app.prisma.location.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!loc) return reply.code(404).send({ error: 'Location not found' });
    return app.prisma.location.update({ where: { id }, data: parsed.data });
  });

  app.delete('/v1/admin/locations/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const loc = await app.prisma.location.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!loc) return reply.code(404).send({ error: 'Location not found' });
    await app.prisma.location.delete({ where: { id } });
    return { ok: true };
  });
}
