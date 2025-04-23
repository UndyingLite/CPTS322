import React, { useState, useEffect } from 'react';
import './App.css';
import ProfileForm from './components/ProfileForm';
import PreferencesForm from './components/PreferencesForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import geminiApiService from './services/geminiApiService';
import ChatInterface from './components/ChatInterface';
import DestinationSuggestion from './components/DestinationSuggestion';


function App() {
  const [step, setStep] = useState(() => localStorage.getItem('step') || 'profile');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [itinerary, setItinerary] = useState(() => JSON.parse(localStorage.getItem('itinerary')) || null);
  const [selectedDestination, setSelectedDestination] = useState(() => JSON.parse(localStorage.getItem('selectedDestination')) || null);

  useEffect(() => {
    localStorage.setItem('step', step);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
    localStorage.setItem('selectedDestination', JSON.stringify(selectedDestination));
  }, [step, user, itinerary, selectedDestination]);

  const handleProfileSubmit = (profileData) => {
    setUser(profileData);
    setStep('preferences');
  };

  const handlePreferencesSubmit = async (prefsData) => {
    try {
      const geminiItinerary = await geminiApiService.getDestinationSuggestions(prefsData);
      console.log("Gemini Itinerary:", geminiItinerary);
      setItinerary(geminiItinerary);
      setStep('itinerary');
    } catch (error) {
      console.error("Error fetching itinerary from Gemini:", error.message);
      // Handle error appropriately, e.g., display an error message to the user
    }
  };

  const handleNewTrip = () => {
    setStep('preferences');
    setItinerary(null);
  };

  const handleLogout = () => {
    setUser(null);
    setItinerary(null);
    setStep('profile');
    localStorage.clear();
  };

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setStep('planTrip');
  };

  return (
    <div className="App">
      <h1>TravelBuddy</h1>
      {user && (
        <>
          <div className="user-info">
            <p>Welcome, {user.name}!</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <div className="navigation-menu" style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => setStep('preferences')} 
              className={step === 'preferences' ? 'active' : ''}
            >
              Plan Trip
            </button>
            <button 
              onClick={() => setStep('destinations')} 
              className={step === 'destinations' ? 'active' : ''}
            >
              Destinations
            </button>

            {itinerary && (
              <button 
                onClick={() => setStep('itinerary')} 
                className={step === 'itinerary' ? 'active' : ''}
              >
                My Itinerary
              </button>
            )}
          </div>
        </>
      )}
      {step === 'profile' && <ProfileForm onSubmit={handleProfileSubmit} />}
      {step === 'preferences' && <PreferencesForm onSubmit={handlePreferencesSubmit} />}
      {step === 'itinerary' && (
        <>
          <ItineraryDisplay itinerary={itinerary} onNewTrip={handleNewTrip} />
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => setStep('destinations')}>Explore Destinations</button>
          </div>
        </>
      )}
      {step === 'destinations' && (
        <DestinationSuggestion onSelectDestination={handleDestinationSelect} />
      )}
      {step === 'planTrip' && selectedDestination && (
        <div>
          <h2>Plan Your Trip to {selectedDestination.name}</h2>
          <p>{selectedDestination.description}</p>
          <button onClick={() => setStep('preferences')}>Create Itinerary</button>
          <button onClick={() => setStep('destinations')}>Back to Destinations</button>
        </div>
      )}

    </div>
  );
}

export default App;
