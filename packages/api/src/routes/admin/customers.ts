import type { FastifyInstance } from 'fastify';

export default async function adminCustomerRoutes(app: FastifyInstance) {
  app.get('/v1/admin/customers', { preHandler: [app.requireAdmin] }, async (req) => {
    const { search } = req.query as { search?: string };
    return app.prisma.user.findMany({
      where: {
        tenantId: req.tenantId,
        role: 'customer',
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        }),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  });

  app.get('/v1/admin/customers/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = await app.prisma.user.findFirst({
      where: { id, tenantId: req.tenantId },
      include: {
        bookings: {
          orderBy: { startDate: 'desc' },
          include: { car: { select: { make: true, model: true, year: true } } },
        },
      },
    });
    if (!user) return reply.code(404).send({ error: 'Customer not found' });
    const { passwordHash, ...rest } = user;
    return rest;
  });
}
