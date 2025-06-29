import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BudgetForm from '../BudgetForm';

jest.mock('../../config/api', () => ({
  calculateBudget: jest.fn()
}));

const MockedBudgetForm = () => (
  <BrowserRouter>
    <BudgetForm />
  </BrowserRouter>
);
describe('BudgetForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('renders budget form with all required fields', () => {
    render(<MockedBudgetForm />);
    expect(screen.getByLabelText(/budget name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/yearly salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pay per check/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pay frequency/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rent\/mortgage/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/car insurance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone bill/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/miscellaneous/i)).toBeInTheDocument();
  });
  test('validates required fields', async () => {
    render(<MockedBudgetForm />);
    const submitButton = screen.getByRole('button', { name: /calculate budget/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/budget name is required/i)).toBeInTheDocument();
    });
  });
  test('updates input values correctly', () => {
    render(<MockedBudgetForm />);
    const salaryInput = screen.getByLabelText(/yearly salary/i);
    fireEvent.change(salaryInput, { target: { value: '75000' } });
    expect(salaryInput.value).toBe('75000');
  });
  test('submits form with valid data', async () => {
    const mockCalculateBudget = require('../../config/api').calculateBudget;
    mockCalculateBudget.mockResolvedValue({
      data: {
        id: 1,
        calculations: {
          liquid_savings: 2000,
          savings_rate: 25.5
        }
      }
    });
    render(<MockedBudgetForm />);
    fireEvent.change(screen.getByLabelText(/budget name/i), { target: { value: 'Test Budget' } });
    fireEvent.change(screen.getByLabelText(/yearly salary/i), { target: { value: '75000' } });
    fireEvent.change(screen.getByLabelText(/pay per check/i), { target: { value: '2885' } });
    fireEvent.change(screen.getByLabelText(/rent\/mortgage/i), { target: { value: '1200' } });
    fireEvent.change(screen.getByLabelText(/car insurance/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/phone bill/i), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText(/miscellaneous/i), { target: { value: '300' } });
    const submitButton = screen.getByRole('button', { name: /calculate budget/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockCalculateBudget).toHaveBeenCalledWith({
        name: 'Test Budget',
        yearly_salary: '75000',
        pay_per_check: '2885',
        pay_frequency: 'bi-weekly',
        retirement_401k: '',
        employer_401k_match: '',
        rent_mortgage: '1200',
        car_insurance: '150',
        phone_bill: '80',
        miscellaneous: '300'
      });
    });
  });
});
