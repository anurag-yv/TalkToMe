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
  headerBackground: 'rgba(147, 51, 234, 0.85)',
  headerText: '#fff',
  borderColor: '#a78bfa',
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const Chat = () => {
  const [messages, setMessages] = useState([
    { user: 'Alice', text: 'Hi, anyone here?', time: new Date() },
    { user: 'Bob', text: 'Yes, you are not alone :)', time: new Date() },
  ]);
  const [msg, setMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom smoothly on new messages
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;

    setMessages((prev) => [
      ...prev,
      { user: 'You', text: msg.trim(), time: new Date() },
    ]);
    setMsg('');
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: animeColors.background,
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
        color: animeColors.textColorOther,
        boxSizing: 'border-box',
      }}
      aria-label="Chat Application"
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: animeColors.headerBackground,
          color: animeColors.headerText,
          padding: '16px 24px',
          fontWeight: 'bold',
          fontSize: 22,
          textAlign: 'center',
          userSelect: 'none',
          boxShadow: '0 2px 8px rgba(168,85,247,0.6)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        💬 Playful Chat Room
      </header>

      {/* Message List */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          scrollBehavior: 'smooth',
        }}
        tabIndex={0}
        aria-live="polite"
        aria-relevant="additions"
        role="list"
      >
        {messages.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>
            No messages yet — say hello! 👋
          </p>
        )}
        {messages.map((m, i) => {
          const isYou = m.user === 'You';
          return (
            <article
              key={i}
              role="listitem"
              aria-label={`${m.user} at ${formatTime(m.time)}`}
              style={{
                maxWidth: '75%',
                alignSelf: isYou ? 'flex-end' : 'flex-start',
                backgroundColor: isYou
                  ? animeColors.chatBubbleYou
                  : animeColors.chatBubbleOther,
                color: isYou ? animeColors.textColorYou : animeColors.textColorOther,
                padding: '12px 18px',
                borderRadius: 20,
                borderTopRightRadius: isYou ? 6 : 20,
                borderTopLeftRadius: isYou ? 20 : 6,
                boxShadow: '0 2px 7px rgba(0,0,0,0.08)',
                fontSize: 16,
                lineHeight: 1.35,
                whiteSpace: 'pre-wrap',
                userSelect: 'text',
                animation: 'fadeIn 0.3s ease',
              }}
            >
              <div>
                <strong>{m.user}:</strong>
              </div>
              <div>{m.text}</div>
              <time
                dateTime={m.time.toISOString()}
                style={{
                  display: 'block',
                  fontSize: 12,
                  color: isYou ? '#702963' : '#3b3b6e',
                  marginTop: 4,
                  fontStyle: 'italic',
                }}
              >
                {formatTime(m.time)}
              </time>
            </article>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input and Controls */}
      <footer
        style={{
          padding: '12px 24px',
          backgroundColor: animeColors.inputBackground,
          boxShadow: '0 -2px 12px rgba(197, 140, 253, 0.4)',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          borderTop: `2px solid ${animeColors.borderColor}`,
          zIndex: 10,
        }}
      >
        <form
          onSubmit={sendMessage}
          style={{ flex: 1, display: 'flex', gap: 12 }}
          aria-label="Send message form"
        >
          <input
            type="text"
            aria-required="true"
            aria-label="Message input field"
            placeholder="Type your message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 25,
              border: `1.5px solid ${animeColors.borderColor}`,
              outline: 'none',
              fontSize: 16,
              fontWeight: '600',
              color: animeColors.inputTextColor,
              boxShadow: 'inset 0 2px 6px rgba(197,140,253,0.3)',
            }}
          />
          <button
            type="submit"
            disabled={!msg.trim()}
            style={{
              backgroundColor: msg.trim()
                ? animeColors.buttonBackground
                : '#cbb9ee',
              color: 'white',
              border: 'none',
              padding: '12px 26px',
              borderRadius: 25,
              fontWeight: '700',
              fontSize: 16,
              cursor: msg.trim() ? 'pointer' : 'not-allowed',
              userSelect: 'none',
              transition: 'background-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.backgroundColor = animeColors.buttonHoverBackground;
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.backgroundColor = animeColors.buttonBackground;
            }}
          >
            Send
          </button>
        </form>
        <button
          onClick={clearChat}
          aria-label="Clear chat"
          title="Clear chat"
          style={{
            backgroundColor: '#e879f9',
            border: 'none',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 25,
            fontWeight: '700',
            fontSize: 16,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background-color 0.3s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#c241f5')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e879f9')}
        >
          Clear
        </button>
      </footer>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(8px);}
          to {opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default Chat;
