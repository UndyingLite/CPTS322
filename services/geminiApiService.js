/**
 * Service for interacting with the Google Gemini API
 */
const geminiApiService = {
  /**
   * Get destination suggestions from Gemini
   * 
   * @param {Object} preferences User's travel preferences
   * @returns {Promise<Object>} Destination suggestions
   */
  getDestinationSuggestions: async (preferences) => {
    try {
      // API key
      const apiKey = "AIzaSyAsvh-yp3ifMnuV0HOV4m-3BmramZXc6rU";
      
      // Construct the prompt for Gemini
      const prompt = `I'm looking for travel destination suggestions with the following preferences:
      - Budget: ${preferences.budget || 'Not specified'}
      - Trip Duration: ${preferences.duration || 'Not specified'} days
      - Interests: ${preferences.interests || 'Not specified'}
      - Preferred Climate: ${preferences.climate || 'Not specified'}
      - Travel Style: ${preferences.travelStyle || 'Not specified'}
      - Places I've already visited: ${preferences.previousDestinations || 'None mentioned'}
      
      Please suggest 3 destinations that would be a good match, including:
      1. Destination name
      2. Brief description
      3. Key attractions (3 or more)
      4. Best time to visit
      5. Estimated daily budget
      
      Format your response ONLY as JSON with the following structure, and nothing else:
      {
        "destinations": [
          {
            "name": "Destination name",
            "description": "Brief description",
            "attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
            "bestTimeToVisit": "Best time to visit",
            "estimatedDailyBudget": "Estimated daily budget in USD"
          }
        ]
      }`;
      
      // Make API call to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      
      // Extract the content from Gemini's response
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Look for JSON in the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                         responseText.match(/({[\s\S]*})/);
                         
      let parsedData;
      if (jsonMatch && jsonMatch[1]) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the entire response as JSON
        try {
          parsedData = JSON.parse(responseText);
        } catch (error) {
          throw new Error('Failed to parse JSON response from Gemini');
        }
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error in Gemini API service:', error);
      throw error;
    }
  }
};

export default geminiApiService;
