import React, { useState } from 'react';

function PreferencesForm({ onSubmit }) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ destination, startDate, endDate, budget, interests });
  };

  return (
    <div>
      <h2>Plan Your Trip</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Budget ($)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Interests (e.g., food, museums)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
        <button type="submit">Get Itinerary</button>
      </form>
    </div>
  );
}

export default PreferencesForm;