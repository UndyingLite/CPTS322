import React, { useState, useEffect } from 'react';
import './App.css';
import ProfileForm from './components/ProfileForm';
import PreferencesForm from './components/PreferencesForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import ChatBox from './components/ChatBox'; // This must match the file name and export

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

  const handlePreferencesSubmit = (prefsData) => {
    const mockItinerary = {
      destination: prefsData.destination,
      activities: [`Visit ${prefsData.destination} landmark`, 'Try local food', 'Relax at a park'],
      budget: prefsData.budget,
    };
    setItinerary(mockItinerary);
    setStep('itinerary');
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
          <ChatBox destination={itinerary.destination} />
        </>
      )}
    </div>
  );
}

export default App;