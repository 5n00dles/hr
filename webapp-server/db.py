import sqlite3
from contextlib import closing
import json
import hashlib
import secrets

DB_NAME = 'employees.db'

def init_db():
    with closing(sqlite3.connect(DB_NAME)) as conn:
        with conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS employees (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    address TEXT,
                    phone_number TEXT,
                    government_id TEXT,
                    previous_experience TEXT,
                    salary_history TEXT,
                    current_position_details TEXT
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL
                )
            ''')
            conn.execute('''
                CREATE TABLE IF NOT EXISTS tokens (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            ''')

def get_all_employees():
    with closing(sqlite3.connect(DB_NAME)) as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM employees')
        return cur.fetchall()

def get_employee(emp_id):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        cur = conn.cursor()
        cur.execute('SELECT * FROM employees WHERE id=?', (emp_id,))
        return cur.fetchone()

def add_employee(data):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        with conn:
            cur = conn.cursor()
            cur.execute('''
                INSERT INTO employees (name, address, phone_number, government_id, previous_experience, salary_history, current_position_details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['name'],
                data.get('address'),
                data.get('phone_number'),
                data.get('government_id'),
                json.dumps(data.get('previous_experience', [])),
                json.dumps(data.get('salary_history', [])),
                data.get('current_position_details')
            ))
            return cur.lastrowid

def update_employee(emp_id, data):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        with conn:
            conn.execute('''
                UPDATE employees SET name=?, address=?, phone_number=?, government_id=?, previous_experience=?, salary_history=?, current_position_details=? WHERE id=?
            ''', (
                data['name'],
                data.get('address'),
                data.get('phone_number'),
                data.get('government_id'),
                json.dumps(data.get('previous_experience', [])),
                json.dumps(data.get('salary_history', [])),
                data.get('current_position_details'),
                emp_id
            ))

def delete_employee(emp_id):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        with conn:
            conn.execute('DELETE FROM employees WHERE id=?', (emp_id,))

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username, password, role):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        with conn:
            cur = conn.cursor()
            cur.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                        (username, hash_password(password), role))
            return cur.lastrowid

def authenticate_user(username, password):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        cur = conn.cursor()
        cur.execute('SELECT id, password_hash, role FROM users WHERE username=?', (username,))
        user = cur.fetchone()
        if user and user[1] == hash_password(password):
            return {'id': user[0], 'role': user[2]}
        return None

def create_token(user_id):
    token = secrets.token_hex(32)
    with closing(sqlite3.connect(DB_NAME)) as conn:
        with conn:
            conn.execute('INSERT INTO tokens (token, user_id) VALUES (?, ?)', (token, user_id))
    return token

def get_user_by_token(token):
    with closing(sqlite3.connect(DB_NAME)) as conn:
        cur = conn.cursor()
        cur.execute('''
            SELECT users.id, users.username, users.role FROM users
            JOIN tokens ON users.id = tokens.user_id
            WHERE tokens.token=?
        ''', (token,))
        user = cur.fetchone()
        if user:
            return {'id': user[0], 'username': user[1], 'role': user[2]}
        return None

def user_count():
    with closing(sqlite3.connect(DB_NAME)) as conn:
        cur = conn.cursor()
        cur.execute('SELECT COUNT(*) FROM users')
        return cur.fetchone()[0]
