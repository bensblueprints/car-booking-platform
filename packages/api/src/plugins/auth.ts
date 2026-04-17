import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '../env.js';

export interface AuthPayload {
  sub: string;       // user id
  tenantId: string;
  role: 'customer' | 'staff' | 'admin';
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthPayload;
    user: AuthPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<void>;
    requireAdmin: (req: any, reply: any) => Promise<void>;
  }
}

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
      if (req.user.tenantId !== req.tenantId) {
        return reply.code(403).send({ error: 'Token does not match tenant' });
      }
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  app.decorate('requireAdmin', async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
      if (req.user.tenantId !== req.tenantId) {
        return reply.code(403).send({ error: 'Token does not match tenant' });
      }
      if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        return reply.code(403).send({ error: 'Admin access required' });
      }
    } catch {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
