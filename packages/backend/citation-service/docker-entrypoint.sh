#!/bin/sh
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
timeout=60
while ! nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432} >/dev/null 2>&1; do
  timeout=$(($timeout - 1))
  if [ $timeout -eq 0 ]; then
    echo "Timed out waiting for PostgreSQL to be ready"
    exit 1
  fi
  echo "PostgreSQL not ready yet, waiting..."
  sleep 1
done
echo "PostgreSQL is ready!"

# Generate Prisma client (if needed)
echo "Generating Prisma client..."
pnpm prisma generate --schema=./prisma/schema.prisma

# Run database migrations
echo "Running database migrations..."
pnpm prisma migrate deploy --schema=./prisma/schema.prisma

# Start the application
echo "Starting application..."
exec node dist/index.js 