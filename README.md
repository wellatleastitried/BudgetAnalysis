# Budget Analysis Dashboard

A personal finance application for budget analysis, savings optimization, and financial planning. Built with Flask (Python) backend, React frontend, and PostgreSQL database.

## Features

- **Budget Analysis**: Income, expenses, and savings calculations with 401(k) tracking
- **Visual Charts**: Interactive charts for expense breakdown, cash flow, and projections
- **Multi-year Projections**: 1, 2, and 10-year savings forecasts
- **Smart Recommendations**: Personalized financial optimization suggestions
- **Multiple Budgets**: Create and compare different budget scenarios

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd BudgetAnalysis
   cp .env.example .env  # Edit with your values
   ```

2. **Start Services**
   ```bash
   ./scripts/start_services.sh
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## Scripts

All utility scripts are located in `scripts/`:

- `start_services.sh` - Start all services with Docker
- `empty_database.sh` - Clear all database data

## API Documentation

Complete API documentation is available at [docs/API.md](docs/API.md)

### Key Endpoints
- `POST /api/calculate` - Create budget analysis
- `GET /api/budgets` - List all budgets
- `GET /api/budget/{id}` - Get budget details
- `GET /api/recommendations/{id}` - Get optimization recommendations

## Technology Stack

- **Backend**: Flask, PostgreSQL, SQLAlchemy, Chart.js
- **Frontend**: React, Material-UI, Chart.js
- **Infrastructure**: Docker, Docker Compose

## License

MIT License - see [LICENSE](LICENSE) file for details.
