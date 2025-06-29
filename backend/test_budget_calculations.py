import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from models import db, Budget
from routes import calculate_budget

class TestBudgetCalculations(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_calculate_budget_basic(self):
        data = {
            'yearly_salary': '60000',
            'pay_per_check': '2307.69',
            'pay_frequency': 'bi-weekly',
            'retirement_401k': '',
            'employer_401k_match': '',
            'rent_mortgage': '1200',
            'car_insurance': '150',
            'phone_bill': '80',
            'miscellaneous': '300'
        }
        result = calculate_budget(data)
        self.assertAlmostEqual(result['monthly_income'], 5000, places=0)
        self.assertEqual(result['total_expenses'], 1730)
        self.assertAlmostEqual(result['liquid_savings'], 3270, places=0)
        self.assertAlmostEqual(result['savings_rate'], 65.4, places=0)

    def test_calculate_budget_with_401k(self):
        data = {
            'yearly_salary': '75000',
            'pay_per_check': '2884.62',
            'pay_frequency': 'bi-weekly',
            'retirement_401k': '10',
            'employer_401k_match': '5',
            'rent_mortgage': '1200',
            'car_insurance': '150',
            'phone_bill': '80',
            'miscellaneous': '300'
        }
        result = calculate_budget(data)
        self.assertAlmostEqual(result['monthly_401k_employee'], 625, places=0)
        self.assertAlmostEqual(result['monthly_401k_employer'], 312.5, places=0)
        self.assertAlmostEqual(result['monthly_401k_total'], 937.5, places=0)
        self.assertGreater(result['savings_rate'], 50)
        self.assertGreater(result['liquid_savings_rate'], 40)

    def test_api_calculate_endpoint(self):
        data = {
            'name': 'Test Budget API',
            'yearly_salary': '60000',
            'pay_per_check': '2307.69',
            'pay_frequency': 'bi-weekly',
            'retirement_401k': '5',
            'employer_401k_match': '3',
            'rent_mortgage': '1200',
            'car_insurance': '150',
            'phone_bill': '80',
            'miscellaneous': '300'
        }
        response = self.client.post('/api/calculate', 
                                   data=json.dumps(data),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertIn('id', result)
        self.assertIn('calculations', result)
        self.assertIn('charts', result)
        self.assertEqual(result['name'], 'Test Budget API')

    def test_api_get_budgets(self):
        data = {
            'name': 'Test Budget List',
            'yearly_salary': '50000',
            'pay_per_check': '1923.08',
            'pay_frequency': 'bi-weekly',
            'retirement_401k': '',
            'employer_401k_match': '',
            'rent_mortgage': '1000',
            'car_insurance': '100',
            'phone_bill': '70',
            'miscellaneous': '200'
        }
        self.client.post('/api/calculate', 
                        data=json.dumps(data),
                        content_type='application/json')
        response = self.client.get('/api/budgets')
        self.assertEqual(response.status_code, 200)
        budgets = json.loads(response.data)
        self.assertIsInstance(budgets, list)
        self.assertGreater(len(budgets), 0)
        self.assertEqual(budgets[0]['name'], 'Test Budget List')

    def test_invalid_data_handling(self):
        data = {
            'name': 'Invalid Budget',
            'yearly_salary': 'not_a_number',
            'pay_per_check': '2000',
            'pay_frequency': 'bi-weekly',
            'retirement_401k': '',
            'employer_401k_match': '',
            'rent_mortgage': '1200',
            'car_insurance': '150',
            'phone_bill': '80',
            'miscellaneous': '300'
        }
        response = self.client.post('/api/calculate', 
                                   data=json.dumps(data),
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)

    def test_pay_frequency_calculations(self):
        base_data = {
            'yearly_salary': '52000',
            'pay_per_check': '2000',
            'retirement_401k': '',
            'employer_401k_match': '',
            'rent_mortgage': '1200',
            'car_insurance': '150',
            'phone_bill': '80',
            'miscellaneous': '300'
        }
        weekly_data = {**base_data, 'pay_frequency': 'weekly'}
        weekly_result = calculate_budget(weekly_data)
        biweekly_data = {**base_data, 'pay_frequency': 'bi-weekly'}
        biweekly_result = calculate_budget(biweekly_data)
        monthly_data = {**base_data, 'pay_frequency': 'monthly'}
        monthly_result = calculate_budget(monthly_data)
        self.assertGreater(weekly_result['monthly_income'], 
                          biweekly_result['monthly_income'])
        
if __name__ == '__main__':
    unittest.main()
