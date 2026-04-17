import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const categorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  imageUrl: z.string().url().optional().nullable(),
});

export default async function adminCategoryRoutes(app: FastifyInstance) {
  app.post('/v1/admin/categories', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    return app.prisma.category.create({
      data: { ...parsed.data, tenantId: req.tenantId },
    });
  });

  app.patch('/v1/admin/categories/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = categorySchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const cat = await app.prisma.category.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!cat) return reply.code(404).send({ error: 'Category not found' });
    return app.prisma.category.update({ where: { id }, data: parsed.data });
  });

  app.delete('/v1/admin/categories/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const cat = await app.prisma.category.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!cat) return reply.code(404).send({ error: 'Category not found' });
    const usage = await app.prisma.car.count({ where: { categoryId: id } });
    if (usage > 0) return reply.code(409).send({ error: 'Category in use', carCount: usage });
    await app.prisma.category.delete({ where: { id } });
    return { ok: true };
  });
}
