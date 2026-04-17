import type { FastifyInstance } from 'fastify';

export default async function adminStatsRoutes(app: FastifyInstance) {
  app.get('/v1/admin/stats', { preHandler: [app.requireAdmin] }, async (req) => {
    const tenantId = req.tenantId;
    const now = new Date();
    const start30 = new Date(now.getTime() - 30 * 86400000);
    const start90 = new Date(now.getTime() - 90 * 86400000);

    const [
      totalCars,
      activeCars,
      totalBookings,
      newBookings,
      confirmedBookings,
      completedBookings,
      totalUsers,
      revenue30,
      revenue90,
      pendingReviews,
      todayPickups,
      todayDropoffs,
    ] = await Promise.all([
      app.prisma.car.count({ where: { tenantId } }),
      app.prisma.car.count({ where: { tenantId, status: 'active' } }),
      app.prisma.booking.count({ where: { tenantId } }),
      app.prisma.booking.count({ where: { tenantId, status: 'pending' } }),
      app.prisma.booking.count({ where: { tenantId, status: 'confirmed' } }),
      app.prisma.booking.count({ where: { tenantId, status: 'completed' } }),
      app.prisma.user.count({ where: { tenantId, role: 'customer' } }),
      app.prisma.booking.aggregate({
        where: { tenantId, status: { in: ['confirmed', 'in_progress', 'completed'] }, createdAt: { gte: start30 } },
        _sum: { totalAmount: true },
      }),
      app.prisma.booking.aggregate({
        where: { tenantId, status: { in: ['confirmed', 'in_progress', 'completed'] }, createdAt: { gte: start90 } },
        _sum: { totalAmount: true },
      }),
      app.prisma.review.count({ where: { tenantId, approved: false } }),
      app.prisma.booking.findMany({
        where: {
          tenantId,
          status: { in: ['confirmed', 'in_progress'] },
          startDate: { gte: new Date(now.toDateString()), lt: new Date(new Date(now.toDateString()).getTime() + 86400000) },
        },
        include: { car: true, user: { select: { firstName: true, lastName: true, phone: true } } },
      }),
      app.prisma.booking.findMany({
        where: {
          tenantId,
          status: { in: ['in_progress'] },
          endDate: { gte: new Date(now.toDateString()), lt: new Date(new Date(now.toDateString()).getTime() + 86400000) },
        },
        include: { car: true, user: { select: { firstName: true, lastName: true, phone: true } } },
      }),
    ]);

    return {
      fleet: { total: totalCars, active: activeCars },
      bookings: {
        total: totalBookings,
        pending: newBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
      },
      customers: totalUsers,
      revenue: {
        last30: Number(revenue30._sum.totalAmount ?? 0),
        last90: Number(revenue90._sum.totalAmount ?? 0),
      },
      pendingReviews,
      today: { pickups: todayPickups, dropoffs: todayDropoffs },
    };
  });
}
