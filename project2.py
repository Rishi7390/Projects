from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__, static_folder='static')
CORS(app)  # Allow frontend to access backend

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# User table
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

# Login history table
class LoginHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    login_time = db.Column(db.DateTime, default=datetime.utcnow)

# Initialize database
with app.app_context():
    db.create_all()

# Serve main HTML file
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'project2.html')

# Serve all other static files (css, js, images)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# Registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    if User.query.filter_by(email=email).first():
        return jsonify({'status': 'error', 'message': 'Email already registered'})

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Registration successful'})

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_record = LoginHistory(user_id=user.id)
        db.session.add(login_record)
        db.session.commit()
        return jsonify({'status': 'success', 'username': user.username})
    else:
        return jsonify({'status': 'error', 'message': 'Invalid credentials'})

# Get login history route
@app.route('/login-history', methods=['GET'])
def login_history():
    history = LoginHistory.query.all()
    result = []
    for record in history:
        user = User.query.get(record.user_id)
        result.append({
            'username': user.username,
            'email': user.email,
            'login_time': record.login_time.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify(result)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000,debug=True)
