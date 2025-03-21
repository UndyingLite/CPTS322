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
      const apiKey = "enterapikey";
      
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
  }
};
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
      const apiKey = "enterapikey";

      // We'll ask for a single travel suggestion
      const prompt = `The user wants a travel suggestion. They say: "${userMessage}"
      
      Please respond with at least one travel-related recommendation. 
      If relevant, include a budget-friendly tip or destination in your reply.
      Format your answer as plain text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp-02-05:generateContent?key=${apiKey}`,
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
      if (!responseText) {
        throw new Error('No response text found from Gemini');
      }

      return responseText.trim();
    } catch (error) {
      console.error('Error in getChatResponse:', error);
      throw error;
    }
  }
};

export default geminiApiService;
