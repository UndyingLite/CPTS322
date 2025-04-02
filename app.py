from flask import Flask, request, session, render_template, redirect, url_for, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_secret_key_here')

# Get Gemini API key from environment variables
gemini_api_key = os.getenv('REACT_APP_GEMINI_API_KEY')

# In-memory user store and profile store
users = {}
user_profiles = {}
saved_destinations = {}

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

@app.route('/ai_suggestions')
def ai_suggestions():
    if 'user' not in session:
        flash("Please log in to access destination suggestions.", "error")
        return redirect(url_for('login_form'))
    
    user_email = session['user']
    user_name = user_email.split('@')[0]
    
    # Get user profile data if available
    profile_data = user_profiles.get(user_email, {})
    
    return render_template('destination_suggestions.html', user_name=user_name, profile=profile_data)

@app.route('/api/destination_suggestions', methods=['POST'])
def get_destination_suggestions():
    if 'user' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    # Get the preferences from the request
    preferences = request.json
    
    # Check if we have a valid Gemini API key
    if not gemini_api_key or gemini_api_key == "enterapikey":
        # Fall back to mock data if no API key
        mock_destinations = [
            {
                "name": "Kyoto, Japan",
                "description": "A city of ancient temples, traditional gardens, and rich cultural heritage.",
                "attractions": ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)"],
                "bestTimeToVisit": "March-May (cherry blossoms) or Oct-Nov (fall colors)",
                "estimatedDailyBudget": "$150-$200"
            },
            {
                "name": "Barcelona, Spain",
                "description": "A vibrant city with stunning architecture, Mediterranean beaches, and world-class cuisine.",
                "attractions": ["Sagrada Familia", "Park Güell", "Gothic Quarter"],
                "bestTimeToVisit": "April-June or September-October",
                "estimatedDailyBudget": "$100-$150"
            },
            {
                "name": "Costa Rica",
                "description": "A nature lover's paradise with rainforests, volcanoes, and beautiful beaches.",
                "attractions": ["Arenal Volcano", "Manuel Antonio National Park", "Monteverde Cloud Forest"],
                "bestTimeToVisit": "December-April (dry season)",
                "estimatedDailyBudget": "$80-$120"
            }
        ]
        return jsonify({"destinations": mock_destinations})
    
    try:
        # Construct the prompt for Gemini
        prompt = f"""Suggest 3 travel destinations based on the following preferences:
        - Budget: {preferences.get('budget') or 'Any'}
        - Trip Duration: {preferences.get('duration') or 'Any'} days
        - Interests: {preferences.get('interests') or 'General travel'}
        - Climate: {preferences.get('climate') or 'Any'}
        - Travel Style: {preferences.get('travelStyle') or 'Any'}
        - Previously visited: {preferences.get('previousDestinations') or 'None'}

        For each destination, provide:
        1. Name of the destination
        2. A brief description (2-3 sentences)
        3. 3 key attractions
        4. Best time to visit
        5. Estimated daily budget in USD

        Format your response ONLY as JSON with the following structure, and nothing else:
        {{
          "destinations": [
            {{
              "name": "Destination Name",
              "description": "Brief description of the destination",
              "attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
              "bestTimeToVisit": "Best time to visit",
              "estimatedDailyBudget": "Estimated daily budget in USD"
            }}
          ]
        }}"""
        
        import requests
        import json
        
        # Make API call to Gemini
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key={gemini_api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2000
                }
            }
        )
        
        if response.status_code != 200:
            # Fall back to mock data if API call fails
            return jsonify({"error": "Failed to get destination suggestions from API"}), 500
        
        data = response.json()
        
        # Extract the content from Gemini's response
        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"Raw Gemini API Response: {response_text}")
        
        # Attempt to fix common JSON errors (missing commas)
        fixed_response_text = response_text.replace("}{", "},{")
        
        # Look for JSON in the response
        import re
        json_match = re.search(r"```json\n([\s\S]*?)\n```", fixed_response_text) or re.search(r"({[\s\S]*})", fixed_response_text)
        
        if json_match and json_match.group(1):
            json_content = json_match.group(1)
            print(f"Extracted JSON: {json_content}")
            try:
                parsed_data = json.loads(json_content)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {str(e)}")
                # Fall back to mock data
                mock_destinations = [
                    {
                        "name": "Kyoto, Japan",
                        "description": "A city of ancient temples, traditional gardens, and rich cultural heritage.",
                        "attractions": ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)"],
                        "bestTimeToVisit": "March-May (cherry blossoms) or Oct-Nov (fall colors)",
                        "estimatedDailyBudget": "$150-$200"
                    },
                    {
                        "name": "Barcelona, Spain",
                        "description": "A vibrant city with stunning architecture, Mediterranean beaches, and world-class cuisine.",
                        "attractions": ["Sagrada Familia", "Park Güell", "Gothic Quarter"],
                        "bestTimeToVisit": "April-June or September-October",
                        "estimatedDailyBudget": "$100-$150"
                    },
                    {
                        "name": "Costa Rica",
                        "description": "A nature lover's paradise with rainforests, volcanoes, and beautiful beaches.",
                        "attractions": ["Arenal Volcano", "Manuel Antonio National Park", "Monteverde Cloud Forest"],
                        "bestTimeToVisit": "December-April (dry season)",
                        "estimatedDailyBudget": "$80-$120"
                    }
                ]
                return jsonify({"destinations": mock_destinations})
        else:
            # Try parsing the entire response as JSON
            try:
                print("No JSON match found, trying to parse entire response")
                parsed_data = json.loads(fixed_response_text)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error for entire response: {str(e)}")
                # Fall back to mock data
                mock_destinations = [
                    {
                        "name": "Kyoto, Japan",
                        "description": "A city of ancient temples, traditional gardens, and rich cultural heritage.",
                        "attractions": ["Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Kinkaku-ji (Golden Pavilion)"],
                        "bestTimeToVisit": "March-May (cherry blossoms) or Oct-Nov (fall colors)",
                        "estimatedDailyBudget": "$150-$200"
                    },
                    {
                        "name": "Barcelona, Spain",
                        "description": "A vibrant city with stunning architecture, Mediterranean beaches, and world-class cuisine.",
                        "attractions": ["Sagrada Familia", "Park Güell", "Gothic Quarter"],
                        "bestTimeToVisit": "April-June or September-October",
                        "estimatedDailyBudget": "$100-$150"
                    },
                    {
                        "name": "Costa Rica",
                        "description": "A nature lover's paradise with rainforests, volcanoes, and beautiful beaches.",
                        "attractions": ["Arenal Volcano", "Manuel Antonio National Park", "Monteverde Cloud Forest"],
                        "bestTimeToVisit": "December-April (dry season)",
                        "estimatedDailyBudget": "$80-$120"
                    }
                ]
                return jsonify({"destinations": mock_destinations})
        
        return jsonify(parsed_data)
        
    except Exception as e:
        # Fall back to mock data if any error occurs
        print(f"Error calling Gemini API: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/save_destination', methods=['POST'])
def save_destination():
    if 'user' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_email = session['user']
    destination_data = request.json
    
    if user_email not in saved_destinations:
        saved_destinations[user_email] = []
    
    saved_destinations[user_email].append(destination_data)
    
    return jsonify({"success": True, "message": "Destination saved successfully"})

@app.route('/saved_trips')
def saved_trips():
    if 'user' not in session:
        flash("Please log in to view your saved trips.", "error")
        return redirect(url_for('login_form'))
    
    user_email = session['user']
    user_name = user_email.split('@')[0]
    
    # Get user's saved destinations
    user_destinations = saved_destinations.get(user_email, [])
    
    return render_template('saved_trips.html', user_name=user_name, destinations=user_destinations)

@app.route('/chat')
def chat():
    if 'user' not in session:
        flash("Please log in to access the chat feature.", "error")
        return redirect(url_for('login_form'))
    
    user_email = session['user']
    user_name = user_email.split('@')[0]
    
    return render_template('chat.html', user_name=user_name)

@app.route('/api/save_conversation', methods=['POST'])
def save_conversation():
    if 'user' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_email = session['user']
    conversation_data = request.json
    
    # In a real application, you would save this to a database
    # For now, we'll just return success
    
    return jsonify({"success": True, "message": "Conversation saved successfully"})

@app.route('/api/chat', methods=['POST'])
def chat_api():
    if 'user' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_message = request.json.get('message', '')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    
    # Check if we have a valid Gemini API key
    if not gemini_api_key or gemini_api_key == "enterapikey":
        # Fall back to mock data if no API key
        travel_responses = [
            "I'd recommend visiting Japan during cherry blossom season in April. The weather is mild and the scenery is breathtaking!",
            "Barcelona is a great destination for food lovers. Don't miss trying tapas at the local markets!",
            "For budget travel in Southeast Asia, consider Vietnam. You can enjoy amazing food, culture, and scenery for under $30 a day.",
            "The best time to visit the Caribbean is during the dry season from December to April. You'll avoid the hurricane season and enjoy sunny days.",
            "If you're looking for adventure travel, New Zealand offers everything from hiking to bungee jumping in some of the world's most beautiful landscapes.",
            "For a family vacation, consider Costa Rica. It has beaches, rainforests, and wildlife that kids will love, plus many family-friendly resorts.",
            "When packing for Europe, remember to bring comfortable walking shoes and a universal power adapter.",
            "To save money on flights, try booking 2-3 months in advance and use incognito mode when searching to avoid price increases based on your search history."
        ]
        
        import random
        response = random.choice(travel_responses)
        
        return jsonify({"response": response})
    
    try:
        # Construct the prompt for Gemini
        prompt = f"""The user wants a travel suggestion. They say: "{user_message}"
        
        Please respond with at least one travel-related recommendation. 
        If relevant, include a budget-friendly tip or destination in your reply.
        Format your answer as plain text."""
        
        import requests
        
        # Make API call to Gemini
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key={gemini_api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 500
                }
            }
        )
        
        if response.status_code != 200:
            # Fall back to mock data if API call fails
            return jsonify({"error": "Failed to get chat response from API"}), 500
        
        data = response.json()
        
        # Extract the content from Gemini's response
        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
        
        return jsonify({"response": response_text.strip()})
        
    except Exception as e:
        # Fall back to mock data if any error occurs
        print(f"Error calling Gemini API: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
