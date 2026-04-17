import type { FastifyInstance } from 'fastify';

export default async function tenantRoutes(app: FastifyInstance) {
  // Public branding + config for the client frontend
  app.get('/v1/tenants/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const tenant = await app.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        currency: true,
        timezone: true,
        branding: true,
      },
    });
    if (!tenant) return reply.code(404).send({ error: 'Tenant not found' });
    return tenant;
  });
}
