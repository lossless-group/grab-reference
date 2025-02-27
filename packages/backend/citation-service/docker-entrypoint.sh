#!/bin/sh
set -e

until nc -z -v -w30 postgres 5432
do
  echo "Waiting for database connection..."
  sleep 5
done

echo "Database is up - starting application"
exec node dist/index.js 