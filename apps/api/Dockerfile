FROM node:20-alpine
RUN apk add --no-cache openssl
RUN npm install -g pnpm

WORKDIR /app

# Install all dependencies (including dev, so prisma CLI is available at runtime)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --filter api

# Copy source and build
COPY apps/api ./apps/api
RUN pnpm --filter api db:generate
RUN pnpm --filter api build

WORKDIR /app/apps/api

ENV NODE_ENV=production

EXPOSE 3001

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy; node dist/index.js"]
