FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@9

# -------- deps --------
FROM base AS deps
WORKDIR /repo
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY apps/bargain-web/package.json ./apps/bargain-web/package.json
RUN pnpm install --no-frozen-lockfile

# -------- build sdk --------
FROM deps AS sdk
WORKDIR /repo
COPY packages/sdk ./packages/sdk
RUN pnpm --filter @carbooking/sdk build

# -------- build web --------
FROM sdk AS build
WORKDIR /repo
COPY apps/bargain-web ./apps/bargain-web
RUN pnpm --filter bargain-web build

# -------- runtime --------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

RUN mkdir -p apps/bargain-web/public
COPY --from=build --chown=nextjs:nodejs /repo/apps/bargain-web/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /repo/apps/bargain-web/.next/static ./apps/bargain-web/.next/static
COPY --from=build --chown=nextjs:nodejs /repo/apps/bargain-web/public ./apps/bargain-web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/bargain-web/server.js"]
