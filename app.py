from flask import Flask, request, session, render_template, redirect, url_for, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
import re
import json
import google.generativeai as genai 
import requests
# Load environment variables
load_dotenv()

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_secret_key_here')

# In-memory user storage with saved trips
users = {}

# In-memory cache for Gemini API responses
cache = {}
cache_capacity = 10

# In-memory profile store
user_profiles = {}

# Home route
@app.route('/')
def home():
    return render_template('index.html')


def get_weather(city):
    api_key = os.getenv("WEATHER_API_KEY")
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=imperial"

    try:
        response = requests.get(url)
        data = response.json()
        if response.status_code == 200:
            weather = {
                'description': data['weather'][0]['description'].title(),
                'temp': data['main']['temp'],
                'icon': data['weather'][0]['icon']
            }
            return weather
    except Exception as e:
        print(f"Weather error for {city}: {e}")
    return None

@app.route('/api/get_weather')
def api_get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({'error': 'City is required'}), 400

    weather = get_weather(city)
    if weather:
        return jsonify(weather)
    else:
        return jsonify({'error': 'Weather data not found'}), 404


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
    if not check_password_hash(users[email]['password'], password):
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

    email = session['user']

    global user_profiles
    if 'user_profiles' not in globals():
        user_profiles = {}

    user_data = user_profiles.get(email)
    if user_data and user_data.get('name'):
        display_name = user_data['name']
    else:
        display_name = email.split('@')[0]

    # Set Pullman as default city
    default_city = "Pullman"
    weather = get_weather(default_city)

    return render_template('dashboard.html', user_name=display_name, weather=weather, default_city=default_city)




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

    # Store user data with password and empty saved_trips list
    users[email] = {
        'password': generate_password_hash(password),
        'saved_trips': []
    }
    flash("Registration successful! You can now log in.", "success")
    return redirect(url_for('login_form'))

@app.route('/ai_suggestions')
def ai_suggestions():
    if 'user' not in session:
        flash("Please log in to access Destination Suggestions.", "error")
        return redirect(url_for('login_form'))
    
    user_email = session['user']
    user_name = user_email.split('@')[0]
    
    # Fetch user profile for default interests
    user_data = user_profiles.get(user_email, {})
    profile_data = {'interests': user_data.get('interests', '')}
    
    return render_template('destination_suggestions.html', user_name=user_name, profile=profile_data)

@app.route('/chat')
def chat():
    if 'user' not in session:
        flash("Please log in to access the Travel Chat Assistant.", "error")
        return redirect(url_for('login_form'))
    
    user_email = session['user']
    user_name = user_email.split('@')[0]
    return render_template('chat.html', user_name=user_name)

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user' not in session:
        flash("Please log in to view your profile.", "error")
        return redirect(url_for('login_form'))

    email = session['user']
    user_name = email.split('@')[0]

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
    return render_template('profile.html', user_name=user_name, user_data=user_data)

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

    users[email]['password'] = generate_password_hash(new_password)
    flash("Password reset successfully. You can now log in.", "success")
    return redirect(url_for('login_form'))

@app.route('/saved_trips')
def saved_trips():
    if 'user' not in session:
        flash("Please log in to view your saved trips.", "error")
        return redirect(url_for('login_form'))

    user_email = session['user']
    user_name = user_email.split('@')[0]

    user_data = users.get(user_email, {})
    destinations = user_data.get('saved_trips', [])
    planned_trips = session.get('planned_trips', [])

    # Prepare weather data
    weather_data = {}

    for dest in destinations:
        city_name = dest.get('name')
        weather_data[city_name] = get_weather(city_name)

    for trip in planned_trips:
        city_name = trip.get('destination')
        weather_data[city_name] = get_weather(city_name)

    return render_template('saved_trips.html', user_name=user_name, destinations=destinations, trips=planned_trips, weather_data=weather_data)



@app.route('/plan_trip', methods=['GET', 'POST'])
def plan_trip():
    if request.method == 'POST':
        destination = request.form['destination']
        start_date = request.form['start_date']
        end_date = request.form['end_date']
        budget = request.form['budget']
        interests = request.form['interests']

        trip = {
            'destination': destination,
            'start_date': start_date,
            'end_date': end_date,
            'budget': budget,
            'interests': interests
        }

        # Store in session (or append if multiple trips)
        if 'planned_trips' not in session:
            session['planned_trips'] = []
        session['planned_trips'].append(trip)

        flash("🎉 Trip Planned Successfully!", "success")
        return render_template('plan_trip_result.html', trip=trip)

    return render_template('plan_trip.html')


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

@app.route('/api/save_conversation', methods=['POST'])
def save_conversation():
    messages = request.json['messages']
    # In a real application, you would save the messages to a database
    print("Saving conversation:", messages)
    return jsonify({'status': 'success', 'message': 'Conversation saved successfully!'})

@app.route('/api/destination_suggestions', methods=['POST'])
def destination_suggestions_api():
    if 'user' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Get form data from request
    data = request.json
    
    try:
        # Configure the Gemini API
        GOOGLE_API_KEY = os.environ.get("GEMINI_API_KEY")
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Create prompt based on user preferences
        prompt = f"""Suggest 3 travel destinations based on the following preferences:
        - Budget: {data.get('budget', 'Any')}
        - Trip Duration: {data.get('duration', 'Any')} days
        - Interests: {data.get('interests', 'General travel')}
        - Climate: {data.get('climate', 'Any')}
        - Travel Style: {data.get('travelStyle', 'Any')}
        - Previously visited: {data.get('previousDestinations', 'None')}
        
        For each destination, provide:
        1. Name of the destination
        2. A brief description (2-3 sentences)
        3. 3 key attractions
        4. Best time to visit
        5. Estimated daily budget in USD
        
        IMPORTANT: Your response MUST be a valid JSON object with EXACTLY this structure and nothing else:
        {{
            "destinations": [
                {{
                    "name": "Destination Name",
                    "description": "Description text",
                    "attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
                    "bestTimeToVisit": "Best time info",
                    "estimatedDailyBudget": "Budget range"
                }}
            ]
        }}
        
        Do not include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON object.
        """
        
        try:
            response = model.generate_content(prompt)
            response_text = response.text
            
            # Clean up the response text to extract just the JSON part
            response_text = response_text.replace('```json', '').replace('```', '')
            response_text = response_text.strip()
            
            # Try to parse as JSON
            try:
                result = json.loads(response_text)
                
                # Validate the structure
                if 'destinations' not in result or not isinstance(result['destinations'], list):
                    raise ValueError("Invalid JSON structure: missing 'destinations' array")
                
                # Ensure each destination has the required fields
                for dest in result['destinations']:
                    required_fields = ['name', 'description', 'attractions', 'bestTimeToVisit', 'estimatedDailyBudget']
                    for field in required_fields:
                        if field not in dest:
                            dest[field] = "Not specified" if field != 'attractions' else ["Not specified"]
                    
                    # Ensure attractions is a list
                    if not isinstance(dest['attractions'], list):
                        dest['attractions'] = [dest['attractions']]
                
                return jsonify(result)
            except json.JSONDecodeError as json_error:
                print(f"Invalid JSON from API: {str(json_error)}")
                print(f"Response text: {response_text}")
                
                # Try to extract JSON using regex if there's extra text
                import re
                json_match = re.search(r'({[\s\S]*})', response_text)
                if json_match:
                    try:
                        extracted_json = json_match.group(1)
                        result = json.loads(extracted_json)
                        return jsonify(result)
                    except:
                        pass
                
                # Generate mock data as fallback
                mock_destinations = generate_mock_destinations(data)
                print("USING FALLBACK MOCK DATA - NOT GEMINI API RESPONSE")
                return jsonify({"destinations": mock_destinations})
                
        except Exception as gemini_error:
            print(f"Gemini API error: {str(gemini_error)}")
            # Generate mock data as fallback
            mock_destinations = generate_mock_destinations(data)
            print("USING FALLBACK MOCK DATA - NOT GEMINI API RESPONSE")
            return jsonify({"destinations": mock_destinations})
            
    except Exception as e:
        print(f"Error in destination suggestions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_destination', methods=['POST'])
def save_destination():
    if 'user' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    destination_data = request.json
    user_email = session['user']
    
    # Ensure the user exists and has a saved_trips list
    if user_email not in users or 'saved_trips' not in users[user_email]:
        users[user_email] = {
            'password': users.get(user_email, {}).get('password', ''),
            'saved_trips': []
        }
    
    # Add the destination to the user's saved_trips list
    users[user_email]['saved_trips'].append(destination_data)
    
    return jsonify({
        'status': 'success', 
        'message': 'Destination saved successfully!'
    })
@app.route('/request_reset')
def request_reset():
    return render_template('reset_password.html')

@app.route('/travel_checklist', methods=['GET', 'POST'])
def travel_checklist():
    if 'user' not in session:
        flash("Please log in to access your Travel Checklist.", "error")
        return redirect(url_for('login_form'))

    default_items = [
        'Passport', 'Travel Tickets', 'Hotel Confirmation', 
        'Phone Charger', 'Medications', 'Toiletries', 
        'Clothes', 'Travel Insurance', 'Wallet & Cards'
    ]

    if request.method == 'POST':
        checked_items = request.form.getlist('item')
        session['travel_checklist'] = checked_items
        flash("✅ Checklist saved!", "success")
        return redirect(url_for('travel_checklist'))

    saved_items = session.get('travel_checklist', [])
    return render_template('travel_checklist.html', items=default_items, checked_items=saved_items)


def generate_mock_destinations(preferences):
    """Generate mock destination data based on user preferences"""
    destination_options = {
        'Budget': ['Thailand', 'Vietnam', 'Mexico', 'Portugal', 'Turkey'],
        'Moderate': ['Spain', 'Greece', 'Japan', 'Australia', 'Canada'],
        'Luxury': ['Maldives', 'Switzerland', 'Dubai', 'French Polynesia', 'Singapore'],
        'Tropical': ['Bali', 'Hawaii', 'Costa Rica', 'Fiji', 'Caribbean Islands'],
        'Mediterranean': ['Italy', 'Greece', 'Spain', 'Croatia', 'Portugal'],
        'Desert': ['Morocco', 'Egypt', 'Jordan', 'Arizona', 'Dubai'],
        'Alpine': ['Switzerland', 'Austria', 'Canada', 'New Zealand', 'Norway'],
        'Temperate': ['Japan', 'UK', 'France', 'Germany', 'Netherlands'],
        'Adventure': ['New Zealand', 'Costa Rica', 'Iceland', 'Peru', 'Nepal'],
        'Cultural': ['Japan', 'Italy', 'France', 'India', 'Egypt'],
        'Relaxation': ['Maldives', 'Bali', 'Hawaii', 'Thailand', 'Greece'],
        'Urban': ['New York', 'Tokyo', 'London', 'Paris', 'Singapore'],
        'Family': ['Orlando', 'San Diego', 'London', 'Singapore', 'Australia']
    }
    
    selected_destinations = []
    
    if preferences.get('budget') in destination_options:
        selected_destinations.extend(destination_options[preferences.get('budget')])
    
    if preferences.get('climate') in destination_options:
        selected_destinations.extend(destination_options[preferences.get('climate')])
    
    if preferences.get('travelStyle') in destination_options:
        selected_destinations.extend(destination_options[preferences.get('travelStyle')])
    
    if not selected_destinations:
        selected_destinations = ['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'New York City, USA', 'Barcelona, Spain']
    
    selected_destinations = list(set(selected_destinations))
    
    if preferences.get('previousDestinations'):
        visited_places = [place.strip().lower() for place in preferences.get('previousDestinations').split(',')]
        selected_destinations = [dest for dest in selected_destinations 
                               if not any(visited in dest.lower() for visited in visited_places)]
    
    while len(selected_destinations) < 3:
        defaults = ['London, UK', 'Rome, Italy', 'Sydney, Australia', 'Cape Town, South Africa']
        for dest in defaults:
            if dest not in selected_destinations:
                selected_destinations.append(dest)
                break
    
    selected_destinations = selected_destinations[:3]
    
    destination_details = {
        'Thailand': {
            'name': 'Thailand',
            'description': 'A tropical paradise with stunning beaches, ornate temples, and vibrant street life. Thailand offers a perfect blend of cultural experiences and natural beauty.',
            'attractions': ['Grand Palace in Bangkok', 'Phi Phi Islands', 'Chiang Mai Night Markets'],
            'bestTimeToVisit': 'November to March (dry season)',
            'estimatedDailyBudget': '$30-$100'
        },
        'Japan': {
            'name': 'Japan',
            'description': 'A fascinating blend of ancient traditions and cutting-edge technology. Japan offers incredible food, beautiful landscapes, and rich cultural experiences.',
            'attractions': ['Mount Fuji', 'Kyoto Temples', 'Tokyo Skytree'],
            'bestTimeToVisit': 'March-May (cherry blossoms) or Oct-Nov (fall colors)',
            'estimatedDailyBudget': '$100-$200'
        },
        'Italy': {
            'name': 'Italy',
            'description': 'Home to incredible history, art, and some of the world\'s best food and wine. Italy offers a perfect mix of cultural sites and beautiful landscapes.',
            'attractions': ['Colosseum in Rome', 'Venice Canals', 'Florence Cathedral'],
            'bestTimeToVisit': 'April to June or September to October',
            'estimatedDailyBudget': '$70-$150'
        },
        'New Zealand': {
            'name': 'New Zealand',
            'description': 'Known for dramatic landscapes, outdoor adventures, and Maori culture. New Zealand is a paradise for nature lovers and adventure seekers.',
            'attractions': ['Milford Sound', 'Hobbiton Movie Set', 'Rotorua Geothermal Area'],
            'bestTimeToVisit': 'December to February (summer)',
            'estimatedDailyBudget': '$80-$180'
        },
        'Morocco': {
            'name': 'Morocco',
            'description': 'A colorful country with bustling markets, desert landscapes, and rich cultural heritage. Morocco offers a unique blend of African, Arab, and European influences.',
            'attractions': ['Marrakech Medina', 'Sahara Desert', 'Blue City of Chefchaouen'],
            'bestTimeToVisit': 'March to May or September to November',
            'estimatedDailyBudget': '$40-$100'
        }
    }
    
    result = []
    for destination in selected_destinations:
        best_match = None
        for key in destination_details:
            if key in destination:
                best_match = key
                break
        
        if best_match:
            result.append(destination_details[best_match])
        else:
            budget_estimate = "$50-$100"
            if preferences.get('budget') == 'Moderate':
                budget_estimate = "$100-$200"
            elif preferences.get('budget') == 'Luxury':
                budget_estimate = "$200+"
                
            result.append({
                'name': destination,
                'description': f'A wonderful destination with plenty to see and do. {destination} offers unique experiences and unforgettable memories.',
                'attractions': ['Local sightseeing', 'Cultural experiences', 'Regional cuisine'],
                'bestTimeToVisit': 'Varies by season',
                'estimatedDailyBudget': budget_estimate
            })
    
    return result

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# Run server
if __name__ == '__main__':
    app.run(debug=True)
