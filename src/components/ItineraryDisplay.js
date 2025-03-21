import React from 'react';

function ItineraryDisplay({ itinerary, onNewTrip }) {
  return (
    <div>
      <h2>Your Itinerary</h2>
      <div className="itinerary">
        <p><strong>Destination:</strong> {itinerary.destination}</p>
        <p><strong>Start Date:</strong> {itinerary.startDate}</p>
        <p><strong>End Date:</strong> {itinerary.endDate}</p>
        <p><strong>Budget:</strong> ${itinerary?.budget}</p>
        {itinerary?.itinerary?.map((day, dayIndex) => (
          <div key={dayIndex}>
            <h3>{day.day}</h3>
            <ul>
              {day.activities?.map((activity, activityIndex) => (
                <li key={activityIndex}>
                  {activity.description} (Estimated Cost: {activity.estimatedCost})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={onNewTrip}>Plan Another Trip</button>
    </div>
  );
}

export default ItineraryDisplay;
