import React, { useState, useRef, useEffect } from 'react';
import geminiApiService from '../services/geminiApiService';

function ChatInterface({ onSaveConversation }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setError('');
    setIsLoading(true);
    setMessages(msgs => [...msgs, { sender: 'user', text: userInput }]);
    const input = userInput;
    setUserInput('');

    try {
      const replyText = await geminiApiService.getChatResponse(input);
      setMessages(msgs => [...msgs, { sender: 'bot', text: replyText }]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!messages.length) return;
    try {
      const res = await fetch('/save_conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      });
      if (!res.ok) throw new Error('Failed to save conversation');
      await res.json();
      alert('Conversation saved!');
      onSaveConversation?.(messages);
    } catch (err) {
      console.error(err);
      setError('Save failed: ' + err.message);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>TravelBuddy Chat</h2>
      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '300px',
        overflowY: 'auto'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '5px 0' }}>
            <strong>{m.sender === 'user' ? 'You' : 'Bot'}:</strong> {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <textarea
        rows={3}
        value={userInput}
        onChange={e => setUserInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type a message..."
        style={{ width: '100%', marginTop: '10px' }}
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        <button
          onClick={handleSave}
          disabled={!messages.length}
          style={{ marginLeft: '10px' }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
