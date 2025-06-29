import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Button,
  Alert
} from '@mui/material';
import {
  Memory,
  Speed,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import { green, red, orange } from '@mui/material/colors';
import { API_ENDPOINTS } from '../config/api';

const SystemMonitor = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.HEALTH);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHealthData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return green[500];
      case 'warning':
        return orange[500];
      case 'unhealthy':
        return red[500];
      default:
        return 'gray';
    }
  };
  const getMemoryColor = (percent) => {
    if (percent < 70) return green[500];
    if (percent < 85) return orange[500];
    return red[500];
  };
  if (loading && !healthData) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <LinearProgress style={{ flex: 1 }} />
            <Typography variant="body2">Loading system status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={fetchHealthData}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            }
          >
            Failed to load system status: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            System Status
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              size="small"
              onClick={fetchHealthData}
              startIcon={<Refresh />}
              disabled={loading}
            >
              Refresh
            </Button>
            <Chip
              icon={healthData?.status === 'healthy' ? <CheckCircle /> : <Error />}
              label={healthData?.status || 'Unknown'}
              style={{
                backgroundColor: getStatusColor(healthData?.status),
                color: 'white'
              }}
              size="small"
            />
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Database
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={healthData?.database?.connected ? <CheckCircle /> : <Error />}
                  label={healthData?.database?.connected ? 'Connected' : 'Disconnected'}
                  color={healthData?.database?.connected ? 'success' : 'error'}
                  size="small"
                />
                <Typography variant="body2" color="textSecondary">
                  Budgets: {healthData?.database?.budget_count || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                <Speed style={{ verticalAlign: 'middle', marginRight: 4 }} />
                System Resources
              </Typography>
              <Typography variant="body2" color="textSecondary">
                CPU Cores: {healthData?.system?.cpu_count}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Process Memory: {healthData?.system?.process_memory_mb?.toFixed(1)} MB
              </Typography>
            </Box>
          </Grid>
        </Grid>
        {lastUpdated && (
          <Box mt={2} textAlign="center">
            <Typography variant="caption" color="textSecondary">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
export default SystemMonitor;
