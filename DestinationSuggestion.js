import React, { useState } from 'react';
import geminiApiService from '../services/geminiApiService';

function DestinationSuggestion({ onSelectDestination }) {
  const [preferences, setPreferences] = useState({
    budget: '',
    duration: '',
    interests: '',
    climate: '',
    travelStyle: '',
    previousDestinations: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      let result;
      
      // Try to use the Gemini API
      try {
        // Call the Gemini API
        result = await geminiApiService.getDestinationSuggestions(preferences);
        console.log("Gemini API result:", result);
      } catch (apiError) {
        console.error("Gemini API error:", apiError);
        // Fall back to mock data on API error
        result = { destinations: generateMockDestinations(preferences) };
      }
      
      setSuggestions(result);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to get destination suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockDestinations = (prefs) => {
    // This function creates realistic suggestions based on user preferences
    // In the final implementation, this would be replaced with the Claude API response
    
    const destinationsByClimate = {
      'Tropical': ['Bali, Indonesia', 'Phuket, Thailand', 'Costa Rica'],
      'Mediterranean': ['Barcelona, Spain', 'Amalfi Coast, Italy', 'Santorini, Greece'],
      'Desert': ['Marrakech, Morocco', 'Dubai, UAE', 'Sedona, Arizona'],
      'Alpine': ['Swiss Alps', 'Banff, Canada', 'Queenstown, New Zealand'],
      'Temperate': ['Kyoto, Japan', 'Portland, Oregon', 'Melbourne, Australia'],
      'Any': ['Tokyo, Japan', 'Paris, France', 'New York City, USA']
    };
    
    const destinationsByStyle = {
      'Adventure': ['New Zealand', 'Costa Rica', 'Nepal'],
      'Cultural': ['Japan', 'Italy', 'Morocco'],
      'Relaxation': ['Maldives', 'Bali', 'Hawaii'],
      'Urban': ['New York', 'Tokyo', 'London'],
      'Family': ['Orlando', 'San Diego', 'Singapore']
    };
    
    const budgetRanges = {
      'Budget': ['Thailand', 'Vietnam', 'Mexico'],
      'Moderate': ['Spain', 'Portugal', 'Greece'],
      'Luxury': ['Switzerland', 'Japan', 'Maldives']
    };

    // Select appropriate destinations based on user preferences
    let possibleDestinations = [];
    
    if (prefs.climate && prefs.climate !== 'Any') {
      possibleDestinations = [...possibleDestinations, ...destinationsByClimate[prefs.climate]];
    }
    
    if (prefs.travelStyle) {
      possibleDestinations = [...possibleDestinations, ...destinationsByStyle[prefs.travelStyle]];
    }
    
    if (prefs.budget) {
      possibleDestinations = [...possibleDestinations, ...budgetRanges[prefs.budget]];
    }
    
    // If no matches or no preferences, use defaults
    if (possibleDestinations.length === 0) {
      possibleDestinations = ['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'New York City, USA', 'Barcelona, Spain'];
    }
    
    // Remove duplicates
    possibleDestinations = [...new Set(possibleDestinations)];
    
    // Filter out previously visited places
    if (prefs.previousDestinations) {
      const visitedPlaces = prefs.previousDestinations.split(',').map(p => p.trim().toLowerCase());
      possibleDestinations = possibleDestinations.filter(dest => 
        !visitedPlaces.some(place => dest.toLowerCase().includes(place))
      );
    }
    
    // Ensure we have at least 3 destinations
    while (possibleDestinations.length < 3) {
      const defaults = ['London, UK', 'Rome, Italy', 'Sydney, Australia', 'Cape Town, South Africa'];
      for (const dest of defaults) {
        if (!possibleDestinations.includes(dest)) {
          possibleDestinations.push(dest);
          break;
        }
      }
    }
    
    // Select 3 random destinations from the possibilities
    const selected = [];
    while (selected.length < 3 && possibleDestinations.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleDestinations.length);
      const destination = possibleDestinations[randomIndex];
      selected.push(destination);
      possibleDestinations.splice(randomIndex, 1);
    }
    
    // Create full destination objects
    return selected.map(name => {
      // Determine budget range based on preferences or destination
      let dailyBudget;
      if (prefs.budget === 'Budget') {
        dailyBudget = "$50-$100";
      } else if (prefs.budget === 'Moderate') {
        dailyBudget = "$100-$200";
      } else if (prefs.budget === 'Luxury') {
        dailyBudget = "$200+";
      } else {
        // Assign based on destination if no preference given
        const expensiveDestinations = ['Switzerland', 'Japan', 'Norway', 'Iceland', 'Dubai'];
        const cheapDestinations = ['Thailand', 'Vietnam', 'Mexico', 'Indonesia', 'Turkey'];
        
        if (expensiveDestinations.some(d => name.includes(d))) {
          dailyBudget = "$150-$250";
        } else if (cheapDestinations.some(d => name.includes(d))) {
          dailyBudget = "$50-$100";
        } else {
          dailyBudget = "$100-$150";
        }
      }
      
      // Generate description and attractions based on destination
      const descriptions = {
        'Bali': 'A tropical paradise with stunning beaches, lush rice terraces, and a vibrant cultural scene.',
        'Thailand': 'Known for beautiful beaches, ornate temples, and delicious street food.',
        'Costa Rica': 'A nature lover\'s dream with rainforests, volcanoes, and abundant wildlife.',
        'Barcelona': 'A vibrant city with stunning architecture, Mediterranean beaches, and world-class cuisine.',
        'Italy': 'Home to incredible history, art, and some of the world\'s best food and wine.',
        'Greece': 'Famous for whitewashed buildings, crystal-clear waters, and ancient ruins.',
        'Morocco': 'A colorful country with bustling markets, desert landscapes, and rich cultural heritage.',
        'Dubai': 'An ultramodern city with futuristic architecture, luxury shopping, and desert adventures.',
        'Japan': 'A fascinating blend of ancient traditions and cutting-edge technology.',
        'New Zealand': 'Known for dramatic landscapes, outdoor adventures, and Maori culture.',
        'France': 'Famous for its cuisine, art, architecture, and romantic atmosphere.',
        'USA': 'Diverse landscapes, vibrant cities, and endless entertainment options.'
      };
      
      const attractions = {
        'Bali': ['Sacred Monkey Forest', 'Ubud Rice Terraces', 'Uluwatu Temple', 'Kuta Beach'],
        'Thailand': ['Grand Palace', 'Phi Phi Islands', 'Wat Arun', 'Khao San Road'],
        'Costa Rica': ['Arenal Volcano', 'Manuel Antonio National Park', 'Monteverde Cloud Forest'],
        'Barcelona': ['Sagrada Familia', 'Park Güell', 'La Rambla', 'Gothic Quarter'],
        'Italy': ['Colosseum', 'Venice Canals', 'Florence Cathedral', 'Amalfi Coast'],
        'Greece': ['Acropolis', 'Santorini Caldera', 'Mykonos Windmills', 'Meteora Monasteries'],
        'Morocco': ['Jemaa el-Fnaa', 'Bahia Palace', 'Sahara Desert', 'Blue City of Chefchaouen'],
        'Dubai': ['Burj Khalifa', 'Palm Jumeirah', 'Dubai Mall', 'Desert Safari'],
        'Japan': ['Mount Fuji', 'Fushimi Inari Shrine', 'Tokyo Skytree', 'Arashiyama Bamboo Grove'],
        'New Zealand': ['Milford Sound', 'Hobbiton', 'Rotorua', 'Franz Josef Glacier'],
        'France': ['Eiffel Tower', 'Louvre Museum', 'Mont Saint-Michel', 'French Riviera'],
        'USA': ['Grand Canyon', 'Times Square', 'Golden Gate Bridge', 'Walt Disney World']
      };
      
      const bestTimes = {
        'Bali': 'April to October (dry season)',
        'Thailand': 'November to March (cool season)',
        'Costa Rica': 'December to April (dry season)',
        'Barcelona': 'April to June or September to October',
        'Italy': 'April to June or September to October',
        'Greece': 'May to October',
        'Morocco': 'March to May or September to November',
        'Dubai': 'November to March (cooler months)',
        'Japan': 'March to May (cherry blossoms) or October to November (fall colors)',
        'New Zealand': 'December to February (summer)',
        'France': 'April to October',
        'USA': 'Varies by region'
      };
      
      // Find matching description and attractions
      let description = 'A wonderful destination with plenty to see and do.';
      let destinationAttractions = ['Local sightseeing', 'Cultural experiences', 'Regional cuisine'];
      let bestTimeToVisit = 'Varies by season';
      
      // Match partial names to our database entries
      for (const [key, desc] of Object.entries(descriptions)) {
        if (name.includes(key)) {
          description = desc;
          break;
        }
      }
      
      for (const [key, attr] of Object.entries(attractions)) {
        if (name.includes(key)) {
          destinationAttractions = attr.slice(0, 3);
          break;
        }
      }
      
      for (const [key, time] of Object.entries(bestTimes)) {
        if (name.includes(key)) {
          bestTimeToVisit = time;
          break;
        }
      }
      
      return {
        name,
        description,
        attractions: destinationAttractions,
        bestTimeToVisit,
        estimatedDailyBudget: dailyBudget
      };
    });
  };

  const handleSelectDestination = (destination) => {
    if (onSelectDestination) {
      onSelectDestination(destination);
    }
  };

  return (
    <div>
      <h2>Find Your Perfect Destination</h2>
      <p className="ai-powered-note">✨ Powered by Google Gemini AI</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="budget">Budget</label>
          <select 
            id="budget" 
            name="budget" 
            value={preferences.budget} 
            onChange={handleInputChange}
          >
            <option value="">Select your budget</option>
            <option value="Budget">Budget (under $100/day)</option>
            <option value="Moderate">Moderate ($100-$200/day)</option>
            <option value="Luxury">Luxury (over $200/day)</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="duration">Trip Duration (days)</label>
          <input 
            type="number" 
            id="duration" 
            name="duration" 
            min="1" 
            max="90"
            value={preferences.duration} 
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label htmlFor="interests">Interests (comma separated)</label>
          <input 
            type="text" 
            id="interests" 
            name="interests" 
            placeholder="e.g., hiking, museums, food, beaches"
            value={preferences.interests} 
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label htmlFor="climate">Preferred Climate</label>
          <select 
            id="climate" 
            name="climate" 
            value={preferences.climate} 
            onChange={handleInputChange}
          >
            <option value="">Select climate</option>
            <option value="Tropical">Tropical</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Desert">Desert</option>
            <option value="Alpine">Alpine/Mountain</option>
            <option value="Temperate">Temperate</option>
            <option value="Any">Any climate</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="travelStyle">Travel Style</label>
          <select 
            id="travelStyle" 
            name="travelStyle" 
            value={preferences.travelStyle} 
            onChange={handleInputChange}
          >
            <option value="">Select travel style</option>
            <option value="Adventure">Adventure/Outdoor</option>
            <option value="Cultural">Cultural/Historical</option>
            <option value="Relaxation">Relaxation/Spa</option>
            <option value="Urban">Urban Exploration</option>
            <option value="Family">Family-friendly</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="previousDestinations">Places You've Already Visited</label>
          <input 
            type="text" 
            id="previousDestinations" 
            name="previousDestinations" 
            placeholder="e.g., Paris, Tokyo, Bali"
            value={preferences.previousDestinations} 
            onChange={handleInputChange}
          />
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Finding destinations...' : 'Get Recommendations'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {suggestions && (
        <div className="suggestions-container">
          <h3>Recommended Destinations for You</h3>
          
          <div className="destinations-grid">
            {suggestions.destinations.map((dest, index) => (
              <div key={index} className="destination-card">
                <h4>{dest.name}</h4>
                <p>{dest.description}</p>
                
                <h5>Key Attractions:</h5>
                <ul>
                  {dest.attractions.map((attraction, i) => (
                    <li key={i}>{attraction}</li>
                  ))}
                </ul>
                
                <div className="destination-meta">
                  <p><strong>Best time to visit:</strong> {dest.bestTimeToVisit}</p>
                  <p><strong>Daily budget:</strong> {dest.estimatedDailyBudget}</p>
                </div>
                
                <button onClick={() => handleSelectDestination(dest)}>
                  Select This Destination
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationSuggestion;
