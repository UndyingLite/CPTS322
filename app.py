from flask import Flask, request, session, render_template, redirect, url_for, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import re
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_secret_key_here')


users = {}

# In-memory cache for Gemini API responses
cache = {}
cache_capacity = 10

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Registration page
@app.route('/register_form')
def register_form():
    return render_template('register.html')

# Login page
@app.route('/login_form')
def login_form():
    return render_template('login.html')

# Login POST route
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

# Login GET redirect
@app.route('/login', methods=['GET'])
def login_redirect():
    return redirect(url_for('login_form'))

# Logout route
@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user', None)
    flash("You've been logged out.", "success")
    return redirect(url_for('login_form'))

# Dashboard
@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        flash("Please log in to view your dashboard.", "error")
        return redirect(url_for('login_form'))

    user_email = session['user']
    user_name = user_email.split('@')[0]
    return render_template('dashboard.html', user_name=user_name)

# Registration POST route
@app.route('/register', methods=['POST'])
def register():
    data = request.form
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    # Validation
    email_regex = r"[^@]+@[^@]+\.[^@]+"
    password_regex = r"^(?=.*[A-Za-z])(?=.*\d).{6,}$"

    if not name or not name.replace(' ', '').isalpha():
        flash("Name must contain only letters.", "error")
        return redirect(url_for('register_form'))

    if not email or not re.match(email_regex, email):
        flash("Invalid email format.", "error")
        return redirect(url_for('register_form'))

    if not password or not re.match(password_regex, password):
        flash("Password must be at least 6 characters and include letters and numbers.", "error")
        return redirect(url_for('register_form'))

    if password != confirm_password:
        flash("Passwords do not match.", "error")
        return redirect(url_for('register_form'))

    if email in users:
        flash("User already exists.", "error")
        return redirect(url_for('register_form'))

    users[email] = generate_password_hash(password)
    flash("Registration successful! You can now log in.", "success")
    return redirect(url_for('login_form'))



@app.route('/ai_suggestions')
def ai_suggestions():
    if 'user' not in session:
        flash("Please log in to access Destination Suggestions.", "error")
        return redirect(url_for('login_form'))
    return render_template('destination_suggestions.html')

@app.route('/chat')
def chat():
    if 'user' not in session:
        flash("Please log in to access the Travel Chat Assistant.", "error")
        return redirect(url_for('login_form'))
    return render_template('chat.html')

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user' not in session:
        flash("Please log in to view your profile.", "error")
        return redirect(url_for('login_form'))

    email = session['user']

    # Mock profile store (add this at the top if you haven't already)
    global user_profiles
    if 'user_profiles' not in globals():
        user_profiles = {}

    if request.method == 'POST':
        name = request.form.get('name')
        interests = request.form.get('interests')
        budget = request.form.get('budget')

        user_profiles[email] = {
            'name': name,
            'interests': interests,
            'budget': budget
        }

        flash("Profile updated successfully!", "success")
        return redirect(url_for('profile'))

    user_data = user_profiles.get(email, {})
    return render_template('profile.html', user_data=user_data)

@app.route('/reset_password', methods=['POST'])
def reset_password():
    email = request.form.get('email')
    new_password = request.form.get('new_password')

    if not email or not new_password:
        flash("Both email and new password are required.", "error")
        return redirect(url_for('request_reset'))

    if email not in users:
        flash("Email not found. Please register first.", "error")
        return redirect(url_for('request_reset'))

    users[email] = generate_password_hash(new_password)
    flash("Password reset successfully. You can now log in.", "success")
    return redirect(url_for('login_form'))





@app.route('/saved_trips')
def saved_trips():
    if 'user' not in session:
        flash("Please log in to view your saved trips.", "error")
        return redirect(url_for('login_form'))
    return render_template('saved_trips.html')

@app.route('/request_reset')
def request_reset():
    return render_template('reset_password.html')

@app.route('/api/chat', methods=['POST'])
def api_chat():
    user_message = request.json['message']
    
    if 'first_message' not in session:
        session['first_message'] = True
        greeting = " Greet the user with a friendly hello and ask if they need help with any travel related questions."
    else:
        greeting = ""

    try:
        # Configure the Gemini API
        GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')

        prompt = f"You are an AI travel buddy bot within a travel app.{greeting} The user is asking for travel advice. The user says: {user_message}. Please provide a very short quick and helpful travel suggestion or provide a long response of less than 150 words when needed referencing previous parts of the conversation if relevant. Do not start your response with the same word as the previous response."
        try:
            response = model.generate_content(prompt)
            response_text = response.text
        except Exception as gemini_error:
            return jsonify({'error': f"Gemini API error: {str(gemini_error)}"}), 500

        return jsonify({'response': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


# Run server
if __name__ == '__main__':
    app.run(debug=True)
