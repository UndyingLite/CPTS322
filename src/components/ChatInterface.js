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
      // 2. Call the new GetChatResponse
      const aiReply = await geminiApiService.getChatResponse(userInput);

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

  // Save conversation (logs) to DB or local storage
  const handleSave = () => {
    if (onSaveConversation) {
      onSaveConversation(messages);
    } else {
      console.log('No onSaveConversation prop provided. Could store to localStorage or DB here.');
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
