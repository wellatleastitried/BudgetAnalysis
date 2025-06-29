# Budget Analysis API Documentation

## Overview

The Budget Analysis API provides endpoints for calculating, storing, and managing personal budget data. It includes budget calculations, 401(k) planning, savings projections, and financial recommendations.

**Base URL:** `http://localhost:5000/api`

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Endpoints

### 1. Calculate Budget

**`POST /calculate`**

Creates a new budget calculation based on user input data.

#### Request Body

```json
{
  "name": "My Budget Plan",
  "yearly_salary": 75000,
  "pay_per_check": 2884.62,
  "pay_frequency": "bi-weekly",
  "rent_mortgage": 1200,
  "car_insurance": 150,
  "phone_bill": 75,
  "miscellaneous": 500,
  "retirement_401k": 10.5,
  "employer_401k_match": 5.0
}
```

#### Required Fields
- `name` (string): Budget plan name
- `yearly_salary` (number): Annual gross salary
- `pay_per_check` (number): Take-home pay per paycheck
- `pay_frequency` (string): One of "weekly", "bi-weekly", "bi-monthly", "monthly"
- `rent_mortgage` (number): Monthly housing costs
- `car_insurance` (number): Monthly car insurance
- `phone_bill` (number): Monthly phone bill
- `miscellaneous` (number): Monthly miscellaneous expenses

#### Optional Fields
- `retirement_401k` (number): Employee 401(k) contribution percentage (0-100)
- `employer_401k_match` (number): Employer 401(k) match percentage (0-100)

#### Response

```json
{
  "id": 1,
  "name": "My Budget Plan",
  "created_at": "2025-06-29T05:30:00.000000",
  "input_data": { /* original input data */ },
  "calculations": {
    "monthly_income": 6250.68,
    "total_expenses": 1925.0,
    "liquid_savings": 4325.68,
    "monthly_401k_employee": 656.32,
    "monthly_401k_employer": 312.53,
    "monthly_401k_total": 968.85,
    "total_monthly_savings": 5294.53,
    "savings_rate": 84.7,
    "liquid_savings_rate": 69.2,
    "expense_breakdown": {
      "rent_mortgage": 1200,
      "car_insurance": 150,
      "phone_bill": 75,
      "miscellaneous": 500,
      "liquid_savings": 4325.68,
      "401k_employee_savings": 656.32,
      "401k_employer_savings": 312.53,
      "401k_total_savings": 968.85
    },
    "projections": {
      "1_year": {
        "liquid": 51908.16,
        "401k_employee": 7875.84,
        "401k_employer": 3750.36,
        "401k_total": 11626.2,
        "total": 63534.36
      },
      "2_years": { /* 2-year projections */ },
      "10_years": { /* 10-year projections */ }
    }
  },
  "charts": { /* base64 encoded chart images */ }
}
```

### 2. Get All Budgets

**`GET /budgets`**

Retrieves a summary list of all saved budgets.

#### Response

```json
[
  {
    "id": 1,
    "name": "My Budget Plan",
    "created_at": "2025-06-29T05:30:00.000000",
    "liquid_savings": 4325.68,
    "monthly_401k_employee": 656.32,
    "monthly_401k_employer": 312.53,
    "monthly_401k_total": 968.85,
    "total_monthly_savings": 5294.53,
    "savings_rate": 84.7,
    "monthly_income": 6250.68
  }
]
```

### 3. Get Budget by ID

**`GET /budget/{id}`**

Retrieves detailed information for a specific budget, including full calculations and charts.

#### Parameters
- `id` (integer): Budget ID

#### Response

Same as the `/calculate` response format, including complete budget data, calculations, and generated charts.

### 4. Get Budget Recommendations

**`GET /recommendations/{id}`**

Provides personalized financial recommendations based on a specific budget.

#### Parameters
- `id` (integer): Budget ID

#### Response

```json
[
  {
    "type": "warning",
    "title": "Low Savings Rate",
    "message": "Your savings rate is 8.5%. Consider aiming for at least 10-20% of your income."
  },
  {
    "type": "success",
    "title": "Great 401(k) Contribution",
    "message": "You're maximizing your employer 401(k) match. Keep it up!"
  },
  {
    "type": "info",
    "title": "Housing Costs",
    "message": "Housing costs are 32% of income. Consider reducing to 30% or less."
  }
]
```

#### Recommendation Types
- `success`: Positive financial behaviors
- `warning`: Areas needing attention
- `info`: General advice and tips

### 5. Debug Endpoint

**`POST /debug`**

Development endpoint for testing budget calculations.

#### Request Body

```json
{
  "pay_per_check": 2500,
  "retirement_401k": "10",
  "employer_401k_match": "5"
}
```

#### Response

```json
{
  "success": true,
  "retirement_401k_percent": 10.0,
  "employer_401k_match_percent": 5.0,
  "retirement_amount": 250.0,
  "employer_amount": 125.0
}
```

### 6. Health Check

**`GET /health`**

System health and monitoring endpoint.

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-06-29T05:30:00.000000",
  "database": {
    "connected": true,
    "budget_count": 5
  },
  "system": {
    "memory_usage_percent": 45.2,
    "memory_available_gb": 8.5,
    "cpu_count": 8,
    "process_memory_mb": 125.3
  },
  "api": {
    "version": "1.0.0",
    "endpoints": [
      "/api/calculate",
      "/api/budgets",
      "/api/budget/<id>",
      "/api/recommendations/<id>",
      "/api/debug",
      "/api/health"
    ]
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format

```json
{
  "error": "Description of the error",
  "validation_errors": {
    "field_name": "Specific field error message"
  }
}
```

## Data Models

### Budget Calculation Model

The core calculation logic considers:

1. **Income**: Monthly take-home pay calculated from pay frequency
2. **Expenses**: Fixed monthly expenses (housing, insurance, etc.)
3. **401(k) Contributions**: Employee and employer contributions
4. **Savings**: Liquid savings after expenses
5. **Projections**: 1, 2, and 10-year savings projections

### Savings Rate Calculation

```
Total Monthly Savings = Liquid Savings + Total 401(k) Contributions
Savings Rate = (Total Monthly Savings / Gross Monthly Income) × 100
```

Where Gross Monthly Income includes employer 401(k) contributions.

## Usage Examples

### Creating a Budget

```bash
curl -X POST http://localhost:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My 2025 Budget",
    "yearly_salary": 75000,
    "pay_per_check": 2300,
    "pay_frequency": "bi-weekly",
    "rent_mortgage": 1200,
    "car_insurance": 150,
    "phone_bill": 75,
    "miscellaneous": 400,
    "retirement_401k": 10,
    "employer_401k_match": 5
  }'
```

### Getting All Budgets

```bash
curl http://localhost:5000/api/budgets
```

### Getting Budget Details

```bash
curl http://localhost:5000/api/budget/1
```

### Getting Recommendations

```bash
curl http://localhost:5000/api/recommendations/1
```

## Development Notes

- Charts are generated server-side using matplotlib and returned as base64-encoded images
- The API uses PostgreSQL for data persistence
- CORS is configured to allow requests from the frontend application
- All monetary values are stored and returned as floating-point numbers
