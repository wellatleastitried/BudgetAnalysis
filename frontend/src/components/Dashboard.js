import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Monitor as MonitoringIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import SystemMonitor from './SystemMonitor';

const Dashboard = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    fetchBudgets();
  }, []);
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      console.log('Fetching budgets from:', API_ENDPOINTS.BUDGETS);
      const response = await axios.get(API_ENDPOINTS.BUDGETS);
      setBudgets(response.data);
    } catch (err) {
      setError('Failed to load budgets. Please try again.');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };
  const deleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(API_ENDPOINTS.BUDGET(budgetId));
        setBudgets(budgets.filter(budget => budget.id !== budgetId));
      } catch (err) {
        setError('Failed to delete budget. Please try again.');
        console.error('Error deleting budget:', err);
      }
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const getSavingsRateColor = (rate) => {
    if (rate >= 20) return 'success';
    if (rate >= 10) return 'warning';
    return 'error';
  };
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Budget Analysis Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your budget plans and track your financial goals
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Budget Overview" icon={<AccountBalanceIcon />} />
          <Tab label="System Monitoring" icon={<MonitoringIcon />} />
        </Tabs>
      </Paper>
      {activeTab === 0 && (
        budgets.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <AccountBalanceIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No budgets created yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Create your first budget to start analyzing your finances
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/create')}
                startIcon={<TrendingUpIcon />}
              >
                Create Your First Budget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budget) => (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card className="budget-card" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {budget.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {formatDate(budget.created_at)}
                    </Typography>
                    <Box sx={{ my: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Monthly Income:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(budget.monthly_income)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Liquid Savings:</Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={budget.liquid_savings > 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(budget.liquid_savings)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">401k Savings:</Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color="primary.main"
                        >
                          {formatCurrency(budget.monthly_401k_total || budget.monthly_401k_employee || budget.monthly_401k || 0)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2">Total Savings:</Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={budget.total_monthly_savings > 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(budget.total_monthly_savings)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Savings Rate:</Typography>
                        <Chip 
                          label={`${budget.savings_rate.toFixed(1)}%`}
                          color={getSavingsRateColor(budget.savings_rate)}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/budget/${budget.id}`)}
                      variant="contained"
                    >
                      View Details
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => deleteBudget(budget.id)}
                      color="error"
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}
      {activeTab === 1 && <SystemMonitor />}
    </Container>
  );
};
export default Dashboard;
