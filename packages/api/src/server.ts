import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';

import { env } from './env.js';
import prismaPlugin from './plugins/prisma.js';
import tenantPlugin from './plugins/tenant.js';
import authPlugin from './plugins/auth.js';

import tenantRoutes from './routes/tenant.js';
import categoryRoutes from './routes/categories.js';
import carRoutes from './routes/cars.js';
import authRoutes from './routes/auth.js';
import meRoutes from './routes/me.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import stripeWebhookRoutes from './routes/webhooks/stripe.js';

import adminCarRoutes from './routes/admin/cars.js';
import adminCategoryRoutes from './routes/admin/categories.js';
import adminLocationRoutes from './routes/admin/locations.js';
import adminBookingRoutes from './routes/admin/bookings.js';
import adminReviewRoutes from './routes/admin/reviews.js';
import adminStatsRoutes from './routes/admin/stats.js';
import adminTenantRoutes from './routes/admin/tenant.js';
import adminCustomerRoutes from './routes/admin/customers.js';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined,
  },
  trustProxy: true,
});

await app.register(sensible);
await app.register(cors, {
  origin: env.CORS_ORIGINS.split(',').map((s) => s.trim()),
  credentials: true,
});
await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });

await app.register(prismaPlugin);
await app.register(tenantPlugin);
await app.register(authPlugin);

app.get('/', async () => ({ service: 'carbooking-api', status: 'ok', version: '0.1.0' }));
app.get('/health', async () => ({ ok: true, ts: new Date().toISOString() }));

await app.register(tenantRoutes);
await app.register(categoryRoutes);
await app.register(carRoutes);
await app.register(authRoutes);
await app.register(meRoutes);
await app.register(bookingRoutes);
await app.register(reviewRoutes);
await app.register(stripeWebhookRoutes);

await app.register(adminCarRoutes);
await app.register(adminCategoryRoutes);
await app.register(adminLocationRoutes);
await app.register(adminBookingRoutes);
await app.register(adminReviewRoutes);
await app.register(adminStatsRoutes);
await app.register(adminTenantRoutes);
await app.register(adminCustomerRoutes);

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(`API listening on ${env.HOST}:${env.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
