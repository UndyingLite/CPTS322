# AI Travel Buddy

A travel planning application with AI-powered destination suggestions, itinerary planning, and a travel chat assistant.

## Features

- **User Authentication**: Register, login, and profile management
- **Destination Suggestions**: Get personalized travel destination recommendations based on your preferences
- **Itinerary Planning**: Create detailed travel itineraries for your trips
- **Travel Chat Assistant**: Chat with an AI assistant about travel-related questions
- **Save Trips**: Save your favorite destinations for later

## Architecture

The application uses a hybrid architecture:

- **Backend**: Flask server for authentication, API endpoints, and serving HTML templates
- **Frontend**: React components for interactive features, with server-side rendering options

## Setup and Installation

### Prerequisites

- Python 3.7+
- Node.js and npm

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd travel-buddy
   ```

2. Install Python dependencies:
   ```
   pip install flask werkzeug
   ```

3. Install Node.js dependencies:
   ```
   npm install
   ```

4. Set up Gemini API key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Create a `.env` file in the root directory with:
     ```
     REACT_APP_GEMINI_API_KEY=your_api_key_here
     ```

## Running the Application

1. Start the Flask server:
   ```
   python3 app.py
   ```

2. In a separate terminal, start the React development server:
   ```
   npm start
   ```

3. Access the application:
   - Flask server: http://localhost:5000
   - React app: http://localhost:3000

## Usage

### Authentication

- Register a new account with email and password
- Log in with your credentials
- Update your profile with travel preferences

### Destination Suggestions

- Fill out the preferences form with your budget, interests, climate preferences, etc.
- Get personalized destination recommendations
- Save destinations you're interested in

### Itinerary Planning

- Select a destination
- Specify your travel dates and budget
- Get a detailed day-by-day itinerary

### Travel Chat Assistant

- Ask travel-related questions
- Get recommendations and tips
- Save interesting conversations

## Development Notes

- The application uses in-memory storage for demonstration purposes. In a production environment, you would use a database.
- The Gemini API integration requires a valid API key. Without it, the application falls back to mock data.
- The React components can be used independently or integrated with the Flask server.

## API Endpoints

- `/api/destination_suggestions`: Get destination suggestions based on preferences
- `/api/save_destination`: Save a destination to your profile
- `/api/chat`: Get a response from the travel chat assistant
- `/api/save_conversation`: Save a chat conversation

## License

[MIT License](LICENSE)
