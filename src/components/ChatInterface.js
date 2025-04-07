import React, { useState } from 'react';
import geminiApiService from '../services/geminiApiService';

function ChatInterface({ onSaveConversation }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
  if (!userInput.trim()) return;
  
  // 1. Add user message to local state
  const userMsg = { sender: 'user', text: userInput };
  setMessages((prev) => [...prev, userMsg]);
  setUserInput('');
  setError(null);
  setIsLoading(true);
  
  try {
    let aiReply;
    try {
      // Try to get a response from Gemini
      aiReply = await geminiApiService.getChatResponse(userInput);
    } catch (apiError) {
      console.warn('Gemini API error, falling back to mock data:', apiError);
      // Fall back to mock data if API fails
      aiReply = geminiApiService.getMockChatResponse(userInput);
    }
    
    // 3. Add AI response
    const botMsg = { sender: 'bot', text: aiReply };
    setMessages((prev) => [...prev, botMsg]);
  } catch (err) {
    console.error('AI Service Error:', err);
    setError('AI service is unavailable. Please try again later.');
  } finally {
    setIsLoading(false);
  }
};

  // Save conversation (logs) to your Flask back-end
  const handleSave = async () => {
    if (!messages.length) return;

    try {
      // Make a POST request to a Flask endpoint
      const response = await fetch('/save_conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error('Failed to save conversation');
      }

      // Optionally parse the response JSON
      const data = await response.json();
      console.log('Conversation saved:', data);

      // You could show a success alert or message
      alert('Conversation saved successfully!');
    } catch (err) {
      console.error('Error saving conversation:', err);
      setError('Failed to save conversation. Please try again.');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Chat with TravelBuddy</h2>

      <div style={{ border: '1px solid #ccc', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '5px 0' }}>
            <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <textarea
        rows="3"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask for travel suggestions..."
        style={{ width: '100%', marginTop: '10px' }}
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        <button onClick={handleSave} style={{ marginLeft: '10px' }} disabled={!messages.length}>
          Save Conversation
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
