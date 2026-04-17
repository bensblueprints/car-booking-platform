import type { FastifyInstance } from 'fastify';

export default async function categoryRoutes(app: FastifyInstance) {
  app.get('/v1/categories', async (req) => {
    return app.prisma.category.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { cars: { where: { status: 'active' } } } } },
    });
  });

  app.get('/v1/categories/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const cat = await app.prisma.category.findUnique({
      where: { tenantId_slug: { tenantId: req.tenantId, slug } },
      include: {
        cars: {
          where: { status: 'active' },
          orderBy: { dailyRate: 'asc' },
          include: { category: true, location: true },
        },
      },
    });
    if (!cat) return reply.code(404).send({ error: 'Category not found' });
    return cat;
  });
}
