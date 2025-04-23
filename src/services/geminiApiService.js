// Service for interacting with Google Gemini API
// Requires: REACT_APP_GEMINI_API_KEY in your .env

const geminiApiService = {
  /**
   * Retrieve a chat response from Gemini
   * @param {string} userMessage
   * @returns {Promise<string>}
   */
  getChatResponse: async (userMessage) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing API key: please set REACT_APP_GEMINI_API_KEY in your environment'
      );
    }

    const endpoint = `/api/chat`;
    const payload = { user_input: userMessage };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    if (!data || !data.reply) {
      throw new Error('Empty response from Gemini');
    }
    const text = data.reply;
    return text.trim();
  }
};

export default geminiApiService;
