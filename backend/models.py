from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Budget(db.Model):

    __tablename__ = 'budgets'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    input_data = db.Column(db.Text, nullable=False)
    calculations = db.Column(db.Text, nullable=False)
    charts = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, name, input_data, calculations, charts=None):
        self.name = name
        self.input_data = input_data
        self.calculations = calculations
        self.charts = charts

    def __repr__(self):
        return f'<Budget {self.id}: {self.name}>'
    
    def to_dict(self):
        try:
            input_data_dict = json.loads(self.input_data) if self.input_data else {}
            calculations_dict = json.loads(self.calculations) if self.calculations else {}
            charts_dict = json.loads(self.charts) if self.charts else {}
        except json.JSONDecodeError:
            input_data_dict = {}
            calculations_dict = {}
            charts_dict = {}
        return {
            'id': str(self.id),
            'name': self.name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'input_data': input_data_dict,
            'calculations': calculations_dict,
            'charts': charts_dict
        }
