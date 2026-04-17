import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  stripeKey: z.string().optional().nullable(),
  branding: z.any().optional(),
  fees: z.any().optional(),
});

export default async function adminTenantRoutes(app: FastifyInstance) {
  app.get('/v1/admin/tenant', { preHandler: [app.requireAdmin] }, async (req) => {
    return app.prisma.tenant.findUnique({ where: { id: req.tenantId } });
  });

  app.patch('/v1/admin/tenant', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    return app.prisma.tenant.update({ where: { id: req.tenantId }, data: parsed.data });
  });
}
