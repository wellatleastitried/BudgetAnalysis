import requests
import json
import time

def test_api():
    base_url = "http://localhost:5000/api"
    test_budget_data = {
        "name": "Test Budget",
        "yearly_salary": "75000",
        "pay_per_check": "2884.62",
        "pay_frequency": "bi-weekly",
        "retirement_401k": "10",
        "employer_401k_match": "3",
        "rent_mortgage": "1200",
        "car_insurance": "150",
        "phone_bill": "80",
        "miscellaneous": "300"
    }

    print("Testing Budget Analysis API...")
    print("=" * 50)
    print("1. Testing budget calculation...")

    try:
        response = requests.post(f"{base_url}/calculate", json=test_budget_data)
        if response.status_code == 200:
            budget_result = response.json()
            budget_id = budget_result['id']
            print(f"Budget created successfully with ID: {budget_id}")
            print(f"   Monthly savings: ${budget_result['calculations']['liquid_savings']:.2f}")
            print(f"   Savings rate: {budget_result['calculations']['savings_rate']:.1f}%")
        else:
            print(f"Failed to create budget: {response.status_code} - {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print("Could not connect to API. Make sure the server is running.")
        return
    except Exception as e:
        print(f"Error creating budget: {e}")
        return
    
    print("\n2. Testing get all budgets...")

    try:
        response = requests.get(f"{base_url}/budgets")
        if response.status_code == 200:
            budgets = response.json()
            print(f"Retrieved {len(budgets)} budget(s)")
        else:
            print(f"Failed to get budgets: {response.status_code}")
    except Exception as e:
        print(f"Error getting budgets: {e}")

    print(f"\n3. Testing get specific budget (ID: {budget_id})...")

    try:
        response = requests.get(f"{base_url}/budget/{budget_id}")
        if response.status_code == 200:
            budget = response.json()
            print(f"Retrieved budget: {budget['name']}")
            print(f"   Has charts: {'Yes' if budget.get('charts') else 'No'}")
        else:
            print(f"Failed to get budget: {response.status_code}")
    except Exception as e:
        print(f"Error getting budget: {e}")

    print(f"\n4. Testing recommendations (ID: {budget_id})...")

    try:
        response = requests.get(f"{base_url}/recommendations/{budget_id}")
        if response.status_code == 200:
            recommendations = response.json()
            print(f"Retrieved {len(recommendations)} recommendation(s)")
            for rec in recommendations[:2]:  
                print(f"   - {rec['title']} ({rec['type']})")
        else:
            print(f"Failed to get recommendations: {response.status_code}")
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        
    print("\n" + "=" * 50)
    print("API testing completed!")

if __name__ == '__main__':
    test_api()
