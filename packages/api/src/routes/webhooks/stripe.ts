import type { FastifyInstance } from 'fastify';
import { env } from '../../env.js';
import { getStripe, stripeConfigured } from '../../lib/stripe.js';

export default async function stripeWebhookRoutes(app: FastifyInstance) {
  // Raw body needed for signature verification
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (req, body, done) => {
      (req as any).rawBody = body;
      try {
        done(null, JSON.parse(body.toString()));
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.post('/v1/webhooks/stripe', async (req, reply) => {
    if (!stripeConfigured() || !env.STRIPE_WEBHOOK_SECRET) {
      return reply.code(501).send({ error: 'Stripe not configured' });
    }
    const sig = req.headers['stripe-signature'] as string | undefined;
    if (!sig) return reply.code(400).send({ error: 'Missing stripe-signature' });

    const stripe = getStripe();
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      app.log.warn({ err: err.message }, 'Stripe webhook signature verification failed');
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) {
          await app.prisma.booking.updateMany({
            where: { id: bookingId, status: 'pending' },
            data: { status: 'confirmed' },
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) {
          await app.prisma.booking.updateMany({
            where: { id: bookingId, status: 'pending' },
            data: { status: 'cancelled' },
          });
        }
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as any;
        const bookingId = charge.metadata?.bookingId;
        if (bookingId) {
          await app.prisma.booking.updateMany({
            where: { id: bookingId },
            data: { status: 'refunded' },
          });
        }
        break;
      }
    }

    return { received: true };
  });
}
