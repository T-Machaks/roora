# syntax=docker/dockerfile:1

# ---- deps: install dependencies and compile the better-sqlite3 native addon ----
FROM node:24-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: generate the Prisma client and build the Next.js app ----
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ---- runner: the actual production image ----
# Uses the full node_modules (not the standalone-traced subset) so that
# `prisma migrate deploy` and `npm run seed` — both invoked at container
# operation time, not imported by the server bundle — work out of the
# box in the same image as the app itself. This trades some image size
# for reliability, a reasonable trade for a single self-hosted instance.
FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs roora

# --chown here (not a separate RUN chown) matters: Next.js writes to
# .next/cache (e.g. the image-optimization cache) at request time as the
# `roora` user, and a COPY without --chown leaves everything root-owned,
# which fails those writes with EACCES — that failure was observed to
# cascade into corrupted RSC navigation responses, not just missing
# image caching, so this isn't just a cosmetic warning to skip.
COPY --from=builder --chown=roora:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=roora:nodejs /app/.next ./.next
COPY --from=builder --chown=roora:nodejs /app/public ./public
COPY --from=builder --chown=roora:nodejs /app/prisma ./prisma
COPY --from=builder --chown=roora:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=roora:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=roora:nodejs /app/package.json ./package.json
# next build bundles the generated Prisma client into .next for the app
# itself, but prisma/seed*.ts run standalone via `tsx` (not through the
# Next.js bundle) and import it directly by path, so it needs its own copy.
COPY --from=builder --chown=roora:nodejs /app/src/generated ./src/generated
COPY --chown=roora:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# /app/data is the volume mount point for the SQLite file (path set via
# DATABASE_URL in the compose file's environment). Uploaded media lives in
# S3, not on this volume.
RUN mkdir -p /app/data && chown -R roora:nodejs /app/data
VOLUME ["/app/data"]

USER roora
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
