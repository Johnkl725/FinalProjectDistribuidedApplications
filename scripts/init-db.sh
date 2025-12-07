#!/bin/sh
# ===============================================
# DATABASE INITIALIZATION SCRIPT
# Runs init.sql only if tables don't exist
# ===============================================

set -e

echo "🔍 Checking if database needs initialization..."

# Wait for database to be ready
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database is ready!"

# Check if users table exists
TABLE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='users';")

if [ "$TABLE_EXISTS" -eq "0" ]; then
  echo "📦 Tables not found. Initializing database..."
  PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f /app/database/init.sql
  echo "✅ Database initialized successfully!"
else
  echo "✅ Database already initialized. Skipping init.sql"
fi

echo "🚀 Starting application..."
exec "$@"
