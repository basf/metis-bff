#!/usr/bin/env sh

set -e

node /app/db_seed.js 2>/dev/null || true

echo "Starting metis-bff..."
exec "$@"
