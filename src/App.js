import React, { useState, useEffect } from 'react';
import './App.css';
import ProfileForm from './components/ProfileForm';
import PreferencesForm from './components/PreferencesForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import geminiApiService from './services/geminiApiService';
import ChatInterface from './components/ChatInterface';


function App() {
  const [step, setStep] = useState(() => localStorage.getItem('step') || 'profile');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [itinerary, setItinerary] = useState(() => JSON.parse(localStorage.getItem('itinerary')) || null);

  useEffect(() => {
    localStorage.setItem('step', step);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
  }, [step, user, itinerary]);

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

  return (
    <div className="App">
      <h1>TravelBuddy</h1>
      {user && (
        <div className="user-info">
          <p>Welcome, {user.name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      {step === 'profile' && <ProfileForm onSubmit={handleProfileSubmit} />}
      {step === 'preferences' && <PreferencesForm onSubmit={handlePreferencesSubmit} />}
      {step === 'itinerary' && (
        <>
          <ItineraryDisplay itinerary={itinerary} onNewTrip={handleNewTrip} />
        </>
      )}
    </div>
  );
}

export default App;
