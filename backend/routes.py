from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from models import db, Budget
import json

api = Blueprint('api', __name__, url_prefix='/api')

def calculate_budget(data):
    try:
        yearly_salary = float(data['yearly_salary'])
        pay_per_check = float(data['pay_per_check'])
        retirement_401k_value = data.get('retirement_401k')
        employer_401k_match_value = data.get('employer_401k_match')
        retirement_401k_percent = float(retirement_401k_value) if retirement_401k_value and retirement_401k_value != '' else 0.0
        employer_401k_match_percent = float(employer_401k_match_value) if employer_401k_match_value and employer_401k_match_value != '' else 0.0
        rent_mortgage = float(data['rent_mortgage'])
        car_insurance = float(data['car_insurance'])
        phone_bill = float(data['phone_bill'])
        miscellaneous = float(data['miscellaneous'])
    except (ValueError, TypeError) as e:
        raise ValueError(f"Invalid numeric input: {str(e)}")
    
    pay_frequency = data['pay_frequency']
    retirement_401k_amount = pay_per_check * (retirement_401k_percent / 100)
    employer_match_amount = pay_per_check * (employer_401k_match_percent / 100)
    total_401k_per_paycheck = retirement_401k_amount + employer_match_amount

    if pay_frequency == 'bi-weekly':
        monthly_income = pay_per_check * 26 / 12  
        monthly_401k_employee = retirement_401k_amount * 26 / 12
        monthly_401k_employer = employer_match_amount * 26 / 12
    elif pay_frequency == 'weekly':
        monthly_income = pay_per_check * 52 / 12  
        monthly_401k_employee = retirement_401k_amount * 52 / 12
        monthly_401k_employer = employer_match_amount * 52 / 12
    elif pay_frequency == 'bi-monthly':
        monthly_income = pay_per_check * 2  
        monthly_401k_employee = retirement_401k_amount * 2
        monthly_401k_employer = employer_match_amount * 2
    elif pay_frequency == 'monthly':
        monthly_income = pay_per_check
        monthly_401k_employee = retirement_401k_amount
        monthly_401k_employer = employer_match_amount
    else:
        monthly_income = yearly_salary / 12  
        monthly_401k_employee = retirement_401k_amount
        monthly_401k_employer = employer_match_amount

    monthly_401k_total = monthly_401k_employee + monthly_401k_employer
    total_expenses = rent_mortgage + car_insurance + phone_bill + miscellaneous
    liquid_savings = monthly_income - total_expenses
    total_monthly_savings = liquid_savings + monthly_401k_total
    yearly_liquid_savings = liquid_savings * 12
    yearly_401k_employee_savings = monthly_401k_employee * 12
    yearly_401k_employer_savings = monthly_401k_employer * 12
    yearly_401k_total_savings = monthly_401k_total * 12
    yearly_total_savings = total_monthly_savings * 12
    projections = {
        '1_year': {
            'liquid': yearly_liquid_savings,
            '401k_employee': yearly_401k_employee_savings,
            '401k_employer': yearly_401k_employer_savings,
            '401k_total': yearly_401k_total_savings,
            'total': yearly_total_savings
        },
        '2_years': {
            'liquid': yearly_liquid_savings * 2,
            '401k_employee': yearly_401k_employee_savings * 2,
            '401k_employer': yearly_401k_employer_savings * 2,
            '401k_total': yearly_401k_total_savings * 2,
            'total': yearly_total_savings * 2
        },
        '10_years': {
            'liquid': yearly_liquid_savings * 10,
            '401k_employee': yearly_401k_employee_savings * 10,
            '401k_employer': yearly_401k_employer_savings * 10,
            '401k_total': yearly_401k_total_savings * 10,
            'total': yearly_total_savings * 10
        }
    }
    expense_breakdown = {
        'rent_mortgage': rent_mortgage,
        'car_insurance': car_insurance,
        'phone_bill': phone_bill,
        'miscellaneous': miscellaneous,
        'liquid_savings': liquid_savings,
        '401k_employee_savings': monthly_401k_employee,
        '401k_employer_savings': monthly_401k_employer,
        '401k_total_savings': monthly_401k_total
    }
    gross_monthly_income = monthly_income + monthly_401k_employer
    savings_rate = (total_monthly_savings / gross_monthly_income) * 100 if gross_monthly_income > 0 else 0
    liquid_savings_rate = (liquid_savings / monthly_income) * 100 if monthly_income > 0 else 0
    return {
        'monthly_income': monthly_income,
        'total_expenses': total_expenses,
        'liquid_savings': liquid_savings,
        'monthly_401k_employee': monthly_401k_employee,
        'monthly_401k_employer': monthly_401k_employer,
        'monthly_401k_total': monthly_401k_total,
        'total_monthly_savings': total_monthly_savings,
        'yearly_liquid_savings': yearly_liquid_savings,
        'yearly_401k_employee_savings': yearly_401k_employee_savings,
        'yearly_401k_employer_savings': yearly_401k_employer_savings,
        'yearly_401k_total_savings': yearly_401k_total_savings,
        'yearly_total_savings': yearly_total_savings,
        'savings_rate': savings_rate,
        'liquid_savings_rate': liquid_savings_rate,
        'projections': projections,
        'expense_breakdown': expense_breakdown,
        'retirement_401k_percent': retirement_401k_percent,
        'employer_401k_match_percent': employer_401k_match_percent
    }

def generate_charts(budget_calc, budget_id):
    import matplotlib
    matplotlib.use('Agg')  
    import matplotlib.pyplot as plt
    import seaborn as sns
    import base64
    from io import BytesIO
    import numpy as np

    charts = {}
    plt.style.use('seaborn-v0_8')
    sns.set_palette("husl")
    fig, ax = plt.subplots(figsize=(10, 8))
    expenses = budget_calc['expense_breakdown']
    labels = ['Rent/Mortgage', 'Car Insurance', 'Phone Bill', 'Miscellaneous', 'Liquid Savings']
    values = [expenses['rent_mortgage'], expenses['car_insurance'], 
              expenses['phone_bill'], expenses['miscellaneous'], 
              expenses['liquid_savings']]
    
    if expenses['401k_employee_savings'] > 0:
        labels.append('Your 401k Contributions')
        values.append(expenses['401k_employee_savings'])
        
    if expenses['401k_employer_savings'] > 0:
        labels.append('Employer 401k Match')
        values.append(expenses['401k_employer_savings'])

    non_zero_data = [(label, value) for label, value in zip(labels, values) if value > 0]
    if non_zero_data:
        labels, values = zip(*non_zero_data)
    colors = sns.color_palette("husl", len(labels))
    wedges, texts, autotexts = ax.pie(values, labels=labels, autopct='%1.1f%%', 
                                      startangle=90, colors=colors)
    
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(10)
        autotext.set_weight('bold')

    ax.set_title(f'Monthly Budget Breakdown - ${sum(values):,.2f}', 
                 fontsize=16, fontweight='bold', pad=20)
    buffer = BytesIO()
    plt.tight_layout()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    chart_image = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    charts['expense_breakdown'] = chart_image
    fig, ax = plt.subplots(figsize=(12, 8))
    years = [1, 2, 10]
    liquid_savings = [budget_calc['projections']['1_year']['liquid'],
                      budget_calc['projections']['2_years']['liquid'],
                      budget_calc['projections']['10_years']['liquid']]
    total_401k_savings = [budget_calc['projections']['1_year']['401k_total'],
                          budget_calc['projections']['2_years']['401k_total'],
                          budget_calc['projections']['10_years']['401k_total']]
    width = 0.35
    x = np.arange(len(years))
    bars1 = ax.bar(x - width/2, liquid_savings, width, label='Liquid Savings', 
                   color=sns.color_palette("husl", 2)[0], alpha=0.8)
    bars2 = ax.bar(x + width/2, total_401k_savings, width, label='401k Savings (Employee + Employer)', 
                   color=sns.color_palette("husl", 2)[1], alpha=0.8)
    
    def add_value_labels(bars):
        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'${height:,.0f}',
                    ha='center', va='bottom', fontweight='bold')
            
    add_value_labels(bars1)
    add_value_labels(bars2)
    ax.set_xlabel('Years', fontsize=12, fontweight='bold')
    ax.set_ylabel('Savings Amount ($)', fontsize=12, fontweight='bold')
    ax.set_title('Savings Projections Over Time', fontsize=16, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(years)
    ax.legend()
    ax.grid(True, alpha=0.3)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    buffer = BytesIO()
    plt.tight_layout()
    plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
    buffer.seek(0)
    chart_image = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    charts['savings_projection'] = chart_image

    if budget_calc['monthly_401k_total'] > 0:
        fig, ax = plt.subplots(figsize=(10, 6))
        categories = []
        amounts = []

        if budget_calc['monthly_401k_employee'] > 0:
            categories.append('Your Contributions')
            amounts.append(budget_calc['monthly_401k_employee'])

        if budget_calc['monthly_401k_employer'] > 0:
            categories.append('Employer Match')
            amounts.append(budget_calc['monthly_401k_employer'])
        colors = sns.color_palette("Set2", len(categories))
        bars = ax.bar(categories, amounts, color=colors, alpha=0.8)

        for bar in bars:
            height = bar.get_height()
            ax.text(bar.get_x() + bar.get_width()/2., height,
                    f'${height:,.2f}',
                    ha='center', va='bottom', fontweight='bold', fontsize=12)
            
        ax.set_ylabel('Monthly Amount ($)', fontsize=12, fontweight='bold')
        ax.set_title('Monthly 401k Contributions Breakdown', fontsize=16, fontweight='bold', pad=20)
        ax.grid(True, alpha=0.3)
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
        buffer.seek(0)
        chart_image = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        charts['401k_breakdown'] = chart_image
    return charts

@api.route('/calculate', methods=['POST'])
def calculate_budget_route():
    try:
        data = request.json
        required_fields = ['yearly_salary', 'pay_per_check', 'pay_frequency', 
                          'rent_mortgage', 'car_insurance', 'phone_bill', 'miscellaneous']
        
        for field in required_fields:
            if field not in data or data[field] == '':
                return jsonify({'error': f'Missing required field: {field}'}), 400
            
        numeric_fields = ['yearly_salary', 'pay_per_check', 'rent_mortgage', 
                         'car_insurance', 'phone_bill', 'miscellaneous', 'retirement_401k', 'employer_401k_match']
        validation_errors = {}

        for field in numeric_fields:
            if field in data and data[field] != '' and data[field] is not None:
                try:
                    value = float(data[field])
                    if value < 0:
                        validation_errors[field] = 'Value must be positive'
                    elif field in ['retirement_401k', 'employer_401k_match'] and value > 100:
                        validation_errors[field] = 'Percentage cannot exceed 100%'
                except (ValueError, TypeError):
                    validation_errors[field] = 'Must be a valid number'

        if validation_errors:
            return jsonify({
                'error': 'Invalid input values',
                'validation_errors': validation_errors
            }), 400
        try:
            budget_calc = calculate_budget(data)
        except ValueError as e:
            return jsonify({
                'error': str(e),
                'validation_errors': {'general': 'Invalid numeric values provided'}
            }), 400
        
        pay_per_check = float(data['pay_per_check'])
        retirement_401k_value = data.get('retirement_401k')
        employer_401k_match_value = data.get('employer_401k_match')
        retirement_401k_percent = float(retirement_401k_value) if retirement_401k_value and retirement_401k_value != '' else 0.0
        employer_401k_match_percent = float(employer_401k_match_value) if employer_401k_match_value and employer_401k_match_value != '' else 0.0
        budget_entry = Budget(
            name=data.get('name', f"Budget {datetime.now().strftime('%Y-%m-%d %H:%M')}"),
            input_data=json.dumps(data),
            calculations=json.dumps(budget_calc)
        )
        input_data_dict = dict(data)
        input_data_dict['retirement_401k_percent'] = retirement_401k_percent
        input_data_dict['employer_401k_match_percent'] = employer_401k_match_percent
        input_data_dict['retirement_401k_amount_per_paycheck'] = pay_per_check * (retirement_401k_percent / 100)
        input_data_dict['employer_401k_match_amount_per_paycheck'] = pay_per_check * (employer_401k_match_percent / 100)
        budget_entry.input_data = json.dumps(input_data_dict)
        charts = generate_charts(budget_calc, str(budget_entry.id))
        budget_entry.charts = json.dumps(charts)
        db.session.add(budget_entry)
        db.session.commit()
        return jsonify(budget_entry.to_dict())
    except Exception as e:
        import traceback
        print(f"DEBUG: Exception occurred: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    
@api.route('/budgets', methods=['GET'])
def get_budgets():
    try:
        budgets = Budget.query.all()
        summary_budgets = []

        for budget in budgets:
            calc = json.loads(budget.calculations)
            liquid_savings = calc.get('liquid_savings', calc.get('monthly_savings', 0))
            monthly_401k_employee = calc.get('monthly_401k_employee', 0)
            monthly_401k_employer = calc.get('monthly_401k_employer', 0)
            monthly_401k_total = calc.get('monthly_401k_total', monthly_401k_employee + monthly_401k_employer)
            total_monthly_savings = calc.get('total_monthly_savings', liquid_savings + monthly_401k_total)
            summary_budgets.append({
                'id': budget.id,
                'name': budget.name,
                'created_at': budget.created_at.isoformat(),
                'liquid_savings': liquid_savings,
                'monthly_401k_employee': monthly_401k_employee,
                'monthly_401k_employer': monthly_401k_employer,
                'monthly_401k_total': monthly_401k_total,
                'total_monthly_savings': total_monthly_savings,
                'savings_rate': calc.get('savings_rate', 0),
                'monthly_income': calc.get('monthly_income', 0)
            })
        return jsonify(summary_budgets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api.route('/budget/<int:budget_id>', methods=['GET', 'DELETE'])
def handle_budget(budget_id):
    import logging
    app = current_app._get_current_object()
    app.logger.info(f"DEBUG: Received {request.method} request for budget {budget_id}")
    print(f"DEBUG: Received {request.method} request for budget {budget_id}", flush=True)
    
    if request.method == 'GET':
        try:
            budget = Budget.query.get_or_404(budget_id)
            budget_dict = budget.to_dict()

            if not budget_dict.get('charts'):
                try:
                    calc = json.loads(budget.calculations)
                    charts = generate_charts(calc, budget.id)
                    budget.charts = json.dumps(charts)
                    db.session.commit()
                    budget_dict = budget.to_dict()
                except Exception as chart_error:
                    print(f"Error generating charts for budget {budget_id}: {chart_error}")
                    budget_dict['charts'] = {}
            return jsonify(budget_dict)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            budget = Budget.query.get_or_404(budget_id)
            db.session.delete(budget)
            db.session.commit()
            return jsonify({'message': 'Budget deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@api.route('/debug', methods=['POST'])
def debug_budget():
    try:
        data = request.json
        print(f"DEBUG: Received data: {data}")
        retirement_401k = data.get('retirement_401k', '')
        employer_401k_match = data.get('employer_401k_match', '')

        if retirement_401k == '':
            retirement_401k_percent = 0.0
        else:
            retirement_401k_percent = float(retirement_401k)
        if employer_401k_match == '':
            employer_401k_match_percent = 0.0
        else:
            employer_401k_match_percent = float(employer_401k_match)

        pay_per_check = float(data.get('pay_per_check', 0))
        retirement_amount = pay_per_check * (retirement_401k_percent / 100)
        employer_amount = pay_per_check * (employer_401k_match_percent / 100)
        return jsonify({
            'success': True,
            'retirement_401k_percent': retirement_401k_percent,
            'employer_401k_match_percent': employer_401k_match_percent,
            'retirement_amount': retirement_amount,
            'employer_amount': employer_amount
        })
    except Exception as e:
        import traceback
        print(f"DEBUG: Exception occurred: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
    
@api.route('/recommendations/<int:budget_id>', methods=['GET'])
def get_recommendations(budget_id):
    try:
        budget = Budget.query.get_or_404(budget_id)
        calc = json.loads(budget.calculations)
        input_data = json.loads(budget.input_data)
        recommendations = []

        if calc['savings_rate'] < 10:
            recommendations.append({
                'type': 'warning',
                'title': 'Low Total Savings Rate',
                'message': f"Your current total savings rate (including 401k) is {calc['savings_rate']:.1f}%. Consider increasing contributions to reach the recommended 20% savings rate."
            })
        elif calc['savings_rate'] < 20:
            recommendations.append({
                'type': 'info',
                'title': 'Good Savings Rate',
                'message': f"Your total savings rate of {calc['savings_rate']:.1f}% is good. Try to reach 20% for optimal financial health."
            })
        else:
            recommendations.append({
                'type': 'success',
                'title': 'Excellent Savings Rate',
                'message': f"Your total savings rate of {calc['savings_rate']:.1f}% is excellent! You're on track for strong financial growth."
            })

        current_401k_raw = input_data.get('retirement_401k', 0)
        employer_401k_raw = input_data.get('employer_401k_match', 0)
        current_401k_percent = float(current_401k_raw) if current_401k_raw and current_401k_raw != '' else 0.0
        employer_match_percent = float(employer_401k_raw) if employer_401k_raw and employer_401k_raw != '' else 0.0

        if calc['monthly_401k_employee'] == 0:
            recommendations.append({
                'type': 'warning',
                'title': 'No 401k Contributions',
                'message': "Consider contributing to a 401k if available. It's a tax-advantaged way to save for retirement and many employers offer matching. Start with 3-5% of your paycheck."
            })
        elif current_401k_percent < 15:
            total_401k_message = f"You're currently contributing {current_401k_percent}% of your paycheck (${calc['monthly_401k_employee']:,.2f} monthly) to your 401k."
            if employer_match_percent > 0:
                total_401k_message += f" Your employer matches {employer_match_percent}% (${calc['monthly_401k_employer']:,.2f} monthly), giving you a total of ${calc['monthly_401k_total']:,.2f} monthly towards retirement!"
            total_401k_message += " Consider gradually increasing to 15-20% for optimal retirement savings."
            recommendations.append({
                'type': 'info',
                'title': 'Consider Increasing 401k',
                'message': total_401k_message
            })
        else:
            total_401k_message = f"You're contributing {current_401k_percent}% of your paycheck (${calc['monthly_401k_employee']:,.2f} monthly) to your 401k."
            if employer_match_percent > 0:
                total_401k_message += f" With your employer's {employer_match_percent}% match (${calc['monthly_401k_employer']:,.2f} monthly), your total retirement savings is ${calc['monthly_401k_total']:,.2f} monthly, or ${calc['yearly_401k_total_savings']:,.2f} annually!"
            else:
                total_401k_message += f" This equals ${calc['yearly_401k_employee_savings']:,.2f} annually towards retirement."
            total_401k_message += " Excellent planning!"
            recommendations.append({
                'type': 'success',
                'title': 'Excellent Retirement Planning',
                'message': total_401k_message
            })

        if employer_match_percent > 0:
            recommendations.append({
                'type': 'success',
                'title': 'Great Job Utilizing Employer Match!',
                'message': f"You're taking advantage of your employer's {employer_match_percent}% 401k match, which adds ${calc['monthly_401k_employer']:,.2f} monthly (${calc['yearly_401k_employer_savings']:,.2f} annually) in free money towards your retirement!"
            })
        elif current_401k_percent > 0:
            recommendations.append({
                'type': 'info',
                'title': 'Consider Adding Employer Match',
                'message': "If your employer offers 401k matching, make sure you're contributing enough to get the full match - it's free money towards your retirement!"
            })

        monthly_expenses = float(calc['total_expenses'])
        emergency_fund_target = monthly_expenses * 6
        liquid_savings = float(calc['liquid_savings'])
        recommendations.append({
            'type': 'info',
            'title': 'Emergency Fund Goal',
            'message': f"Build an emergency fund of ${emergency_fund_target:,.2f} (6 months of expenses). At your current liquid savings rate, this would take {emergency_fund_target / liquid_savings:.1f} months." if liquid_savings > 0 else f"Build an emergency fund of ${emergency_fund_target:,.2f} (6 months of expenses)."
        })
        expenses = calc['expense_breakdown']
        rent_mortgage = float(expenses['rent_mortgage'])
        monthly_income = float(calc['monthly_income'])

        if rent_mortgage / monthly_income > 0.3:
            recommendations.append({
                'type': 'warning',
                'title': 'High Housing Costs',
                'message': f"Housing costs are {(rent_mortgage / monthly_income * 100):.1f}% of income. Consider reducing to 30% or less."
            })
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api.route('/health', methods=['GET'])
def health_check():
    try:
        budget_count = Budget.query.count()

        import psutil
        import os
        
        memory = psutil.virtual_memory()
        process = psutil.Process(os.getpid())
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'database': {
                'connected': True,
                'budget_count': budget_count
            },
            'system': {
                'memory_usage_percent': memory.percent,
                'memory_available_gb': round(memory.available / 1024 / 1024 / 1024, 2),
                'cpu_count': psutil.cpu_count(),
                'process_memory_mb': round(process.memory_info().rss / 1024 / 1024, 2)
            },
            'api': {
                'version': '1.0.0',
                'endpoints': [
                    '/api/calculate',
                    '/api/budgets', 
                    '/api/budget/<id>',
                    '/api/recommendations/<id>',
                    '/api/debug',
                    '/api/health'
                ]
            }
        }
        return jsonify(health_data)
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
