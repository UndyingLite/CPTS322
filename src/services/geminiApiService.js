import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiService = {
  getChatResponse: async (userMessage) => {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "enterapikey";
      if (apiKey === "enterapikey") {
        console.warn("No valid Gemini API key provided. Using mock data instead.");
        // Return a fallback response for testing since api key is having issues
        return "I don't have access to real-time data right now, but I can suggest checking out budget-friendly destinations like Southeast Asia or Eastern Europe. Both offer amazing cultural experiences at lower costs than Western Europe or North America.";
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `You are TravelBuddy, a friendly AI travel assistant. Your purpose is to help users discover destinations, craft day‑by‑day itineraries, and offer budget‑savvy travel tips. Always respond in a warm, helpful tone. The user says: "${userMessage}"`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return responseText.trim();
    } catch (error) {
      console.error('Error in getChatResponse:', error);
      throw error;
    }
  },

  getDestinationRecommendations: async (preferences) => {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "enterapikey";
      if (apiKey === "enterapikey") {
        console.warn("No valid Gemini API key provided. Using mock data instead.");
        throw new Error("No valid API key");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
      5. Estimated daily budget in USD`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      try {
        const parsedData = JSON.parse(responseText);
        return parsedData;
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        throw new Error('Failed to parse JSON response from Gemini');
      }
    } catch (error) {
      console.error('Error in getDestinationRecommendations:', error);
      throw error;
    }
  },

  /**
   * Get mock chat responses when API is unavailable
   * 
   * @param {string} userMessage The user's text input
   * @returns {string} A mock AI-generated response
   */
  getMockChatResponse: (userMessage) => {
    const userMessageLower = userMessage.toLowerCase();

    const greetingKeywords = ["hey", "hello", "hi"];
    const gratitudeKeywords = ["no, thank you", "thank you", "thanks"];
    const recommendationKeywords = ["recommendation", "recommendations", "suggest", "suggestions", "trip", "travel"];
    const budgetKeywords = ["cheap", "affordable", "budget", "inexpensive"];
    const luxuryKeywords = ["luxury", "expensive", "premium", "high-end"];
    const helpKeywords = ["help", "assistance", "advice"];

    if (greetingKeywords.some(keyword => userMessageLower.includes(keyword))) {
      return "Hello! How can I help you plan your next adventure?";
    }

    if (gratitudeKeywords.some(keyword => userMessageLower.includes(keyword))) {
      return "You're welcome! Let me know if you need anything else.";
    }

    if (helpKeywords.some(keyword => userMessageLower.includes(keyword))) {
      return "I can help you with destination suggestions, itinerary planning, and budget advice. What are you looking for?";
    }

    if (budgetKeywords.some(keyword => userMessageLower.includes(keyword))) {
      return "For a budget-friendly trip, consider Southeast Asia or Eastern Europe. Check out Mexico or Central America for affordable travel options. Portugal and Spain can be surprisingly affordable, especially if you travel during the off-season.";
    }

    if (luxuryKeywords.some(keyword => userMessageLower.includes(keyword))) {
      return "For a luxurious getaway, consider the Maldives or Bora Bora. Explore the French Riviera or the Amalfi Coast for a high-end experience. Consider a safari in Africa for an unforgettable luxury adventure.";
    }

    if (recommendationKeywords.some(keyword => userMessageLower.includes(keyword))) {
      const responses = [
        "Based on your interests, I'd recommend visiting Portugal. It's more affordable than many Western European destinations, with beautiful beaches, historic cities like Lisbon and Porto, and excellent food and wine!",
        "Thailand could be perfect for you! It offers amazing beaches, delicious food, and cultural experiences at a fraction of the cost of many destinations. Stay in budget guesthouses and eat street food to keep costs down.",
        "Consider Mexico City for your next trip! It has world-class museums, incredible food, and your money will go much further than in many US or European cities. The metro system makes getting around easy and affordable.",
        "Japan might seem expensive, but you can travel there on a budget by staying in capsule hotels or hostels, eating at conveyor belt sushi restaurants, and using a Japan Rail Pass for transportation.",
        "If you're looking for nature and adventure, consider Costa Rica. Visit during the green season (May-November) for lower prices, fewer tourists, and still plenty of sunshine between short rain showers."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    return "I'm sorry, I didn't understand your request. Can you please provide more information about what you're looking for?";
  },
};

export default geminiApiService;
