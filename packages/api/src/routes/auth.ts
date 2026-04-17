import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(app: FastifyInstance) {
  app.post('/v1/auth/register', async (req, reply) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input', details: parsed.error.flatten() });
    const { email, password, firstName, lastName, phone } = parsed.data;

    const existing = await app.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: req.tenantId, email: email.toLowerCase() } },
    });
    if (existing) return reply.code(409).send({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await app.prisma.user.create({
      data: {
        tenantId: req.tenantId,
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
      },
    });

    const token = app.jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role as any });
    return { token, user: sanitize(user) };
  });

  app.post('/v1/auth/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'Invalid input' });
    const { email, password } = parsed.data;

    const user = await app.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: req.tenantId, email: email.toLowerCase() } },
    });
    if (!user || !user.passwordHash) return reply.code(401).send({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return reply.code(401).send({ error: 'Invalid credentials' });

    const token = app.jwt.sign({ sub: user.id, tenantId: user.tenantId, role: user.role as any });
    return { token, user: sanitize(user) };
  });
}

function sanitize(u: any) {
  const { passwordHash, ...rest } = u;
  return rest;
}
