import fp from 'fastify-plugin';
import { env } from '../env.js';

declare module 'fastify' {
  interface FastifyRequest {
    tenantId: string;
    tenantSlug: string;
  }
}

/**
 * Resolve the active tenant from:
 *   1. `X-Tenant-Slug` header
 *   2. subdomain (if deployed per-tenant)
 *   3. DEFAULT_TENANT_SLUG env (single-tenant deployments)
 *
 * Caches slug→id in memory to avoid a DB lookup per request.
 */
const cache = new Map<string, string>();

export default fp(async (app) => {
  app.addHook('onRequest', async (req, reply) => {
    const header = req.headers['x-tenant-slug'];
    const slug =
      (Array.isArray(header) ? header[0] : header) ??
      req.hostname.split('.')[0] ??
      env.DEFAULT_TENANT_SLUG;

    let tenantId = cache.get(slug);
    if (!tenantId) {
      const t = await app.prisma.tenant.findUnique({ where: { slug } });
      if (!t) {
        // Fallback to default tenant (useful for local dev w/ wildcard Host)
        const fallback = await app.prisma.tenant.findUnique({
          where: { slug: env.DEFAULT_TENANT_SLUG },
        });
        if (!fallback) return reply.code(404).send({ error: 'Tenant not found' });
        tenantId = fallback.id;
        cache.set(env.DEFAULT_TENANT_SLUG, fallback.id);
        req.tenantId = fallback.id;
        req.tenantSlug = env.DEFAULT_TENANT_SLUG;
        return;
      }
      tenantId = t.id;
      cache.set(slug, tenantId);
    }
    req.tenantId = tenantId;
    req.tenantSlug = slug;
  });
});
