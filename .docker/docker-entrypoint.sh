#!/usr/bin/env sh

set -e

npm run db-migrate

echo "Starting metis-bff..."
exec "$@"
