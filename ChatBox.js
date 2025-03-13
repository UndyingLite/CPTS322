import React, { useState } from 'react';

function ChatBox({ destination }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Mock AI response
    const aiResponse = `For ${destination}, try ${message.includes('food') ? 'local cuisine' : 'a popular spot'}!`;
    setChatHistory([...chatHistory, { user: message, ai: aiResponse }]);
    setMessage('');
  };

  return (
    <div className="chat-box">
      <h3>Chat with TravelBuddy</h3>
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index}>
            <p><strong>You:</strong> {chat.user}</p>
            <p><strong>AI:</strong> {chat.ai}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything!"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatBox; // Must have this line!