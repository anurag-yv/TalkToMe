import React, { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { user: 'Alice', text: 'Hi, anyone here?' },
    { user: 'Bob', text: 'Yes, you are not alone :)' },
  ]);
  const [msg, setMsg] = useState('');

  const sendMessage = e => {
    e.preventDefault();
    setMessages([...messages, { user: 'You', text: msg }]);
    setMsg('');
    // Real implementation would send to backend or websocket
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat Room</h2>
      <div style={{ border: '1px solid #ddd', height: 150, overflowY: 'scroll', marginBottom: 10, padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i}><b>{m.user}:</b> {m.text}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Type your message..."
          required
          style={{ width: '80%', marginRight: 8 }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
