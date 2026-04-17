FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/sdk packages/sdk
COPY packages/admin/package.json packages/admin/
RUN pnpm install --filter @carbooking/admin... --frozen-lockfile=false
COPY packages/admin packages/admin
RUN pnpm --filter @carbooking/sdk build
ARG VITE_API_URL
ARG VITE_TENANT_SLUG
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TENANT_SLUG=$VITE_TENANT_SLUG
RUN pnpm --filter @carbooking/admin build

FROM nginx:alpine
COPY --from=builder /app/packages/admin/dist /usr/share/nginx/html
# SPA fallback
RUN printf 'server { listen 80; root /usr/share/nginx/html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
