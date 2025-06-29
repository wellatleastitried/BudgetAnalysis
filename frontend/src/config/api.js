const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BUDGETS: `${API_BASE_URL}/api/budgets`,
  CREATE_BUDGET: `${API_BASE_URL}/api/calculate`,
  BUDGET: (id) => `${API_BASE_URL}/api/budget/${id}`,
  RECOMMENDATIONS: (id) => `${API_BASE_URL}/api/recommendations/${id}`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
