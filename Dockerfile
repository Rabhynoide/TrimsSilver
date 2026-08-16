# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `next build` evaluates route/lib modules (e.g. the Drizzle client), which
# require DATABASE_URL to be a syntactically valid connection string - the
# real value is supplied at container runtime, this is build-time only.
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DATABASE_URL=$DATABASE_URL
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Migrations are applied at startup (see src/instrumentation.ts) and are
# read from disk, so they're not picked up by Next's output file tracing.
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

USER nextjs

# Overridable so the container can be run on any host port via docker-compose.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
