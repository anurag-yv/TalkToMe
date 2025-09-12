import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Dashboard = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [vibes, setVibes] = useState([]);
  const [newVibe, setNewVibe] = useState("");
  const [quote, setQuote] = useState({text: "You are enough just as you are!", author: "VibeBot"});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("vibes");
  const [userProgress, setUserProgress] = useState({mood: 4, learning: 3, social: 2});
  const [showInspiration, setShowInspiration] = useState(false);
  const socketRef = useRef(io(SOCKET_SERVER_URL, { transports: ["websocket"] }));
  const usernameRef = useRef(`Bloom${Math.floor(Math.random() * 1000)}`);

  const playClickSound = useCallback(() => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAACAgICAgICAgICAgICAgICAgICAg"
    );
    audio.play();
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const sendChatMessage = useCallback(() => {
    if (newMessage.trim()) {
      socketRef.current.emit("chatMessage", {
        username: usernameRef.current,
        message: newMessage,
        id: socketRef.current.id,
      });
      setNewMessage("");
      setIsTyping(false);
      playClickSound();
      showToast("Message shared with the garden!");
    }
  }, [newMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/vibes")
      .then((res) => res.json())
      .then((data) => setVibes(data))
      .catch((err) => {
        console.error("Error fetching vibes:", err);
        showToast("Failed to load blooms", "error");
      });

    socketRef.current.on("newVibe", (data) => {
      setVibes((prev) => [{ id: data.id, ...data }, ...prev]);
    });

    socketRef.current.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (msg.id === "bot") {
        showToast("New message from Garden Guide!", "success");
      }
    });

    socketRef.current.on("userList", (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.emit("join", usernameRef.current);

    return () => {
      socketRef.current.off("newVibe");
      socketRef.current.off("chatMessage");
      socketRef.current.off("userList");
    };
  }, []);

  const quotes = [
    {text: "You are enough just as you are!", author: "Garden Guide"},
    {text: "Growth takes time but every small step matters", author: "Mindful Mentor"},
    {text: "Your unique journey is what makes you beautiful", author: "Garden Guide"},
    {text: "Even on difficult days, you're still growing", author: "Wellness Blossom"},
    {text: "Connection helps everything grow better", author: "Community Bloom"},
  ];

  const inspirationCards = [
    { title: "Mindful Minute", content: "Take 60 seconds to breathe deeply and notice three things around you.", icon: "🌿" },
    { title: "Learning Seed", content: "Try learning one small new thing today - it adds up over time.", icon: "🌱" },
    { title: "Connection Water", content: "Reach out to someone who makes you feel understood.", icon: "💧" },
    { title: "Gratitude Petal", content: "Write down one thing you're grateful for today.", icon: "🌸" },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@300;400;500;600&display=swap');

          :root {
            --primary: #7B9FCF;
            --primary-light: #9BB9E0;
            --primary-dark: #5A7FBB;
            --secondary: #FFD166;
            --accent: #06D6A0;
            --accent-dark: #04B586;
            --background: #F9F7FE;
            --card: rgba(255, 255, 255, 0.92);
            --text: #2D3047;
            --text-light: #6B7280;
            --darkBackground: #1A1A2E;
            --darkCard: rgba(37, 40, 61, 0.92);
            --darkText: #E8E8E8;
            --darkTextLight: #A0A0B0;
            --red: #EF476F;
            --purple: #9B72CF;
            --green: #06D6A0;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
            background: var(--background);
            transition: background 0.5s ease;
          }

          .dashboard {
            min-height: 100vh;
            width: 100%;
            padding: 2rem;
            background: var(--background);
            color: var(--text);
            position: relative;
            overflow-x: hidden;
            transition: all 0.3s ease;
          }

          .dashboard.dark {
            background: var(--darkBackground);
            color: var(--darkText);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid rgba(123, 159, 207, 0.3);
          }

          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 2.2rem;
            font-weight: 600;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .user-avatar {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
          }

          .controls {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .dark-mode-button {
            background: var(--primary);
            border-radius: 50%;
            width: 2.8rem;
            height: 2.8rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            box-shadow: 0 4px 12px rgba(123, 159, 207, 0.3);
          }

          .dark-mode-button:hover {
            transform: scale(1.05) rotate(12deg);
            background: var(--primary-light);
          }

          .main-container {
            display: grid;
            grid-template-columns: 1fr 1.8fr;
            gap: 2rem;
            max-width: 1300px;
            margin: 0 auto;
          }

          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .content {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .card {
            background: var(--card);
            border-radius: 1.2rem;
            padding: 1.8rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            position: relative;
            overflow: hidden;
          }

          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          }

          .dashboard.dark .card {
            background: var(--darkCard);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          }

          .card-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 1.2rem;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .input {
            width: 100%;
            padding: 0.9rem 1.2rem;
            border-radius: 0.9rem;
            border: 1px solid rgba(123, 159, 207, 0.3);
            background: rgba(255, 255, 255, 0.7);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            outline: none;
            transition: all 0.3s ease;
          }

          .dashboard.dark .input {
            color: var(--darkText);
            background: rgba(37, 40, 61, 0.5);
            border-color: rgba(255, 255, 255, 0.15);
          }

          .input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(123, 159, 207, 0.2);
          }

          .button {
            background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
            border-radius: 0.9rem;
            border: none;
            color: white;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 0.95rem;
            padding: 0.9rem 1.6rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 10px rgba(123, 159, 207, 0.3);
          }

          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(123, 159, 207, 0.4);
          }

          .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .button-secondary {
            background: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
            box-shadow: none;
          }

          .button-secondary:hover {
            background: rgba(123, 159, 207, 0.1);
            box-shadow: none;
          }

          .vibe-list, .user-list, .chat-messages {
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
            max-height: 220px;
            overflow-y: auto;
            padding-right: 0.5rem;
          }

          .vibe-item {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.1) 0%, rgba(155, 114, 207, 0.1) 100%);
            padding: 1rem;
            border-radius: 0.9rem;
            border-left: 3px solid var(--primary);
            font-size: 0.9rem;
            transition: all 0.3s ease;
            animation: fadeIn 0.5s ease;
          }

          .dashboard.dark .vibe-item {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.15) 0%, rgba(155, 114, 207, 0.15) 100%);
          }

          .vibe-item:hover {
            transform: translateX(5px);
          }

          .user-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(123, 159, 207, 0.1);
            padding: 0.9rem;
            border-radius: 0.9rem;
            transition: all 0.3s ease;
          }

          .dashboard.dark .user-item {
            background: rgba(123, 159, 207, 0.15);
          }

          .user-item:hover {
            transform: translateX(5px);
          }

          .quote-container {
            text-align: center;
            padding: 1.8rem;
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.1) 0%, rgba(6, 214, 160, 0.1) 100%);
            border-radius: 1.2rem;
            margin: 1.2rem 0;
            position: relative;
            overflow: hidden;
          }

          .dashboard.dark .quote-container {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.2) 0%, rgba(6, 214, 160, 0.2) 100%);
          }

          .quote-container::before {
            content: '"';
            position: absolute;
            top: 0.5rem;
            left: 1rem;
            font-size: 4rem;
            opacity: 0.1;
            font-family: 'Playfair Display', serif;
          }

          .quote {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 1rem;
            position: relative;
            z-index: 2;
          }

          .quote-author {
            color: var(--primary);
            font-weight: 500;
          }

          .dashboard.dark .quote-author {
            color: var(--primary-light);
          }

          .chat-message {
            padding: 0.9rem 1.2rem;
            border-radius: 1.2rem;
            margin-bottom: 0.8rem;
            max-width: 80%;
            font-size: 0.95rem;
            animation: fadeIn 0.4s ease;
            position: relative;
          }

          .chat-message.self {
            background: linear-gradient(135deg, rgba(6, 214, 160, 0.15) 0%, rgba(123, 159, 207, 0.15) 100%);
            margin-left: auto;
            border-bottom-right-radius: 0.3rem;
          }

          .chat-message.other {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.15) 0%, rgba(255, 209, 102, 0.15) 100%);
            margin-right: auto;
            border-bottom-left-radius: 0.3rem;
          }

          .chat-message.bot {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.15) 0%, rgba(155, 114, 207, 0.15) 100%);
            border-left: 3px solid var(--purple);
          }

          .dashboard.dark .chat-message.self {
            background: linear-gradient(135deg, rgba(6, 214, 160, 0.2) 0%, rgba(123, 159, 207, 0.2) 100%);
          }

          .dashboard.dark .chat-message.other {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.2) 0%, rgba(255, 209, 102, 0.2) 100%);
          }

          .dashboard.dark .chat-message.bot {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.2) 0%, rgba(155, 114, 207, 0.2) 100%);
          }

          .chat-input-container {
            display: flex;
            gap: 0.8rem;
            margin-top: 1.2rem;
          }

          .tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.2rem;
            border-bottom: 1px solid rgba(123, 159, 207, 0.2);
            padding-bottom: 0.8rem;
          }

          .tab {
            padding: 0.6rem 1.2rem;
            border-radius: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
          }

          .tab.active {
            background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
            color: white;
            box-shadow: 0 4px 10px rgba(123, 159, 207, 0.3);
          }

          .tab:hover:not(.active) {
            background: rgba(123, 159, 207, 0.1);
          }

          .progress-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1rem;
          }

          .progress-item {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .progress-label {
            min-width: 80px;
            font-weight: 500;
            color: var(--primary);
          }

          .dashboard.dark .progress-label {
            color: var(--primary-light);
          }

          .progress-bar {
            flex: 1;
            height: 8px;
            background: rgba(123, 159, 207, 0.2);
            border-radius: 4px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
            border-radius: 4px;
            transition: width 0.5s ease;
          }

          .inspiration-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 1rem;
          }

          .inspiration-card {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.1) 0%, rgba(255, 209, 102, 0.1) 100%);
            padding: 1.2rem;
            border-radius: 0.9rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .dashboard.dark .inspiration-card {
            background: linear-gradient(135deg, rgba(123, 159, 207, 0.15) 0%, rgba(255, 209, 102, 0.15) 100%);
          }

          .inspiration-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
          }

          .card-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .card-title-sm {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--primary);
          }

          .dashboard.dark .card-title-sm {
            color: var(--primary-light);
          }

          .card-content {
            font-size: 0.85rem;
            color: var(--text-light);
          }

          .dashboard.dark .card-content {
            color: var(--darkTextLight);
          }

          .chatbot-button {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
            border-radius: 50%;
            width: 4rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 20px rgba(123, 159, 207, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 100;
            border: none;
            color: white;
            font-size: 1.5rem;
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .chatbot-button:hover {
            transform: scale(1.1) rotate(12deg);
            box-shadow: 0 8px 25px rgba(123, 159, 207, 0.5);
          }

          .chatbot-modal {
            position: fixed;
            bottom: 7rem;
            right: 2rem;
            width: 380px;
            height: 500px;
            background: var(--card);
            border-radius: 1.5rem;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            z-index: 100;
            animation: slideIn 0.4s ease;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.6);
          }

          .dashboard.dark .chatbot-modal {
            background: var(--darkCard);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .chatbot-header {
            padding: 1.2rem;
            background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .chatbot-body {
            flex: 1;
            padding: 1.2rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.9rem;
            background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%237B9FCF' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
          }

          .dashboard.dark .chatbot-body {
            background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%237B9FCF' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
          }

          .chatbot-footer {
            padding: 1.2rem;
            border-top: 1px solid rgba(123, 159, 207, 0.2);
          }

          .toast {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            padding: 1rem 1.8rem;
            border-radius: 0.9rem;
            color: white;
            background: linear-gradient(135deg, var(--primary) 0%, var(--purple) 100%);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: fadeInUp 0.4s ease;
            font-weight: 500;
          }

          .toast.error {
            background: linear-gradient(135deg, var(--red) 0%, #F25C54 100%);
          }

          .empty-state {
            text-align: center;
            padding: 2rem 1rem;
            color: var(--text-light);
            opacity: 0.8;
            font-style: italic;
          }

          .dashboard.dark .empty-state {
            color: var(--darkTextLight);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes fadeInUp {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }

          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(123, 159, 207, 0.1);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: var(--primary-dark);
          }

          @media (max-width: 1024px) {
            .main-container {
              grid-template-columns: 1fr;
            }
            
            .inspiration-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
            .dashboard {
              padding: 1.2rem;
            }
            
            .header {
              flex-direction: column;
              gap: 1rem;
              align-items: flex-start;
            }
            
            .chatbot-modal {
              width: 90%;
              right: 5%;
              bottom: 5.5rem;
            }
            
            .chatbot-button {
              bottom: 1.5rem;
              right: 1.5rem;
            }
            
            .tabs {
              overflow-x: auto;
              padding-bottom: 0.5rem;
            }
          }
        `}
      </style>
      <main className={`dashboard ${darkMode ? "dark" : ""}`}>
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
        
        <div className="header">
          <div className="logo">
             TalkToMe
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {usernameRef.current.charAt(0)}
            </div>
            <div>
              <div style={{fontWeight: "500"}}>{usernameRef.current}</div>
              <div style={{fontSize: "0.9rem", color: darkMode ? "var(--darkTextLight)" : "var(--text-light)"}}>
                Growing since today
              </div>
            </div>
          </div>
          <div className="controls">
            <button
              className="dark-mode-button"
              onClick={() => {
                setDarkMode((prev) => !prev);
                playClickSound();
                showToast(`Switched to ${darkMode ? "light" : "moonlight"} mode`);
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
        
        <div className="main-container">
          <div className="sidebar">
            <div className="card">
              <h3 className="card-title">
                <span>🌼</span> Plant a Bloom
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newVibe.trim()) return;
                  socketRef.current.emit("newVibe", {
                    user: usernameRef.current,
                    content: newVibe,
                  });
                  setNewVibe("");
                  playClickSound();
                  showToast("Your bloom was added to the garden!");
                }}
              >
                <input
                  type="text"
                  value={newVibe}
                  onChange={(e) => setNewVibe(e.target.value)}
                  placeholder="Share an encouraging thought..."
                  className="input"
                  aria-label="Share positive vibe"
                />
                <button 
                  type="submit" 
                  className="button" 
                  style={{marginTop: "0.9rem", width: "100%"}}
                  disabled={!newVibe.trim()}
                >
                  Plant This Bloom
                </button>
              </form>
              
              <div className="vibe-list" style={{marginTop: "1.2rem"}}>
                {vibes.length === 0 ? (
                  <div className="empty-state">Be the first to plant a bloom in the garden!</div>
                ) : (
                  vibes.slice(0, 4).map((vibe) => (
                    <div key={vibe.id} className="vibe-item">
                      <strong>{vibe.user}:</strong> {vibe.content}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="card">
              <h3 className="card-title">
                <span>📊</span> Your Growth
              </h3>
              <div className="progress-container">
                <div className="progress-item">
                  <span className="progress-label">Mood</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${userProgress.mood * 20}%`}}></div>
                  </div>
                  <span>{userProgress.mood}/5</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Learning</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${userProgress.learning * 20}%`}}></div>
                  </div>
                  <span>{userProgress.learning}/5</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Connection</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${userProgress.social * 20}%`}}></div>
                  </div>
                  <span>{userProgress.social}/5</span>
                </div>
              </div>
              <button 
                className="button-secondary" 
                style={{width: "100%", marginTop: "1rem"}}
                onClick={() => {
                  setUserProgress({
                    mood: Math.min(5, userProgress.mood + 1),
                    learning: Math.min(5, userProgress.learning + 1),
                    social: Math.min(5, userProgress.social + 1)
                  });
                  showToast("You're growing every day!");
                }}
              >
                I've Grown Today
              </button>
            </div>
            
            <div className="card">
              <h3 className="card-title">
                <span>🌿</span> Daily Inspiration
              </h3>
              <div className="quote-container">
                <p className="quote">"{quote.text}"</p>
                <p className="quote-author">— {quote.author}</p>
                <button
                  className="button-secondary"
                  onClick={() => {
                    const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
                    setQuote(newQuote);
                    playClickSound();
                    showToast("New inspiration for your journey!");
                  }}
                >
                  New Inspiration
                </button>
              </div>
            </div>
          </div>
          
          <div className="content">
            <div className="card">
              <h3 className="card-title">
                <span>💬</span> Garden Chat
              </h3>
              
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === "vibes" ? "active" : ""}`}
                  onClick={() => setActiveTab("vibes")}
                >
                  Recent Blooms
                </div>
                <div 
                  className={`tab ${activeTab === "chat" ? "active" : ""}`}
                  onClick={() => setActiveTab("chat")}
                >
                  Conversation
                </div>
                <div 
                  className={`tab ${activeTab === "community" ? "active" : ""}`}
                  onClick={() => setActiveTab("community")}
                >
                  Garden Friends
                </div>
                <div 
                  className={`tab ${activeTab === "inspiration" ? "active" : ""}`}
                  onClick={() => setActiveTab("inspiration")}
                >
                  Wellness Tips
                </div>
              </div>
              
              {activeTab === "vibes" && (
                <div className="vibe-list">
                  {vibes.length === 0 ? (
                    <div className="empty-state">No blooms yet. Plant the first one!</div>
                  ) : (
                    vibes.map((vibe) => (
                      <div key={vibe.id} className="vibe-item">
                        <strong>{vibe.user}:</strong> {vibe.content}
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {activeTab === "chat" && (
                <>
                  <div className="chat-messages">
                    {chatMessages.length === 0 ? (
                      <div className="empty-state">Start a conversation with the garden community!</div>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`chat-message ${msg.id === socketRef.current.id ? "self" : "other"} ${msg.id === "bot" ? "bot" : ""}`}
                        >
                          <strong>{msg.username}:</strong> {msg.message}
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="chat-input-container">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        setIsTyping(!!e.target.value.trim());
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Share something with the garden..."
                      className="input"
                      aria-label="Chat message"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="button"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                  {isTyping && <p style={{marginTop: "0.8rem", fontSize: "0.9rem", color: "var(--primary)"}}>Someone is typing...</p>}
                </>
              )}
              
              {activeTab === "community" && (
                <div className="user-list">
                  {onlineUsers.length === 0 ? (
                    <div className="empty-state">You're the first one in the garden. Others will join soon!</div>
                  ) : (
                    onlineUsers.map((user, idx) => (
                      <div key={idx} className="user-item">
                        <span>🌻 {user}</span>
                        <button
                          className="button"
                          style={{padding: "0.4rem 0.8rem", fontSize: "0.8rem"}}
                          onClick={() => {
                            socketRef.current.emit("chatMessage", {
                              username: usernameRef.current,
                              message: `Hello ${user}! How's your garden growing?`,
                              id: socketRef.current.id,
                            });
                            playClickSound();
                            showToast(`Sent a greeting to ${user}!`);
                            setActiveTab("chat");
                          }}
                        >
                          Send Sunshine
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
              
              {activeTab === "inspiration" && (
                <div className="inspiration-grid">
                  {inspirationCards.map((card, index) => (
                    <div 
                      key={index} 
                      className="inspiration-card"
                      onClick={() => {
                        playClickSound();
                        showToast(`Added "${card.title}" to your day!`);
                      }}
                    >
                      <div className="card-icon">{card.icon}</div>
                      <div className="card-title-sm">{card.title}</div>
                      <div className="card-content">{card.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="card">
              <h3 className="card-title">
                <span>🌞</span> Today's Intentions
              </h3>
              <div style={{lineHeight: "1.6"}}>
                <p style={{marginBottom: "1rem"}}>Set a gentle intention for your day. What would help you feel nourished and supported?</p>
                <div style={{display: "flex", gap: "0.8rem", flexWrap: "wrap"}}>
                  {["Rest when needed", "Learn one new thing", "Reach out to someone", "Be kind to myself"].map((intention, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "rgba(123, 159, 207, 0.1)",
                        borderRadius: "2rem",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onClick={() => {
                        playClickSound();
                        showToast(`"${intention}" set as today's intention`);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(123, 159, 207, 0.2)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "rgba(123, 159, 207, 0.1)";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      {intention}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button
          className="chatbot-button"
          onClick={() => {
            setShowChatbot((prev) => !prev);
            playClickSound();
          }}
          aria-label="Toggle chatbot"
        >
          🌸
        </button>
        
        {showChatbot && (
          <div className="chatbot-modal">
            <div className="chatbot-header">
              <h3>Garden Guide</h3>
              <button
                onClick={() => {
                  setShowChatbot(false);
                  playClickSound();
                }}
                aria-label="Close chatbot"
                style={{background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer"}}
              >
                ×
              </button>
            </div>
            <div className="chatbot-body">
              {chatMessages.length === 0 ? (
                <div style={{textAlign: "center", padding: "2rem 1rem"}}>
                  <p>Hello there! I'm your Garden Guide 🌷</p>
                  <p style={{marginTop: "1rem"}}>I'm here to help you grow and find connection. What would you like to talk about today?</p>
                  <div style={{marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.8rem"}}>
                    <div 
                      className="chat-message bot"
                      style={{cursor: "pointer"}}
                      onClick={() => {
                        setNewMessage("I'm feeling a bit lonely today");
                        showToast("Your guide is here for you");
                      }}
                    >
                      <strong>Garden Guide:</strong> I'm feeling a bit lonely today
                    </div>
                    <div 
                      className="chat-message bot"
                      style={{cursor: "pointer"}}
                      onClick={() => {
                        setNewMessage("What's something I can learn right now?");
                        showToast("Curiosity helps us grow");
                      }}
                    >
                      <strong>Garden Guide:</strong> What's something I can learn right now?
                    </div>
                    <div 
                      className="chat-message bot"
                      style={{cursor: "pointer"}}
                      onClick={() => {
                        setNewMessage("I need some encouragement");
                        showToast("You're doing better than you think");
                      }}
                    >
                      <strong>Garden Guide:</strong> I need some encouragement
                    </div>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${msg.id === socketRef.current.id ? "self" : "other"} ${msg.id === "bot" ? "bot" : ""}`}
                  >
                    <strong>{msg.username}:</strong> {msg.message}
                  </div>
                ))
              )}
            </div>
            <div className="chatbot-footer">
              <div className="chat-input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setIsTyping(!!e.target.value.trim());
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Chat with your Garden Guide..."
                  className="input"
                />
                <button
                  onClick={sendChatMessage}
                  className="button"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;