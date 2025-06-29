import json
import os
from datetime import datetime
from app import app
from models import db, Budget

def migrate_json_to_db():
    DATA_FILE = '/app/data/budget_data.json' if os.path.exists('/app/data') else 'budget_data.json'

    if not os.path.exists(DATA_FILE):
        print(f"No existing data file found at {DATA_FILE}. Skipping migration.")
        return
    
    try:
        with open(DATA_FILE, 'r') as f:
            old_budgets = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error reading data file: {e}")
        return
    
    if not old_budgets:
        print("No data to migrate.")
        return
    
    print(f"Found {len(old_budgets)} budget entries to migrate...")

    with app.app_context():
        db.create_all()
        migrated_count = 0
        for old_budget in old_budgets:
            try:
                old_id = old_budget.get('id')
                if old_id:
                    existing = Budget.query.filter(
                        Budget.input_data.contains(f'"timestamp_id": "{old_id}"')
                    ).first()
                    if existing:
                        print(f"Budget with ID {old_id} already exists. Skipping.")
                        continue
                budget = Budget(
                    name=old_budget.get('name', f"Migrated Budget {datetime.now().strftime('%Y-%m-%d %H:%M')}"),
                    input_data=json.dumps({
                        **old_budget.get('input_data', {}),
                        'timestamp_id': old_id  
                    }),
                    calculations=json.dumps(old_budget.get('calculations', {})),
                    charts=json.dumps(old_budget.get('charts', {}))
                )
                if 'created_at' in old_budget:
                    try:
                        budget.created_at = datetime.fromisoformat(old_budget['created_at'].replace('Z', '+00:00'))
                    except (ValueError, AttributeError):
                        pass  
                db.session.add(budget)
                migrated_count += 1
            except Exception as e:
                print(f"Error migrating budget {old_budget.get('id', 'unknown')}: {e}")
                continue
        db.session.commit()
        print(f"Successfully migrated {migrated_count} budget entries to PostgreSQL database.")
        backup_file = f"{DATA_FILE}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        os.rename(DATA_FILE, backup_file)
        print(f"Original data file backed up to: {backup_file}")
        
if __name__ == '__main__':
    migrate_json_to_db()
