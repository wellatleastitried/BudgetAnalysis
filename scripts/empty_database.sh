#!/bin/bash
cd "$(dirname "$0")/.."
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found. Please create one using .env.example as a template."
    exit 1
fi
echo "Emptying PostgreSQL database..."
echo "==============================="
if ! docker compose ps | grep -q "budget_postgres.*Up"; then
    echo "Error: PostgreSQL container is not running."
    echo "Please start the services first: docker compose up -d"
    exit 1
fi
read -p "This will delete ALL data in the database. Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi
echo "Connecting to database and dropping all tables..."
docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
-- Drop all tables in the public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Grant privileges
GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
GRANT ALL ON SCHEMA public TO public;
-- Confirm tables are gone
\dt
EOF
if [ $? -eq 0 ]; then
    echo "Database has been emptied successfully!"
    echo "Note: You may need to restart the backend to recreate tables."
    echo "Run: docker compose restart backend"
else
    echo "Error emptying database. Check the logs above."
    exit 1
fi
