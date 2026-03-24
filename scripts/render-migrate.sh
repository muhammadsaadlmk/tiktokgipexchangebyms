#!/bin/bash
set -e

echo "=== Running database migrations ==="
cd "$(dirname "$0")/.."

pnpm --filter @workspace/db run push

echo "=== Seeding production data ==="
psql "$DATABASE_URL" -f scripts/seed-production.sql

echo "=== Migration and seed complete ==="
