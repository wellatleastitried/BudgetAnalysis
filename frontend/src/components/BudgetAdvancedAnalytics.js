import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Timeline,
  Assessment,
  Warning,
  CheckCircle
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
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const BudgetAdvancedAnalytics = ({ budget }) => {
  if (!budget || !budget.calculations) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No data available for advanced analytics
        </Typography>
      </Box>
    );
  }
  const { calculations } = budget;
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  const monthlyIncome = budget.monthly_income || 0;
  const totalExpenses = calculations.total_expenses || 0;
  const liquidSavings = calculations.liquid_savings || 0;
  const retirementSavings = (calculations.monthly_401k_total || calculations.monthly_401k_employee || 0);
  const totalSavings = budget.total_monthly_savings || 0;
  const savingsRate = calculations.savings_rate || 0;
  const emergencyFundRatio = (liquidSavings * 12) / totalExpenses; 
  const debtToIncomeRatio = 0; 
  const retirementContributionRate = (retirementSavings / monthlyIncome) * 100;
  const expenseBreakdownData = {
    labels: ['Monthly Financial Flow'],
    datasets: [
      {
        label: 'Housing',
        data: [calculations.expense_breakdown?.housing || calculations.expense_breakdown?.rent_mortgage || 0],
        backgroundColor: '#FF6384',
      },
      {
        label: 'Transportation',
        data: [calculations.expense_breakdown?.transportation || calculations.expense_breakdown?.car_insurance || 0],
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Food & Personal',
        data: [(calculations.expense_breakdown?.food || 0) + (calculations.expense_breakdown?.personal || 0)],
        backgroundColor: '#FFCE56',
      },
      {
        label: 'Utilities & Other',
        data: [(calculations.expense_breakdown?.utilities || calculations.expense_breakdown?.phone_bill || 0) + (calculations.expense_breakdown?.miscellaneous || 0)],
        backgroundColor: '#4BC0C0',
      },
      {
        label: 'Liquid Savings',
        data: [liquidSavings],
        backgroundColor: '#9966FF',
      },
      {
        label: 'Retirement',
        data: [retirementSavings],
        backgroundColor: '#FF9F40',
      }
    ]
  };
  const financialHealthData = {
    labels: [
      'Savings Rate',
      'Emergency Fund',
      'Retirement Contribution',
      'Expense Control',
      'Income Growth Potential',
      'Financial Stability'
    ],
    datasets: [{
      label: 'Financial Health Score',
      data: [
        Math.min(savingsRate * 5, 100), 
        Math.min(emergencyFundRatio * 16.67, 100), 
        Math.min(retirementContributionRate * 5, 100), 
        Math.max(100 - (totalExpenses / monthlyIncome * 100), 0), 
        75, 
        savingsRate > 10 ? 85 : 60 
      ],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  };
  const months = Array.from({length: 24}, (_, i) => `Month ${i + 1}`);
  const cumulativeSavings = months.map((_, i) => totalSavings * (i + 1));
  const cumulativeLiquid = months.map((_, i) => liquidSavings * (i + 1));
  const cumulativeRetirement = months.map((_, i) => retirementSavings * (i + 1));
  const savingsEfficiencyData = {
    labels: months,
    datasets: [
      {
        label: 'Total Savings Growth',
        data: cumulativeSavings,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Liquid Savings',
        data: cumulativeLiquid,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Retirement Savings',
        data: cumulativeRetirement,
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        tension: 0.4,
        fill: false
      }
    ]
  };
  const efficiencyScore = Math.min(savingsRate * 5, 100);
  const budgetEfficiencyData = {
    labels: ['Efficiency Score', 'Room for Improvement'],
    datasets: [{
      data: [efficiencyScore, 100 - efficiencyScore],
      backgroundColor: [
        efficiencyScore >= 80 ? '#4CAF50' : 
        efficiencyScore >= 60 ? '#FF9800' : '#f44336',
        '#e0e0e0'
      ],
      borderWidth: 0
    }]
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
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
    },
    cutout: '70%'
  };
  const getFinancialHealthInsights = () => {
    const insights = [];
    if (savingsRate >= 20) {
      insights.push({ type: 'success', text: 'Excellent savings rate! You\'re on track for financial independence.' });
    } else if (savingsRate >= 10) {
      insights.push({ type: 'warning', text: 'Good savings rate, but consider increasing to 20% for optimal growth.' });
    } else {
      insights.push({ type: 'error', text: 'Low savings rate. Focus on reducing expenses or increasing income.' });
    }
    if (emergencyFundRatio >= 6) {
      insights.push({ type: 'success', text: 'Strong emergency fund coverage (6+ months of expenses).' });
    } else if (emergencyFundRatio >= 3) {
      insights.push({ type: 'warning', text: 'Good emergency fund, but aim for 6 months of expenses.' });
    } else {
      insights.push({ type: 'error', text: 'Build your emergency fund to at least 3-6 months of expenses.' });
    }
    if (retirementContributionRate >= 15) {
      insights.push({ type: 'success', text: 'Excellent retirement savings rate!' });
    } else if (retirementContributionRate >= 10) {
      insights.push({ type: 'warning', text: 'Good retirement savings, consider increasing to 15%.' });
    } else {
      insights.push({ type: 'error', text: 'Increase retirement contributions to at least 10% of income.' });
    }
    return insights;
  };
  const insights = getFinancialHealthInsights();
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Budget Efficiency Score
              </Typography>
              <Box sx={{ height: 400, position: 'relative' }}>
                <Doughnut data={budgetEfficiencyData} options={doughnutOptions} />
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h3" color={efficiencyScore >= 80 ? 'success.main' : efficiencyScore >= 60 ? 'warning.main' : 'error.main'}>
                    {Math.round(efficiencyScore)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Efficiency
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                24-Month Savings Growth Projection
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line data={savingsEfficiencyData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default BudgetAdvancedAnalytics;
