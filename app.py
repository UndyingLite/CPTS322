from flask import Flask, request, session, render_template, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Replace with a secure random key in production

# In-memory user store for demonstration purposes.
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
    data = request.form
    email = data.get('email')
    password = data.get('password')

    # Basic validations
    if not email or not password:
        return render_template('register.html', error="Email and password are required.")
    if '@' not in email:
        return render_template('register.html', error="Invalid email format.")
    if email in users:
        return render_template('register.html', error="User already exists.")

    users[email] = generate_password_hash(password)
    return redirect(url_for('login_form'))

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    email = data.get('email')
    password = data.get('password')

    # Basic validations
    if not email or not password:
        return render_template('login.html', error="Email and password are required.")
    if email not in users:
        return render_template('login.html', error="User not found.")
    if not check_password_hash(users[email], password):
        return render_template('login.html', error="Invalid password.")

    session['user'] = email
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login_form'))

    user_email = session['user']
    user_name = user_email.split('@')[0]
    return render_template('dashboard.html', user_name=user_name)

@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    return redirect(url_for('login_form'))

@app.route('/request_reset')
def request_reset():
    return render_template('reset_password.html')

@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.form
    email = data.get('email')
    new_password = data.get('new_password')

    if not email or not new_password:
        return render_template('reset_password.html', error="Email and new password are required.")
    if email not in users:
        return render_template('reset_password.html', error="Email not found.")

    users[email] = generate_password_hash(new_password)
    return redirect(url_for('login_form'))

if __name__ == '__main__':
    app.run(debug=True)
