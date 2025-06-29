#!/bin/bash
cd "$(dirname "$0")/.."
source .env
echo "Starting BudgetAnalysis with PostgreSQL..."
echo "=========================================="
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi
if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi
echo "Stopping existing containers..."
docker compose down
if [ "$1" == "--fresh" ]; then
    echo "Removing existing database volume for fresh start..."
    docker volume rm budgetanalysis_postgres_data 2>/dev/null || true
fi
echo "Building and starting services..."
docker compose up --build -d
echo "Waiting for PostgreSQL to be ready..."
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
    if docker compose exec -T db pg_isready -U $POSTGRES_USER -d $POSTGRES_DB >/dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting for database... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done
if [ $counter -ge $timeout ]; then
    echo "Error: Database failed to start within $timeout seconds"
    docker compose logs db
    exit 1
fi
echo "Waiting for backend to be ready..."
counter=0
while [ $counter -lt 30 ]; do
    if curl -s http://localhost:5000/api/budgets >/dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    echo "Waiting for backend... ($counter/30)"
    sleep 2
    counter=$((counter + 2))
done
if [ $counter -ge 30 ]; then
    echo "Error: Backend failed to start within 30 seconds"
    docker-compose logs backend
    exit 1
fi
echo "Checking for existing data to migrate..."
if [ -f "./backend/budget_data.json" ] && [ -s "./backend/budget_data.json" ]; then
    echo "Found existing budget data. Running migration..."
    docker compose exec backend python migrate_data.py
else
    echo "No existing data found. Starting with clean database."
fi
echo ""
echo "BudgetAnalysis is now running with PostgreSQL!"
echo "=============================================="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000/api"
echo "Database: PostgreSQL on localhost:5432"
echo ""
echo "To view logs: docker compose logs -f [service]"
echo "To stop: docker compose down"
echo "To run tests: docker compose exec backend python test_api.py"
echo ""
