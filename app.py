from flask import Flask, request, session, render_template, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Will update this later

# In-memory user store and profile store
users = {}
user_profiles = {}

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

    if not email or not password:
        flash("Email and password are required.", "error")
        return redirect(url_for('register_form'))
    if '@' not in email:
        flash("Invalid email format.", "error")
        return redirect(url_for('register_form'))
    if email in users:
        flash("User already exists.", "error")
        return redirect(url_for('register_form'))

    users[email] = generate_password_hash(password)
    flash("Registration successful! You can now log in.", "success")
    return redirect(url_for('login_form'))

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        flash("Email and password are required.", "error")
        return redirect(url_for('login_form'))
    if email not in users:
        flash("User not found.", "error")
        return redirect(url_for('login_form'))
    if not check_password_hash(users[email], password):
        flash("Invalid password.", "error")
        return redirect(url_for('login_form'))

    session['user'] = email
    flash(f"Welcome back, {email.split('@')[0]}!", "success")
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        flash("Please log in to view your dashboard.", "error")
        return redirect(url_for('login_form'))

    user_email = session['user']
    user_name = user_email.split('@')[0]
    return render_template('dashboard.html', user_name=user_name)

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user' not in session:
        flash("Please log in to view your profile.", "error")
        return redirect(url_for('login_form'))

    email = session['user']
    user_name = email.split('@')[0]

    if request.method == 'POST':
        full_name = request.form.get('full_name')
        interests = request.form.get('interests')
        budget = request.form.get('budget')

        user_profiles[email] = {
            'full_name': full_name,
            'interests': interests,
            'budget': budget
        }

        flash("Profile updated successfully!", "success")
        return redirect(url_for('profile'))

    profile_data = user_profiles.get(email, {})
    return render_template('profile.html', user_name=user_name, profile=profile_data)

@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    flash("You’ve been logged out.", "success")
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
        flash("Email and new password are required.", "error")
        return redirect(url_for('request_reset'))
    if email not in users:
        flash("Email not found.", "error")
        return redirect(url_for('request_reset'))

    users[email] = generate_password_hash(new_password)
    flash("Password successfully reset. Please log in.", "success")
    return redirect(url_for('login_form'))

if __name__ == '__main__':
    app.run(debug=True)
