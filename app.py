from flask import Flask, request, jsonify, session, render_template
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  #will update this later


users = {}

@app.route('/')
def home():
    return render_template('index.html')  

@app.route('/register_form')
def register_form():
    return render_template('register.html')

@app.route('/login_form')
def login_form():
    return render_template('login.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json() if request.is_json else request.form
    email = data.get('email')
    password = data.get('password')
    

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    if '@' not in email:
        return jsonify({'error': 'Invalid email format.'}), 400
    if email in users:
        return jsonify({'error': 'User already exists.'}), 400
    
    users[email] = generate_password_hash(password)
    return jsonify({'message': 'User registered successfully.'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() if request.is_json else request.form
    email = data.get('email')
    password = data.get('password')
    

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400
    if email not in users:
        return jsonify({'error': 'User not found.'}), 404
    if not check_password_hash(users[email], password):
        return jsonify({'error': 'Invalid password.'}), 401

    session['user'] = email
    return jsonify({'message': 'Logged in successfully.'}), 200

@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully.'}), 200

if __name__ == '__main__':
    app.run(debug=True)
