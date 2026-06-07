FROM node:20-alpine AS base
RUN npm install -g pnpm

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --filter api

# ---- build ----
FROM deps AS builder
WORKDIR /app
COPY apps/api ./apps/api
RUN pnpm --filter api db:generate
RUN pnpm --filter api build

# ---- runner ----
FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --filter api --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
