FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/api/package.json packages/api/
COPY packages/api/prisma packages/api/prisma
RUN pnpm install --filter @carbooking/api... --frozen-lockfile=false
COPY packages/api packages/api
RUN pnpm --filter @carbooking/api prisma generate
RUN pnpm --filter @carbooking/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/api/package.json packages/api/
COPY --from=builder /app/packages/api/dist packages/api/dist
COPY --from=builder /app/packages/api/prisma packages/api/prisma
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/packages/api/node_modules packages/api/node_modules
EXPOSE 4000
WORKDIR /app/packages/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
