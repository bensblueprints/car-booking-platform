# Car Booking Platform

A reusable, multi-tenant-capable car booking system (Turo-style) with a standalone REST API, an admin dashboard, a typed client SDK, and a premium Next.js client site.

## Packages

- `packages/api` — Fastify + Prisma + Neon Postgres + Stripe. Multi-tenant REST API.
- `packages/admin` — Vite + React admin dashboard (fleet, bookings, customers, reviews, stats).
- `packages/sdk` — Typed client SDK consumed by client frontends.

## Apps

- `apps/bargain-web` — Next.js 14 site for Bargain Rent-A-Car of America (first client).

## Quickstart

```bash
pnpm install
cp packages/api/.env.example packages/api/.env
# fill in DATABASE_URL, STRIPE_SECRET_KEY, JWT_SECRET...
pnpm --filter @carbooking/api prisma migrate dev
pnpm --filter @carbooking/api seed
pnpm dev:api     # API  :4000
pnpm dev:admin   # admin :5173
pnpm dev:web     # site  :3000
```

## Reusing for another rental client

1. Seed a new `Tenant` row with its slug, branding, Stripe keys.
2. Deploy a copy of `apps/bargain-web` as `apps/{client}-web` or point the existing site at the new tenant via `NEXT_PUBLIC_TENANT_SLUG`.
3. Deploy admin dashboard as `admin.{client-domain}`.
