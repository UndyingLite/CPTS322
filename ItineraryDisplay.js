import React from 'react';

function ItineraryDisplay({ itinerary, onNewTrip }) {
  return (
    <div>
      <h2>Your Itinerary</h2>
      <div className="itinerary">
        <p><strong>Destination:</strong> {itinerary.destination}</p>
        <p><strong>Budget:</strong> ${itinerary.budget}</p>
        <p><strong>Activities:</strong></p>
        <ul>
          {itinerary.activities.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>
      <button onClick={onNewTrip}>Plan Another Trip</button>
    </div>
  );
}

export default ItineraryDisplay;