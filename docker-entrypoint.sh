#!/bin/sh
set -e

# Applies any pending migrations on every container start. Idempotent —
# no-ops if the schema is already up to date. Seeding is deliberately
# NOT run automatically; run it once yourself after first boot:
#   docker compose exec app npm run seed
npx prisma migrate deploy

exec "$@"
