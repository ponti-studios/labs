#!/bin/sh
set -euo pipefail

echo "Waiting for PostgreSQL to be ready..."

# Simple wait for postgres socket to exist
until [ -S /var/run/postgresql/.s.PGSQL.5432 ]; do
  echo "Postgres socket not ready yet; sleeping..."
  sleep 1
done

echo "PostgreSQL is ready!"
echo "Note: Extensions will be created by migrations, not this init script."
