from flask import Flask, request, jsonify, send_file, abort
from db import (
    init_db, get_all_employees, get_employee, add_employee, update_employee, delete_employee,
    create_user, authenticate_user, create_token, get_user_by_token, user_count
)
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
import json

app = Flask(__name__)

# Initialize the database at startup
init_db()

# Create default admin user if no users exist
if user_count() == 0:
    create_user('admin', 'admin', 'edit')
    print('Default admin user created: username=admin, password=admin, role=edit')

def require_auth(role=None):
    def decorator(f):
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                abort(401, description='Missing or invalid token')
            token = auth_header.split(' ')[1]
            user = get_user_by_token(token)
            if not user:
                abort(401, description='Invalid token')
            if role and user['role'] != role:
                abort(403, description='Insufficient permissions')
            request.user = user
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

@app.route('/api/health')
def health_check():
    return {'status': 'healthy'}, 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = authenticate_user(data['username'], data['password'])
    if not user:
        return {'error': 'Invalid credentials'}, 401
    token = create_token(user['id'])
    return {'access_token': token, 'role': user['role']}

@app.route('/api/users', methods=['POST'])
def register_user():
    data = request.json
    if data['role'] not in ['view', 'edit']:
        return {'error': 'Invalid role'}, 400
    user_id = create_user(data['username'], data['password'], data['role'])
    return {'id': user_id}, 201

@app.route('/api/employees', methods=['GET'])
@require_auth(role=None)
def list_employees():
    employees = get_all_employees()
    return jsonify([
        {
            'id': e[0],
            'name': e[1],
            'address': e[2],
            'phone_number': e[3],
            'government_id': e[4],
            'previous_experience': json.loads(e[5]) if e[5] else [],
            'salary_history': json.loads(e[6]) if e[6] else [],
            'current_position_details': e[7]
        } for e in employees
    ])

@app.route('/api/employees/<int:emp_id>', methods=['GET'])
@require_auth(role=None)
def get_employee_details(emp_id):
    e = get_employee(emp_id)
    if not e:
        return {'error': 'Employee not found'}, 404
    return {
        'id': e[0],
        'name': e[1],
        'address': e[2],
        'phone_number': e[3],
        'government_id': e[4],
        'previous_experience': json.loads(e[5]) if e[5] else [],
        'salary_history': json.loads(e[6]) if e[6] else [],
        'current_position_details': e[7]
    }

@app.route('/api/employees', methods=['POST'])
@require_auth(role='edit')
def create_employee():
    data = request.json
    emp_id = add_employee(data)
    return {'id': emp_id}, 201

@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
@require_auth(role='edit')
def update_employee_details(emp_id):
    data = request.json
    update_employee(emp_id, data)
    return {'status': 'updated'}

@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
@require_auth(role='edit')
def delete_employee_details(emp_id):
    delete_employee(emp_id)
    return {'status': 'deleted'}

@app.route('/api/employees/pdf', methods=['GET'])
@require_auth(role='view')
def download_employees_pdf():
    employees = get_all_employees()
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    p.setFont('Helvetica', 12)
    for e in employees:
        prev_exp = json.loads(e[5]) if e[5] else []
        salary_hist = json.loads(e[6]) if e[6] else []
        text = f"ID: {e[0]}, Name: {e[1]}, Address: {e[2]}, Phone: {e[3]}, GovID: {e[4]}"
        p.drawString(40, y, text)
        y -= 20
        p.drawString(60, y, f"Current Position: {e[7]}")
        y -= 20
        p.drawString(60, y, "Previous Experience:")
        y -= 20
        for exp in prev_exp:
            p.drawString(80, y, f"Company: {exp.get('company')}, Position: {exp.get('position')}, Years: {exp.get('years')}")
            y -= 20
        p.drawString(60, y, "Salary History:")
        y -= 20
        for sal in salary_hist:
            p.drawString(80, y, f"Year: {sal.get('year')}, Salary: {sal.get('salary')} {sal.get('currency')}, Position: {sal.get('position')}")
            y -= 20
        y -= 10
        if y < 60:
            p.showPage()
            y = height - 40
    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='employees.pdf', mimetype='application/pdf')

@app.route('/api/employees/<int:emp_id>/pdf', methods=['GET'])
@require_auth(role='view')
def download_employee_pdf(emp_id):
    e = get_employee(emp_id)
    if not e:
        return {'error': 'Employee not found'}, 404
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    p.setFont('Helvetica', 12)
    prev_exp = json.loads(e[5]) if e[5] else []
    salary_hist = json.loads(e[6]) if e[6] else []
    text = f"ID: {e[0]}, Name: {e[1]}, Address: {e[2]}, Phone: {e[3]}, GovID: {e[4]}"
    p.drawString(40, y, text)
    y -= 20
    p.drawString(60, y, f"Current Position: {e[7]}")
    y -= 20
    p.drawString(60, y, "Previous Experience:")
    y -= 20
    for exp in prev_exp:
        p.drawString(80, y, f"Company: {exp.get('company')}, Position: {exp.get('position')}, Years: {exp.get('years')}")
        y -= 20
    p.drawString(60, y, "Salary History:")
    y -= 20
    for sal in salary_hist:
        p.drawString(80, y, f"Year: {sal.get('year')}, Salary: {sal.get('salary')} {sal.get('currency')}, Position: {sal.get('position')}")
        y -= 20
    p.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f'employee_{e[0]}.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
