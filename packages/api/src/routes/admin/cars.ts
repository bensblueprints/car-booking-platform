import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const carSchema = z.object({
  categoryId: z.string(),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1950).max(2100),
  trim: z.string().optional().nullable(),
  seats: z.number().int().min(1).max(20).default(5),
  doors: z.number().int().min(2).max(6).default(4),
  transmission: z.enum(['automatic', 'manual']).default('automatic'),
  fuelType: z.enum(['gas', 'hybrid', 'ev', 'diesel']).default('gas'),
  mpg: z.number().int().optional().nullable(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  color: z.string().optional().nullable(),
  dailyRate: z.number().positive(),
  weeklyRate: z.number().positive().optional().nullable(),
  monthlyRate: z.number().positive().optional().nullable(),
  depositAmount: z.number().nonnegative().default(200),
  mileageLimit: z.number().int().optional().nullable(),
  locationId: z.string().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'retired']).default('active'),
  description: z.string().optional().nullable(),
  vin: z.string().optional().nullable(),
  licensePlate: z.string().optional().nullable(),
});

export default async function adminCarRoutes(app: FastifyInstance) {
  app.get('/v1/admin/cars', { preHandler: [app.requireAdmin] }, async (req) => {
    return app.prisma.car.findMany({
      where: { tenantId: req.tenantId },
      include: { category: true, location: true, _count: { select: { bookings: true, reviews: true } } },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.post('/v1/admin/cars', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const parsed = carSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    return app.prisma.car.create({
      data: { ...parsed.data, tenantId: req.tenantId },
    });
  });

  app.patch('/v1/admin/cars/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = carSchema.partial().safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const car = await app.prisma.car.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!car) return reply.code(404).send({ error: 'Car not found' });
    return app.prisma.car.update({ where: { id }, data: parsed.data });
  });

  app.get('/v1/admin/cars/:id/bookings', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const car = await app.prisma.car.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!car) return reply.code(404).send({ error: 'Car not found' });
    return app.prisma.booking.findMany({
      where: { carId: id, tenantId: req.tenantId },
      select: {
        id: true, startDate: true, endDate: true, status: true, totalAmount: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  });

  app.delete('/v1/admin/cars/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const car = await app.prisma.car.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!car) return reply.code(404).send({ error: 'Car not found' });
    // Soft-delete: mark retired (hard-delete breaks booking history)
    return app.prisma.car.update({ where: { id }, data: { status: 'retired' } });
  });
}
