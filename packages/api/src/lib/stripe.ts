import Stripe from 'stripe';
import { env } from '../env.js';

let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  }
  return client;
}

export function stripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}
