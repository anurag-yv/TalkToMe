import React, { useState, useRef, useEffect } from 'react';

const animeColors = {
  background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  chatBubbleYou: '#fbc2eb',
  chatBubbleOther: '#a6c1ee',
  textColorYou: '#4b0082',
  textColorOther: '#2f2c6a',
  inputBackground: '#f3e8ff',
  inputTextColor: '#5b21b6',
  buttonBackground: '#c084fc',
  buttonHoverBackground: '#a855f7',
};

const Chat = () => {
  const [messages, setMessages] = useState([
    { user: 'Alice', text: 'Hi, anyone here?' },
    { user: 'Bob', text: 'Yes, you are not alone :)' },
  ]);
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = e => {
    e.preventDefault();
    if (!msg.trim()) return;
    setMessages([...messages, { user: 'You', text: msg.trim() }]);
    setMsg('');
    // Real implementation would send to backend or websocket
  };

  return (
    <div
      style={{
        height: '100vh',          // full viewport height
        maxWidth: 700,            // max width for readability
        margin: '0 auto',         // center horizontally
        padding: 20,
        background: animeColors.background,
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
      aria-label="Chat Room"
      role="region"
    >
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: animeColors.textColorYou, fontWeight: 'bold' }}>
        Chat Room
      </h2>

      <div
        style={{
          flex: 1,                 // fill available vertical space for scroll
          overflowY: 'auto',
          padding: 16,
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: '0 4px 15px rgba(140, 85, 255, 0.2)',
          border: '2px solid #c084fc',
          marginBottom: 15,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          wordBreak: 'break-word',
        }}
        tabIndex={0}
      >
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No messages yet. Say Hi!</p>
        ) : (
          messages.map((m, i) => {
            const isYou = m.user === 'You';
            return (
              <div
                key={i}
                style={{
                  maxWidth: '80%',
                  alignSelf: isYou ? 'flex-end' : 'flex-start',
                  backgroundColor: isYou ? animeColors.chatBubbleYou : animeColors.chatBubbleOther,
                  color: isYou ? animeColors.textColorYou : animeColors.textColorOther,
                  padding: '10px 14px',
                  borderRadius: 20,
                  borderTopRightRadius: isYou ? 4 : 20,
                  borderTopLeftRadius: isYou ? 20 : 4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  fontSize: 16,
                  lineHeight: 1.3,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
                aria-label={`${m.user} says: ${m.text}`}
              >
                <strong>{m.user}:</strong> {m.text}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          borderRadius: 30,
          backgroundColor: animeColors.inputBackground,
          boxShadow: '0 2px 10px rgba(197, 140, 253, 0.4)',
          padding: '10px 16px',
          border: '1.5px solid #d8b4fe',
        }}
        aria-label="Send message form"
      >
        <input
          type="text"
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Type your message..."
          required
          aria-required="true"
          style={{
            flex: 1,
            outline: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            color: animeColors.inputTextColor,
            fontSize: 16,
            fontWeight: '600',
            wordBreak: 'break-word',
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: animeColors.buttonBackground,
            color: 'white',
            border: 'none',
            padding: '10px 22px',
            borderRadius: 25,
            fontWeight: '700',
            fontSize: 16,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = animeColors.buttonHoverBackground)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = animeColors.buttonBackground)}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
