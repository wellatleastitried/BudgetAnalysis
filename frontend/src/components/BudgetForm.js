import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const BudgetForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    yearly_salary: '',
    pay_frequency: 'bi-weekly',
    pay_per_check: '',
    retirement_401k: '',
    employer_401k_match: '',
    rent_mortgage: '',
    car_insurance: '',
    phone_bill: '',
    miscellaneous: '',
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  const validateForm = () => {
    const requiredFields = [
      'yearly_salary', 'pay_per_check', 'rent_mortgage', 
      'car_insurance', 'phone_bill', 'miscellaneous'
    ];
    for (const field of requiredFields) {
      if (!formData[field] || parseFloat(formData[field]) < 0) {
        setError(`Please enter a valid value for ${field.replace('_', ' ')}`);
        return false;
      }
    }
    if (!formData.name.trim()) {
      setError('Please enter a name for this budget');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.CREATE_BUDGET, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/budget/${response.data.id}`);
      }, 1500);
    } catch (err) {
      if (err.response?.data?.validation_errors) {
        setValidationErrors(err.response.data.validation_errors);
        setError(err.response.data.error || 'Please correct the highlighted fields.');
      } else {
        setError(err.response?.data?.error || 'Failed to create budget. Please try again.');
      }
      console.error('Error creating budget:', err);
    } finally {
      setLoading(false);
    }
  };
  const payFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly (Every 2 weeks)' },
    { value: 'bi-monthly', label: 'Bi-monthly (Twice a month)' },
    { value: 'monthly', label: 'Monthly' },
  ];
  if (success) {
    return (
      <Container maxWidth="sm">
        <Box textAlign="center" mt={8}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Budget created successfully! Redirecting to analysis...
          </Alert>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  return (
    <Container maxWidth="md">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Budget Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your financial information to generate a comprehensive budget analysis
        </Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                error={!!validationErrors.name}
                helperText={validationErrors.name || "Give this budget analysis a name"}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Income Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yearly Salary (Before Taxes)"
                name="yearly_salary"
                type="number"
                value={formData.yearly_salary}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!validationErrors.yearly_salary}
                helperText={validationErrors.yearly_salary || "Your gross annual salary"}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Pay Frequency</InputLabel>
                <Select
                  name="pay_frequency"
                  value={formData.pay_frequency}
                  onChange={handleInputChange}
                  label="Pay Frequency"
                >
                  {payFrequencyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Take-Home Pay Per Paycheck"
                name="pay_per_check"
                type="number"
                value={formData.pay_per_check}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!validationErrors.pay_per_check}
                helperText={validationErrors.pay_per_check || "Amount after taxes and deductions"}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="401k Contribution Percentage"
                name="retirement_401k"
                type="number"
                value={formData.retirement_401k}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.5
                }}
                error={!!validationErrors.retirement_401k}
                helperText={validationErrors.retirement_401k || "Percentage of each paycheck (0-100%, optional)"}
              />
            </Grid>
            {formData.retirement_401k && parseFloat(formData.retirement_401k) > 0 && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employer 401k Match Percentage"
                  name="employer_401k_match"
                  type="number"
                  value={formData.employer_401k_match}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  inputProps={{
                    min: 0,
                    max: 100,
                    step: 0.5
                  }}
                  error={!!validationErrors.employer_401k_match}
                  helperText={validationErrors.employer_401k_match || "Employer matching percentage (optional)"}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Monthly Expenses
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rent/Mortgage Payment"
                name="rent_mortgage"
                type="number"
                value={formData.rent_mortgage}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Car Insurance"
                name="car_insurance"
                type="number"
                value={formData.car_insurance}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Bill"
                name="phone_bill"
                type="number"
                value={formData.phone_bill}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Miscellaneous Expenses"
                name="miscellaneous"
                type="number"
                value={formData.miscellaneous}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Netflix, Hulu, groceries, etc."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
                  sx={{ minWidth: 200 }}
                >
                  {loading ? 'Creating Analysis...' : 'Create Budget Analysis'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};
export default BudgetForm;
