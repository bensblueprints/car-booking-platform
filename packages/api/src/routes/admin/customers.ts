import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const createSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  licenseExpiry: z.string().optional().nullable(),
  // Data URL (base64) or http(s) URL.
  licenseImage: z.string().optional().nullable(),
  password: z.string().min(8).optional(),
});

const updateSchema = createSchema.partial().omit({ email: true });

export default async function adminCustomerRoutes(app: FastifyInstance) {
  app.post('/v1/admin/customers', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const { email, password, dateOfBirth, licenseExpiry, ...rest } = parsed.data;

    const existing = await app.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: req.tenantId, email: email.toLowerCase() } },
    });
    if (existing) return reply.code(409).send({ error: 'Customer with that email already exists' });

    const user = await app.prisma.user.create({
      data: {
        tenantId: req.tenantId,
        email: email.toLowerCase(),
        passwordHash: password ? await bcrypt.hash(password, 10) : null,
        ...rest,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
        role: 'customer',
      },
    });
    const { passwordHash, ...safe } = user;
    return safe;
  });

  app.patch('/v1/admin/customers/:id', { preHandler: [app.requireAdmin] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const found = await app.prisma.user.findFirst({ where: { id, tenantId: req.tenantId } });
    if (!found) return reply.code(404).send({ error: 'Customer not found' });
    const { password, dateOfBirth, licenseExpiry, ...rest } = parsed.data;
    const data: any = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (licenseExpiry !== undefined) data.licenseExpiry = licenseExpiry ? new Date(licenseExpiry) : null;
    const updated = await app.prisma.user.update({ where: { id }, data });
    const { passwordHash, ...safe } = updated;
    return safe;
  });


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
