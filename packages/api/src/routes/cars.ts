import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { findAvailableCars } from '../lib/availability.js';

const searchSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  seats: z.coerce.number().optional(),
  transmission: z.enum(['automatic', 'manual']).optional(),
});

export default async function carRoutes(app: FastifyInstance) {
  app.get('/v1/cars/search', async (req, reply) => {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid query', details: parsed.error.flatten() });
    const q = parsed.data;

    // Resolve category slug → id
    let categoryId: string | undefined;
    if (q.category) {
      const cat = await app.prisma.category.findUnique({
        where: { tenantId_slug: { tenantId: req.tenantId, slug: q.category } },
        select: { id: true },
      });
      if (!cat) return [];
      categoryId = cat.id;
    }

    let cars;
    if (q.start && q.end) {
      cars = await findAvailableCars(app.prisma, {
        tenantId: req.tenantId,
        start: new Date(q.start),
        end: new Date(q.end),
        categoryId,
        locationId: q.location,
      });
    } else {
      cars = await app.prisma.car.findMany({
        where: {
          tenantId: req.tenantId,
          status: 'active',
          ...(categoryId && { categoryId }),
          ...(q.location && { locationId: q.location }),
        },
        include: { category: true, location: true },
        orderBy: { dailyRate: 'asc' },
      });
    }

    // Post-filter price/seats/transmission (DB already filtered tenant, status, category, location)
    return cars.filter((c) => {
      const rate = Number(c.dailyRate.toString());
      if (q.minPrice && rate < q.minPrice) return false;
      if (q.maxPrice && rate > q.maxPrice) return false;
      if (q.seats && c.seats < q.seats) return false;
      if (q.transmission && c.transmission !== q.transmission) return false;
      return true;
    });
  });

  app.get('/v1/cars/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const car = await app.prisma.car.findFirst({
      where: { id, tenantId: req.tenantId, status: 'active' },
      include: {
        category: true,
        location: true,
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    if (!car) return reply.code(404).send({ error: 'Car not found' });

    const ratingAgg = await app.prisma.review.aggregate({
      where: { carId: id, approved: true },
      _avg: { rating: true },
      _count: true,
    });

    return {
      ...car,
      averageRating: ratingAgg._avg.rating ?? null,
      reviewCount: ratingAgg._count,
    };
  });
}
