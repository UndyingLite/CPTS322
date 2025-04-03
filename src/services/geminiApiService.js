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
      // API key - Replace with your actual Gemini API key
      // You can get an API key from https://makersuite.google.com/app/apikey
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "enterapikey";
      
      // If no valid API key is provided, the service will fall back to mock data
      if (apiKey === "enterapikey") {
        console.warn("No valid Gemini API key provided. Using mock data instead.");
        throw new Error("No valid API key");
      }
      
      // Construct the prompt for Gemini
      const prompt = `Create a detailed travel itinerary for a trip to ${preferences.destination} from ${preferences.startDate} to ${preferences.endDate}, with a budget of ${preferences.budget}. The user is interested in ${preferences.interests}.

      The itinerary should include a list of activities for each day, including specific landmarks, restaurants, and other attractions. Please provide estimated costs for each activity.

      Format your response ONLY as JSON with the following structure, and nothing else:
      {
        "destination": "${preferences.destination}",
        "startDate": "${preferences.startDate}",
        "endDate": "${preferences.endDate}",
        "budget": "${preferences.budget}",
        "interests": "${preferences.interests}",
        "itinerary": [
          {
            "day": "Day 1",
            "activities": [
              {
                "description": "Activity description",
                "estimatedCost": "Estimated cost in USD"
              }
            ]
          }
        ]
      }`;
      
      // Make API call to Gemini
      // TODO: The model 'gemini-2.0-pro-exp-02-05' is experimental. Consider switching to a stable model for production.
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${apiKey}`, {
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
            maxOutputTokens: 2000
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      console.log("Gemini API Response:", data);
      
      // Extract the content from Gemini's response
      const responseText = data.candidates[0].content.parts[0].text;

      // Log the raw response text for debugging
      console.log("Raw Gemini API Response Text:", responseText);

      // Attempt to fix common JSON errors (missing commas)
      let fixedResponseText = responseText.replace(
        /}\s*{/g,
        '},{'
      );

      // Look for JSON in the response
      const jsonMatch = fixedResponseText.match(/```json\n([\s\S]*)\n```/) || 
                         fixedResponseText.match(/({[\s\S]*})/);
                         
      let parsedData;
      if (jsonMatch && jsonMatch[1]) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the entire response as JSON
        try {
          parsedData = JSON.parse(fixedResponseText);
        } catch (error) {
          throw new Error('Failed to parse JSON response from Gemini');
        }
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error in Gemini API service:', error);
      throw error;
    }
  },
  
  // ----------------------------------------------------
  // GetChatResponse
  // ----------------------------------------------------
  /**
   * Get a short travel-related chat response from Gemini
   *
   * @param {string} userMessage The user's text input
   * @returns {Promise<string>} The AI-generated text
   */
  getChatResponse: async (userMessage) => {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyAsvh-yp3ifMnuV0HOV4m-3BmramZXc6rU";
      // If no valid API key is provided, the service will fall back to mock data
      if (apiKey === "enterapikey") {
        console.warn("No valid Gemini API key provided. Using mock data instead.");
        throw new Error("No valid API key");
      }

      // We'll ask for a single travel suggestion
      const prompt = `The user wants a travel suggestion. They say: "${userMessage}"
      
      Please respond with at least one travel-related recommendation. 
      If relevant, include a budget-friendly tip or destination in your reply.
      Format your answer as plain text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateContent?key=${apiKey}`, ...);
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Chat request failed');
      }

      const data = await response.json();
      console.log("Gemini Chat Response:", data);

      // Attempt to get text from the response
      const responseText = data.candidates?.[0]?.content.parts?.[0]?.text;
      console.log("Parsed responseText:", responseText);
      if (!responseText) {
        throw new Error('No response text found from Gemini');
      }

      return responseText.trim();
    } catch (error) {
      console.error('Error in getChatResponse:', error);
      throw error;
    }
  },
  
  /**
   * Get destination suggestions based on user preferences
   * 
   * @param {Object} preferences User's destination preferences
   * @returns {Promise<Object>} Destination suggestions with details
   */
  getDestinationRecommendations: async (preferences) => {
    try {
      // API key - Replace with your actual Gemini API key
      // You can get an API key from https://makersuite.google.com/app/apikey
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "enterapikey";
      
      // If no valid API key is provided, the service will fall back to mock data
      if (apiKey === "enterapikey") {
        console.warn("No valid Gemini API key provided. Using mock data instead.");
        throw new Error("No valid API key");
      }
      
      // Construct the prompt for Gemini
      const prompt = `Suggest 3 travel destinations based on the following preferences:
      - Budget: ${preferences.budget || 'Any'}
      - Trip Duration: ${preferences.duration || 'Any'} days
      - Interests: ${preferences.interests || 'General travel'}
      - Climate: ${preferences.climate || 'Any'}
      - Travel Style: ${preferences.travelStyle || 'Any'}
      - Previously visited: ${preferences.previousDestinations || 'None'}

      For each destination, provide:
      1. Name of the destination
      2. A brief description (2-3 sentences)
      3. 3 key attractions
      4. Best time to visit
      5. Estimated daily budget in USD

      Format your response ONLY as JSON with the following structure, and nothing else:
      {
        "destinations": [
          {
            "name": "Destination Name",
            "description": "Brief description of the destination",
            "attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
            "bestTimeToVisit": "Best time to visit",
            "estimatedDailyBudget": "Estimated daily budget in USD"
          }
        ]
      }`;
      
      // Make API call to Gemini
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${apiKey}`, {
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
            maxOutputTokens: 2000
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      console.log("Gemini API Response:", data);
      
      // Extract the content from Gemini's response
      const responseText = data.candidates[0].content.parts[0].text;

      // Log the raw response text for debugging
      console.log("Raw Gemini API Response Text:", responseText);

      // Attempt to fix common JSON errors (missing commas)
      let fixedResponseText = responseText.replace(
        /}\s*{/g,
        '},{'
      );

      // Look for JSON in the response
      const jsonMatch = fixedResponseText.match(/```json\n([\s\S]*)\n```/) || 
                         fixedResponseText.match(/({[\s\S]*})/);
                         
      let parsedData;
      if (jsonMatch && jsonMatch[1]) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Try parsing the entire response as JSON
        try {
          parsedData = JSON.parse(fixedResponseText);
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
