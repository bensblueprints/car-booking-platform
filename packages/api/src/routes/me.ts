import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  licenseImage: z.string().url().optional(),
});

export default async function meRoutes(app: FastifyInstance) {
  app.get('/v1/me', { preHandler: [app.authenticate] }, async (req) => {
    const user = await app.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        dateOfBirth: true, licenseNumber: true, licenseExpiry: true, licenseImage: true,
        role: true, emailVerified: true, createdAt: true,
      },
    });
    return user;
  });

  app.patch('/v1/me', { preHandler: [app.authenticate] }, async (req, reply) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const data: any = { ...parsed.data };
    if (data.dateOfBirth) {
      const d = new Date(data.dateOfBirth);
      if (isNaN(d.getTime())) return reply.code(400).send({ error: 'Invalid dateOfBirth' });
      data.dateOfBirth = d;
    }
    if (data.licenseExpiry) {
      const d = new Date(data.licenseExpiry);
      if (isNaN(d.getTime())) return reply.code(400).send({ error: 'Invalid licenseExpiry' });
      data.licenseExpiry = d;
    }

    const user = await app.prisma.user.update({
      where: { id: req.user.sub },
      data,
    });
    const { passwordHash, ...rest } = user;
    return rest;
  });

  app.get('/v1/me/bookings', { preHandler: [app.authenticate] }, async (req) => {
    return app.prisma.booking.findMany({
      where: { userId: req.user.sub, tenantId: req.tenantId },
      include: {
        car: { select: { id: true, make: true, model: true, year: true, images: true } },
        pickupLocation: { select: { name: true, address: true } },
        dropoffLocation: { select: { name: true, address: true } },
        review: true,
      },
      orderBy: { startDate: 'desc' },
    });
  });
}
