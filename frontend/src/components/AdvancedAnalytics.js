import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  CompareArrows,
  ShowChart
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { API_ENDPOINTS } from '../config/api';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdvancedAnalytics = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    fetchBudgets();
  }, []);
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.BUDGETS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBudgets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load analytics data: {error}
      </Alert>
    );
  }
  if (budgets.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No budgets available for analysis. Create a budget first to see analytics.
      </Alert>
    );
  }
  const totalIncome = budgets.reduce((sum, budget) => sum + (budget.monthly_income || 0), 0);
  const totalSavings = budgets.reduce((sum, budget) => sum + (budget.total_monthly_savings || 0), 0);
  const avgSavingsRate = budgets.length > 0 
    ? budgets.reduce((sum, budget) => sum + (budget.savings_rate || 0), 0) / budgets.length 
    : 0;
  const chartLabels = budgets.map((budget, index) => budget.name || `Budget ${index + 1}`);
  const incomeVsSavingsData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Monthly Income ($)',
        data: budgets.map(budget => budget.monthly_income || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Total Monthly Savings ($)',
        data: budgets.map(budget => budget.total_monthly_savings || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Liquid Savings ($)',
        data: budgets.map(budget => budget.liquid_savings || 0),
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
      }
    ]
  };
  const totalLiquidSavings = budgets.reduce((sum, budget) => sum + (budget.liquid_savings || 0), 0);
  const total401kEmployee = budgets.reduce((sum, budget) => sum + (budget.monthly_401k_employee || 0), 0);
  const total401kEmployer = budgets.reduce((sum, budget) => sum + (budget.monthly_401k_employer || 0), 0);
  const portfolioDistributionData = {
    labels: ['Liquid Savings', '401k Employee Contributions', '401k Employer Match'],
    datasets: [
      {
        data: [totalLiquidSavings, total401kEmployee, total401kEmployer],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 2
      }
    ]
  };
  const sortedBudgets = [...budgets].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const efficiencyTrendData = {
    labels: sortedBudgets.map((budget, index) => `Budget ${index + 1}`),
    datasets: [
      {
        label: 'Savings Rate Trend (%)',
        data: sortedBudgets.map(budget => budget.savings_rate || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Budget Scenarios'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Budget Timeline'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Savings Rate (%)'
        }
      }
    }
  };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <ShowChart sx={{ mr: 1 }} />
        Portfolio Analytics & Comparison
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Portfolio Savings Distribution
              </Typography>
              <Box sx={{ height: 400 }}>
                <Doughnut data={portfolioDistributionData} options={doughnutOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Income vs Savings Comparison
              </Typography>
              <Box sx={{ height: 400 }}>
                <Bar data={incomeVsSavingsData} options={barChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Savings Rate Trend Over Time
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line data={efficiencyTrendData} options={lineChartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Monthly Income: ${totalIncome.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Monthly Savings: ${totalSavings.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Savings Rate: {avgSavingsRate.toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default AdvancedAnalytics;
