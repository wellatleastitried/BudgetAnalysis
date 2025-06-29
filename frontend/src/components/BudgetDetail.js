import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Category as CategoryIcon,
  Savings as SavingsIcon,
  ArrowBack as ArrowBackIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
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
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const BudgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainTabValue, setMainTabValue] = useState(0);
  const [visualTabValue, setVisualTabValue] = useState(0);

  const fetchBudgetDetail = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.BUDGET(id));
      setBudget(response.data);
    } catch (err) {
      setError('Failed to load budget details. Please try again.');
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.RECOMMENDATIONS(id));
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      await fetchBudgetDetail();
      await fetchRecommendations();
    };
    loadData();
  }, [fetchBudgetDetail, fetchRecommendations]);

  const getSavingsRateColor = (rate) => {
    if (rate >= 20) return 'success';
    if (rate >= 10) return 'warning';
    return 'error';
  };
  const handleVisualTabChange = (event, newValue) => {
    setVisualTabValue(newValue);
  };
  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
  };
  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'success':
        return <TrendingUpIcon color="success" />;
      case 'warning':
        return <TrendingDownIcon color="warning" />;
      case 'info':
        return <AccountBalanceIcon color="info" />;
      default:
        return <AccountBalanceIcon />;
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }
  if (error || !budget) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Budget not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  const { calculations } = budget;
  const generateBudgetCharts = () => {
    if (!calculations || !calculations.expense_breakdown) return {};
    const expenseLabels = Object.keys(calculations.expense_breakdown).map(key => {
      const labelMap = {
        'rent_mortgage': 'Rent/Mortgage',
        'car_insurance': 'Car Insurance',
        'phone_bill': 'Phone Bill',
        'miscellaneous': 'Miscellaneous',
        'liquid_savings': 'Liquid Savings',
        '401k_employee_savings': '401k Employee',
        '401k_employer_savings': '401k Employer',
        '401k_total_savings': '401k Total'
      };
      return labelMap[key] || key;
    });
    const expenseValues = Object.values(calculations.expense_breakdown);
    const expenseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#36A2EB'
    ];
    const budgetDistributionData = {
      labels: expenseLabels,
      datasets: [{
        data: expenseValues,
        backgroundColor: expenseColors.slice(0, expenseLabels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
    const monthlyIncome = calculations.monthly_income || 0;
    const totalExpenses = calculations.total_expenses || 0;
    const liquidSavings = calculations.liquid_savings || 0;
    const employee401k = calculations.monthly_401k_employee || 0;
    const employer401k = calculations.monthly_401k_employer || 0;
    const cashFlowData = {
      labels: ['Monthly Income', 'Total Expenses', 'Liquid Savings Available', 'Employee 401k', 'Employer 401k Match'],
      datasets: [{
        label: 'Monthly Cash Flow ($)',
        data: [
          monthlyIncome,
          -totalExpenses, 
          liquidSavings, 
          employee401k, 
          employer401k  
        ],
        backgroundColor: [
          '#4CAF50', 
          '#f44336', 
          '#2196F3', 
          '#FF9800', 
          '#9C27B0'  
        ],
        borderColor: [
          '#388E3C', 
          '#d32f2f', 
          '#1976D2', 
          '#F57C00',
          '#7B1FA2'
        ],
        borderWidth: 1
      }]
    };
    const months = Array.from({length: 12}, (_, i) => `Month ${i + 1}`);
    const monthlyLiquidSavings = calculations.liquid_savings || 0;
    const monthlyTotalSavings = calculations.total_monthly_savings || 0;
    const totalSavingsGrowth = months.map((_, i) => monthlyTotalSavings * (i + 1));
    const liquidSavingsGrowth = months.map((_, i) => monthlyLiquidSavings * (i + 1));
    const savingsGrowthData = {
      labels: months,
      datasets: [
        {
          label: 'Total Savings Accumulation',
          data: totalSavingsGrowth,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Liquid Savings Accumulation',
          data: liquidSavingsGrowth,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
    return {
      budgetDistribution: budgetDistributionData,
      cashFlow: cashFlowData,
      savingsGrowth: savingsGrowthData
    };
  };
  const chartData = generateBudgetCharts();
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = Math.abs(context.parsed.y);
            const label = context.dataset.label || '';
            const formattedValue = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
            return `${label}: ${formattedValue}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(Math.abs(value));
          }
        }
      }
    }
  };
  const savingsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            const formattedValue = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value);
            return `${label}: ${formattedValue}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(value);
          }
        }
      }
    }
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Paper>
          <Tabs value={mainTabValue} onChange={handleMainTabChange} variant="fullWidth">
            <Tab label="Overview" icon={<BarChartIcon />} />
            <Tab label="Advanced Analytics" icon={<AnalyticsIcon />} />
          </Tabs>
        </Paper>
      </Box>

      {mainTabValue === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Monthly Income
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(calculations.monthly_income)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CategoryIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h5" color="error">
                    {formatCurrency(calculations.total_expenses)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SavingsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Liquid Savings
                  </Typography>
                  <Typography variant="h5" color={calculations.liquid_savings > 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(calculations.liquid_savings)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    401k Contributions
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(calculations.monthly_401k_total || calculations.monthly_401k_employee)}
                  </Typography>
                  {budget.input_data?.retirement_401k > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      You: {budget.input_data.retirement_401k}% ({formatCurrency(calculations.monthly_401k_employee)})
                    </Typography>
                  )}
                  {budget.input_data?.employer_401k_match > 0 && (
                    <Typography variant="body2" color="success.main">
                      Employer: {budget.input_data.employer_401k_match}% ({formatCurrency(calculations.monthly_401k_employer)})
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 40, color: getSavingsRateColor(calculations.savings_rate), mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Savings Rate
                  </Typography>
                  <Chip 
                    label={`${calculations.savings_rate.toFixed(1)}%`}
                    color={getSavingsRateColor(calculations.savings_rate)}
                    size="large"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {recommendations.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Recommendations
              </Typography>
              <Grid container spacing={2}>
                {recommendations.map((rec, index) => (
                  <Grid item xs={12} key={index}>
                    <Card className={`recommendation-card ${rec.type}`}>
                      <CardContent>
                        <Box display="flex" alignItems="flex-start">
                          <Box sx={{ mr: 2, mt: 0.5 }}>
                            {getRecommendationIcon(rec.type)}
                          </Box>
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              {rec.title}
                            </Typography>
                            <Typography variant="body2">
                              {rec.message}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </>
      )}

      {mainTabValue === 1 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Visual Analysis & Projections
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={visualTabValue} onChange={handleVisualTabChange}>
              <Tab label="Current Overview" />
              <Tab label="1 Year Projection" />
              <Tab label="2 Year Projection" />
              <Tab label="10 Year Projection" />
            </Tabs>
          </Box>
          {visualTabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Budget Distribution
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <Doughnut data={chartData.budgetDistribution} options={doughnutOptions} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cash Flow Analysis
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <Bar data={chartData.cashFlow} options={chartOptions} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      12-Month Savings Growth Projection
                    </Typography>
                    <Box sx={{ height: 400 }}>
                      <Line data={chartData.savingsGrowth} options={savingsChartOptions} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {visualTabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  1 Year Financial Projection
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Liquid Savings
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(calculations.projections['1_year'].liquid)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Available cash savings after expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your 401k Contributions
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {formatCurrency(calculations.projections['1_year']['401k_employee'] || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Your retirement contributions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {calculations.projections['1_year']['401k_employer'] > 0 && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employer Match
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {formatCurrency(calculations.projections['1_year']['401k_employer'])}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Free money from employer
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Savings After 1 Year
                    </Typography>
                    <Typography variant="h3" color="text.primary">
                      {formatCurrency(calculations.projections['1_year'].total)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      Combined liquid savings and retirement contributions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {visualTabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  2 Year Financial Projection
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Liquid Savings
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(calculations.projections['2_years'].liquid)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Available cash savings after expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your 401k Contributions
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {formatCurrency(calculations.projections['2_years']['401k_employee'] || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Your retirement contributions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {calculations.projections['2_years']['401k_employer'] > 0 && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employer Match
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {formatCurrency(calculations.projections['2_years']['401k_employer'])}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Free money from employer
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Savings After 2 Years
                    </Typography>
                    <Typography variant="h3" color="text.primary">
                      {formatCurrency(calculations.projections['2_years'].total)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      Combined liquid savings and retirement contributions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {visualTabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  10 Year Financial Projection
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Liquid Savings
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(calculations.projections['10_years'].liquid)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Available cash savings after expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your 401k Contributions
                    </Typography>
                    <Typography variant="h4" color="primary.main">
                      {formatCurrency(calculations.projections['10_years']['401k_employee'] || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Your retirement contributions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {calculations.projections['10_years']['401k_employer'] > 0 && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Employer Match
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {formatCurrency(calculations.projections['10_years']['401k_employer'])}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Free money from employer
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Savings After 10 Years
                    </Typography>
                    <Typography variant="h3" color="text.primary">
                      {formatCurrency(calculations.projections['10_years'].total)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      Combined liquid savings and retirement contributions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Paper>
      )}
    </Container>
  );
};
export default BudgetDetail;
