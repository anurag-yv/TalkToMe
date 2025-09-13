import React, { useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Dashboard = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [toast, setToast] = useState(null);
  const [vibes, setVibes] = useState([]);
  const [newVibe, setNewVibe] = useState("");
  const [quote, setQuote] = useState({ text: "You are enough just as you are!", author: "VibeBot" });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("vibes");
  const [userProgress, setUserProgress] = useState({ mood: 4, learning: 3, social: 2 });
  const [timeSpent, setTimeSpent] = useState(0); // Time in seconds
  const [resources, setResources] = useState([]);
  const socketRef = useRef(io(SOCKET_SERVER_URL, { transports: ["websocket"] }));
  const usernameRef = useRef(`Bloom${Math.floor(Math.random() * 1000)}`);
  const timerRef = useRef(null);
  const displayTimerRef = useRef(null);
  const vibeInputRef = useRef(null);
  const chatInputRef = useRef(null);

  // Format time to HH:MM:SS
  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, Math.floor(seconds)); // Ensure non-negative integer
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playClickSound = useCallback(() => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAACAgICAgICAgICAgICAgICAgICAg"
    );
    audio.play();
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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
      chatInputRef.current?.focus();
    }
  }, [newMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const saveProgress = useCallback(async (progress) => {
    try {
      await fetch("http://localhost:5000/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameRef.current, progress }),
      });
      showToast("Progress saved! 🌟", "success");
    } catch (err) {
      console.error("Error saving progress:", err);
      showToast("Failed to save progress", "error");
    }
  }, []);

  const saveTimeSpent = useCallback(async () => {
    try {
      await fetch("http://localhost:5000/api/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameRef.current, timeSpent: Math.floor(timeSpent) }),
      });
    } catch (err) {
      console.error("Error saving time:", err);
    }
  }, [timeSpent]);

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/resources");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setResources([
        { title: "Mindful Breathing Exercise", url: "https://www.youtube.com/watch?v=some-video", description: "A quick 5-min guide to calm your mind." },
        { title: "Daily Journal Prompt", url: "https://example.com/journal", description: "Reflect on your growth today." },
      ]);
    }
  }, []);

  useEffect(() => {
    // Internal timer for accurate time tracking
    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = Math.floor(prev + 1); // Ensure integer
        if (newTime % 30 === 0) saveTimeSpent();
        return newTime;
      });
    }, 1000);

    // UI update timer (every 5 seconds to reduce visual noise)
    displayTimerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev); // Trigger re-render
    }, 5000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(displayTimerRef.current);
      saveTimeSpent();
    };
  }, [saveTimeSpent]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/progress");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const userProgress = data.find((item) => item.username === usernameRef.current);
        if (userProgress) setUserProgress(userProgress.progress);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    const fetchTime = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/time");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const userTime = data.find((item) => item.username === usernameRef.current);
        if (userTime) {
          const safeTime = Math.max(0, Math.floor(userTime.timeSpent)); // Sanitize
          setTimeSpent(isNaN(safeTime) ? 0 : safeTime);
        }
      } catch (err) {
        console.error("Error fetching time:", err);
        setTimeSpent(0); // Fallback to 0
      }
    };

    fetchProgress();
    fetchTime();
    fetchResources();

    fetch("http://localhost:5000/api/vibes")
      .then((res) => res.json())
      .then((data) => setVibes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching vibes:", err);
        showToast("Failed to load blooms", "error");
      });

    socketRef.current.on("newVibe", (data) => {
      setVibes((prev) => [{ id: data.id, ...data }, ...prev]);
    });

    socketRef.current.on("chatMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
      if (msg.id === "bot") showToast("New message from Garden Guide!", "success");
    });

    socketRef.current.on("userList", (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.emit("join", usernameRef.current);

    return () => {
      socketRef.current.off("newVibe");
      socketRef.current.off("chatMessage");
      socketRef.current.off("userList");
      clearInterval(timerRef.current);
      clearInterval(displayTimerRef.current);
      saveTimeSpent();
    };
  }, [fetchResources, saveTimeSpent]);

  const quotes = [
    { text: "You are enough just as you are!", author: "Garden Guide" },
    { text: "Growth takes time but every small step matters", author: "Mindful Mentor" },
    { text: "Your unique journey is what makes you beautiful", author: "Garden Guide" },
    { text: "Even on difficult days, you're still growing", author: "Wellness Blossom" },
    { text: "Connection helps everything grow better", author: "Community Bloom" },
  ];

  const inspirationCards = [
    { title: "Mindful Minute", content: "Take 60 seconds to breathe deeply.", icon: "🌿" },
    { title: "Learning Seed", content: "Learn one new thing today.", icon: "🌱" },
    { title: "Connection Water", content: "Reach out to a friend.", icon: "💧" },
    { title: "Gratitude Petal", content: "Note one thing you're grateful for.", icon: "🌸" },
  ];

  const updateProgress = (key) => {
    setUserProgress((prev) => {
      const newProgress = { ...prev, [key]: Math.min(5, prev[key] + 1) };
      saveProgress(newProgress);
      return newProgress;
    });
    showToast("Growth updated! 🚀", "success");
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

          :root {
            --primary: #FF6F91; /* Soft coral */
            --primary-light: #FF9AB2;
            --primary-dark: #E64A6F;
            --secondary: #7EE8FA; /* Bright aqua */
            --accent: #FFD166; /* Sunny yellow */
            --accent-dark: #FFB627;
            --background: linear-gradient(135deg, #FFF1E6 0%, #C3E7FA 100%); /* Creamy peach to soft sky blue */
            --card: rgba(255, 255, 255, 0.95);
            --text: #2D3748;
            --text-light: #4A5568;
            --darkBackground: linear-gradient(135deg, #2D3047 0%, #5E6472 100%); /* Deep indigo to cool slate */
            --darkCard: rgba(45, 48, 71, 0.95);
            --darkText: #F7FAFC;
            --darkTextLight: #A0AEC0;
            --red: #E53E3E;
            --purple: #9F7AEA;
            --green: #38A169;
            --gradient-primary: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            --gradient-secondary: linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%);
            --highContrastBackground: #000000;
            --highContrastCard: #FFFFFF;
            --highContrastText: #000000;
            --highContrastAccent: #FFFF00;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
          }

          body {
            overflow-x: hidden;
            background: var(--background);
            transition: background 0.5s ease;
          }

          .dashboard {
            min-height: 100vh;
            width: 100%;
            padding: 3rem;
            color: var(--text);
            position: relative;
            transition: all 0.3s ease;
          }

          .dashboard.dark {
            background: var(--darkBackground);
            color: var(--darkText);
          }

          .dashboard.high-contrast {
            background: var(--highContrastBackground);
            color: var(--highContrastText);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3rem;
            padding: 2rem;
            border-radius: 1.5rem;
            background: var(--card);
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
          }

          .dashboard.dark .header,
          .dashboard.high-contrast .header {
            background: var(--darkCard);
          }

          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 3rem;
            font-weight: 700;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: logoBounce 2.5s ease-in-out infinite;
          }

          .dashboard.high-contrast .logo {
            background: none;
            color: var(--highContrastText);
          }

          @keyframes logoBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          .logo::before {
            content: '🌸';
            font-size: 2.5rem;
            animation: spin 6s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
            border-radius: 1.5rem;
            background: var(--card);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
          }

          .dashboard.dark .user-info,
          .dashboard.high-contrast .user-info {
            background: var(--darkCard);
          }

          .user-info:hover {
            transform: scale(1.05);
          }

          .user-avatar {
            width: 4.5rem;
            height: 4.5rem;
            border-radius: 50%;
            background: var(--gradient-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.8rem;
            font-weight: 700;
            animation: pulseAvatar 2s infinite;
          }

          .dashboard.high-contrast .user-avatar {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          @keyframes pulseAvatar {
            0% { box-shadow: 0 0 0 0 rgba(255, 111, 145, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(255, 111, 145, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 111, 145, 0); }
          }

          .controls {
            display: flex;
            gap: 1.5rem;
            align-items: center;
          }

          .control-button {
            background: var(--gradient-secondary);
            border-radius: 50%;
            width: 4rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-size: 1.8rem;
            box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
          }

          .dashboard.high-contrast .control-button {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          .control-button:hover, .control-button:focus {
            transform: scale(1.15) rotate(10deg);
            box-shadow: 0 8px 25px rgba(255, 209, 102, 0.6);
            outline: 4px solid var(--accent-dark);
          }

          .main-container {
            display: grid;
            grid-template-columns: 1fr 2.5fr;
            gap: 3.5rem;
            max-width: 1600px;
            margin: 0 auto;
            width: 90%;
          }

          .sidebar, .content {
            display: flex;
            flex-direction: column;
            gap: 3.5rem;
          }

          .card {
            background: var(--card);
            border-radius: 2rem;
            padding: 3rem;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.8);
            position: relative;
            overflow: hidden;
            background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FF6F91' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
          }

          .dashboard.dark .card,
          .dashboard.high-contrast .card {
            background: var(--darkCard);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .card:hover {
            transform: translateY(-12px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          }

          .card-title {
            font-family: 'Playfair Display', serif;
            font-size: 2.3rem;
            font-weight: 700;
            margin-bottom: 2rem;
            background: var(--gradient-secondary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .dashboard.high-contrast .card-title {
            background: none;
            color: var(--highContrastText);
          }

          .input {
            width: 100%;
            padding: 1.5rem 2rem;
            border-radius: 1.5rem;
            border: 2px solid transparent;
            background: rgba(255, 255, 255, 0.9);
            color: var(--text);
            font-size: 1.2rem;
            line-height: 1.6;
            outline: none;
            transition: all 0.3s ease;
            min-height: 44px;
          }

          .dashboard.dark .input {
            background: rgba(45, 48, 71, 0.9);
            color: var(--darkText);
          }

          .dashboard.high-contrast .input {
            background: #FFFFFF;
            color: #000000;
            border: 2px solid #000000;
          }

          .input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 6px rgba(255, 111, 145, 0.3);
            transform: scale(1.02);
          }

          .button {
            background: var(--gradient-primary);
            border-radius: 1.5rem;
            border: none;
            color: white;
            font-weight: 600;
            font-size: 1.2rem;
            padding: 1.5rem 2.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(255, 111, 145, 0.4);
            position: relative;
            overflow: hidden;
            min-height: 44px;
          }

          .dashboard.high-contrast .button {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          .button:hover, .button:focus {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(255, 111, 145, 0.6);
            outline: 4px solid var(--primary-dark);
          }

          .button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .button-secondary {
            background: transparent;
            color: var(--accent);
            border: 2px solid var(--accent);
            box-shadow: none;
          }

          .dashboard.high-contrast .button-secondary {
            border: 2px solid var(--highContrastText);
            color: var(--highContrastText);
          }

          .button-secondary:hover, .button-secondary:focus {
            background: var(--accent);
            color: white;
            transform: translateY(-5px);
          }

          .vibe-list, .user-list, .chat-messages {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-height: 350px;
            overflow-y: auto;
            padding-right: 1rem;
          }

          .vibe-item {
            background: linear-gradient(135deg, rgba(255, 111, 145, 0.3) 0%, rgba(126, 232, 250, 0.3) 100%);
            padding: 2rem;
            border-radius: 1.5rem;
            border-left: 6px solid var(--primary);
            font-size: 1.2rem;
            line-height: 1.7;
            transition: all 0.3s ease;
            animation: slideInUp 0.6s ease;
          }

          .dashboard.dark .vibe-item {
            background: linear-gradient(135deg, rgba(255, 111, 145, 0.4) 0%, rgba(126, 232, 250, 0.4) 100%);
          }

          .dashboard.high-contrast .vibe-item {
            background: #FFFFFF;
            border-left: 6px solid #000000;
            color: #000000;
          }

          .vibe-item:hover {
            transform: translateX(10px);
            background: linear-gradient(135deg, rgba(255, 111, 145, 0.4) 0%, rgba(126, 232, 250, 0.4) 100%);
          }

          .user-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, rgba(255, 209, 102, 0.3) 0%, rgba(159, 122, 234, 0.3) 100%);
            padding: 2rem;
            border-radius: 1.5rem;
            font-size: 1.2rem;
            transition: all 0.3s ease;
          }

          .dashboard.dark .user-item {
            background: linear-gradient(135deg, rgba(255, 209, 102, 0.4) 0%, rgba(159, 122, 234, 0.4) 100%);
          }

          .dashboard.high-contrast .user-item {
            background: #FFFFFF;
            color: #000000;
          }

          .user-item:hover {
            transform: translateX(10px);
          }

          .quote-container {
            text-align: center;
            padding: 3rem;
            background: linear-gradient(135deg, rgba(255, 111, 145, 0.25) 0%, rgba(126, 232, 250, 0.25) 100%);
            border-radius: 2rem;
            margin: 2rem 0;
            position: relative;
            animation: gradientPulse 5s ease infinite;
          }

          .dashboard.high-contrast .quote-container {
            background: #FFFFFF;
            color: #000000;
          }

          @keyframes gradientPulse {
            0%, 100% { background: linear-gradient(135deg, rgba(255, 111, 145, 0.25) 0%, rgba(126, 232, 250, 0.25) 100%); }
            50% { background: linear-gradient(135deg, rgba(126, 232, 250, 0.25) 0%, rgba(255, 111, 145, 0.25) 100%); }
          }

          .quote {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 1.9rem;
            line-height: 1.8;
            margin-bottom: 1.5rem;
          }

          .quote-author {
            color: var(--primary);
            font-weight: 600;
            font-size: 1.2rem;
          }

          .dashboard.high-contrast .quote-author {
            color: var(--highContrastText);
          }

          .chat-message {
            padding: 2rem;
            border-radius: 1.8rem;
            margin-bottom: 1.2rem;
            max-width: 80%;
            font-size: 1.2rem;
            line-height: 1.7;
            animation: bounceIn 0.6s ease;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          }

          @keyframes bounceIn {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }

          .chat-message.self {
            background: linear-gradient(135deg, rgba(126, 232, 250, 0.3) 0%, rgba(255, 111, 145, 0.3) 100%);
            margin-left: auto;
            border-bottom-right-radius: 0.5rem;
          }

          .chat-message.other {
            background: linear-gradient(135deg, rgba(255, 111, 145, 0.3) 0%, rgba(255, 209, 102, 0.3) 100%);
            margin-right: auto;
            border-bottom-left-radius: 0.5rem;
          }

          .chat-message.bot {
            background: linear-gradient(135deg, rgba(159, 122, 234, 0.3) 0%, rgba(255, 209, 102, 0.3) 100%);
            border-left: 6px solid var(--purple);
          }

          .dashboard.high-contrast .chat-message {
            background: #FFFFFF;
            color: #000000;
            border: 2px solid #000000;
          }

          .chat-input-container {
            display: flex;
            gap: 1.5rem;
            margin-top: 2rem;
          }

          .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            border-bottom: 2px solid rgba(255, 111, 145, 0.3);
            padding-bottom: 1rem;
            overflow-x: auto;
            white-space: nowrap;
          }

          .tab {
            padding: 1.2rem 2.5rem;
            border-radius: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            font-size: 1.2rem;
            background: transparent;
            color: var(--text);
            border: 2px solid transparent;
            min-width: 120px;
            text-align: center;
          }

          .dashboard.high-contrast .tab {
            color: var(--highContrastText);
            border: 2px solid #000000;
          }

          .tab.active {
            background: var(--gradient-secondary);
            color: white;
            box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
            transform: translateY(-4px);
          }

          .dashboard.high-contrast .tab.active {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          .tab:hover:not(.active), .tab:focus:not(.active) {
            background: rgba(255, 111, 145, 0.2);
            border-color: var(--primary);
          }

          .progress-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-top: 1.5rem;
          }

          .progress-item {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }

          .progress-label {
            min-width: 120px;
            font-weight: 600;
            font-size: 1.2rem;
            color: var(--primary);
          }

          .dashboard.high-contrast .progress-label {
            color: var(--highContrastText);
          }

          .progress-bar {
            flex: 1;
            height: 14px;
            background: rgba(255, 111, 145, 0.2);
            border-radius: 7px;
            overflow: hidden;
          }

          .dashboard.high-contrast .progress-bar {
            background: #CCCCCC;
          }

          .progress-fill {
            height: 100%;
            background: var(--gradient-primary);
            border-radius: 7px;
            transition: width 0.5s ease;
            position: relative;
          }

          .dashboard.high-contrast .progress-fill {
            background: var(--highContrastAccent);
          }

          .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            animation: progressShine 2s infinite;
          }

          @keyframes progressShine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .inspiration-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            margin-top: 2rem;
          }

          .inspiration-card {
            background: linear-gradient(135deg, rgba(255, 111, 145, 0.25) 0%, rgba(126, 232, 250, 0.25) 100%);
            padding: 2.5rem;
            border-radius: 1.8rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }

          .dashboard.high-contrast .inspiration-card {
            background: #FFFFFF;
            border: 2px solid #000000;
            color: #000000;
          }

          .inspiration-card:hover, .inspiration-card:focus {
            transform: translateY(-8px) rotate(3deg);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          }

          .card-icon {
            font-size: 3.5rem;
            margin-bottom: 1.2rem;
            transition: transform 0.3s ease;
          }

          .inspiration-card:hover .card-icon,
          .inspiration-card:focus .card-icon {
            transform: scale(1.2) rotate(360deg);
          }

          .card-title-sm {
            font-weight: 700;
            font-size: 1.4rem;
            margin-bottom: 1rem;
            color: var(--primary);
          }

          .dashboard.high-contrast .card-title-sm {
            color: var(--highContrastText);
          }

          .card-content {
            font-size: 1.1rem;
            line-height: 1.7;
            color: var(--text-light);
          }

          .dashboard.high-contrast .card-content {
            color: var(--highContrastText);
          }

          .time-display {
            text-align: center;
            padding: 2rem;
            background: var(--gradient-primary);
            color: white;
            border-radius: 1.5rem;
            font-weight: 600;
            font-size: 1.4rem;
            margin-bottom: 1.5rem;
            animation: fadeInTime 0.5s ease;
          }

          .dashboard.high-contrast .time-display {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          @keyframes fadeInTime {
            0% { opacity: 0.8; }
            100% { opacity: 1; }
          }

          .resources-card {
            background: linear-gradient(135deg, rgba(255, 209, 102, 0.25) 0%, rgba(159, 122, 234, 0.25) 100%);
            padding: 2.5rem;
            border-radius: 1.8rem;
          }

          .dashboard.high-contrast .resources-card {
            background: #FFFFFF;
            border: 2px solid #000000;
          }

          .resource-item {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            padding: 1.5rem;
            background: white;
            border-radius: 1.5rem;
            margin-bottom: 1rem;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          .dashboard.dark .resource-item {
            background: var(--darkCard);
          }

          .dashboard.high-contrast .resource-item {
            background: #FFFFFF;
            border: 2px solid #000000;
          }

          .resource-item:hover, .resource-item:focus {
            transform: translateX(8px);
          }

          .resource-link {
            color: var(--accent);
            text-decoration: none;
            font-weight: 600;
            font-size: 1.2rem;
          }

          .dashboard.high-contrast .resource-link {
            color: var(--highContrastText);
            text-decoration: underline;
          }

          .resource-link:hover, .resource-link:focus {
            color: var(--accent-dark);
          }

          .chatbot-button {
            position: fixed;
            bottom: 2.5rem;
            right: 2.5rem;
            background: var(--gradient-primary);
            border-radius: 50%;
            width: 4rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 25px rgba(255, 111, 145, 0.5);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
            border: none;
            color: white;
            font-size: 1.5rem;
          }

          .dashboard.high-contrast .chatbot-button {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          .chatbot-button:hover, .chatbot-button:focus {
            transform: scale(1.2) rotate(360deg);
            box-shadow: 0 12px 35px rgba(255, 111, 145, 0.6);
            outline: 4px solid var(--primary-dark);
          }

          .chatbot-modal {
            position: fixed;
            bottom: 5rem;
            right: 3.5rem;
            width: 350px;
            height: 400px;
            background: var(--card);
            border-radius: 2.2rem;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            animation: slideIn 0.4s ease;
            border: 1px solid rgba(255, 255, 255, 0.8);
          }

          .dashboard.dark .chatbot-modal,
          .dashboard.high-contrast .chatbot-modal {
            background: var(--darkCard);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .chatbot-header {
            padding: 2rem;
            background: var(--gradient-secondary);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1.5rem;
          }

          .dashboard.high-contrast .chatbot-header {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          .chatbot-body {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            background: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FF6F91' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
          }

          .dashboard.high-contrast .chatbot-body {
            background: #FFFFFF;
          }

          .chatbot-footer {
            padding: 2rem;
            border-top: 1px solid rgba(255, 111, 145, 0.2);
          }

          .toast {
            position: fixed;
            bottom: 3.5rem;
            left: 50%;
            transform: translateX(-50%);
            padding: 1.5rem 2.5rem;
            border-radius: 1.5rem;
            color: white;
            background: var(--gradient-primary);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: toastPop 0.5s ease;
            font-size: 1.2rem;
            font-weight: 600;
          }

          .dashboard.high-contrast .toast {
            background: var(--highContrastAccent);
            color: var(--highContrastText);
          }

          @keyframes toastPop {
            0% { transform: translateX(-50%) translateY(100%); opacity: 0; }
            100% { transform: translateX(-50%) translateY(0); opacity: 1; }
          }

          .toast.error {
            background: linear-gradient(135deg, var(--red) 0%, #C53030 100%);
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1.5rem;
            color: var(--text-light);
            font-size: 1.2rem;
            font-style: italic;
          }

          .dashboard.high-contrast .empty-state {
            color: var(--highContrastText);
          }

          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(25px); }
            to { opacity: 1; transform: translateY(0); }
          }

          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(255, 111, 145, 0.2);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: var(--primary-dark);
          }

          @media (prefers-reduced-motion: reduce) {
            .card, .button, .vibe-item, .user-item, .inspiration-card, .chatbot-button, .logo, .control-button, .time-display {
              animation: none;
              transition: none;
            }
          }

          @media (max-width: 1200px) {
            .main-container {
              grid-template-columns: 1fr;
            }
            .chatbot-modal {
              width: 90%;
              right: 5%;
            }
          }

          @media (max-width: 768px) {
            .dashboard {
              padding: 2rem;
            }
            .header {
              flex-direction: column;
              gap: 2rem;
              align-items: flex-start;
            }
            .inspiration-grid {
              grid-template-columns: 1fr;
            }
            .chatbot-button {
              bottom: 2.5rem;
              right: 2.5rem;
              width: 5rem;
              height: 5rem;
              font-size: 2rem;
            }
            .chatbot-modal {
              height: 500px;
            }
            .tabs {
              flex-wrap: nowrap;
              overflow-x: auto;
              padding-bottom: 0.8rem;
            }
            .tab {
              padding: 1rem 2rem;
              font-size: 1.1rem;
              min-width: 100px;
            }
            .card {
              padding: 2rem;
            }
            .vibe-list, .user-list, .chat-messages {
              max-height: 300px;
            }
            .card-title {
              font-size: 2rem;
            }
            .input, .button {
              font-size: 1.1rem;
              padding: 1.2rem 1.8rem;
            }
          }

          @media (max-width: 480px) {
            .dashboard {
              padding: 1.5rem;
            }
            .header {
              padding: 1.5rem;
            }
            .user-info {
              flex-direction: column;
              align-items: flex-start;
            }
            .user-avatar {
              width: 3.5rem;
              height: 3.5rem;
              font-size: 1.5rem;
            }
            .controls {
              gap: 1rem;
            }
            .control-button {
              width: 3.5rem;
              height: 3.5rem;
              font-size: 1.5rem;
            }
            .card {
              padding: 1.5rem;
            }
            .card-title {
              font-size: 1.8rem;
            }
            .chatbot-modal {
              width: 95%;
              right: 2.5%;
              height: 450px;
            }
            .chatbot-header, .chatbot-footer {
              padding: 1.5rem;
            }
            .chatbot-body {
              padding: 1.5rem;
            }
            .toast {
              padding: 1.2rem 2rem;
              font-size: 1.1rem;
            }
            .vibe-list, .user-list, .chat-messages {
              max-height: 250px;
            }
          }
        `}
      </style>
      <main className={`dashboard ${darkMode ? "dark" : ""} ${highContrast ? "high-contrast" : ""}`} role="main">
        {toast && (
          <div className={`toast ${toast.type}`} role="alert" aria-live="assertive">
            {toast.message}
          </div>
        )}

        <header className="header" role="banner">
          <h1 className="logo" aria-label="TalkToMe logo">
            TalkToMe
          </h1>
          <div className="user-info" role="region" aria-label="User information">
            <div className="user-avatar" aria-hidden="true">
              {usernameRef.current.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "1.3rem" }}>{usernameRef.current}</div>
              <div style={{ fontSize: "1.1rem", color: highContrast ? "var(--highContrastText)" : darkMode ? "var(--darkTextLight)" : "var(--text-light)" }}>
                Growing since today • Time: {formatTime(timeSpent)}
              </div>
            </div>
          </div>
          <div className="controls" role="toolbar">
            <button
              className="control-button"
              onClick={() => {
                setDarkMode((prev) => !prev);
                playClickSound();
                showToast(`Switched to ${darkMode ? "light" : "moonlight"} mode!`);
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              className="control-button"
              onClick={() => {
                setHighContrast((prev) => !prev);
                playClickSound();
                showToast(`Switched to ${highContrast ? "normal" : "high-contrast"} mode!`);
              }}
              aria-label="Toggle high contrast mode"
            >
              👁️
            </button>
          </div>
        </header>

        <div className="main-container">
          <aside className="sidebar" role="complementary">
            <section className="card" aria-labelledby="session-time">
              <h2 id="session-time" className="card-title">
                <span aria-hidden="true">⏱️</span> Session Time
              </h2>
              <div className="time-display" aria-live="polite">
                {formatTime(timeSpent)}
              </div>
              <p style={{ textAlign: "center", color: highContrast ? "var(--highContrastText)" : "var(--text-light)", fontSize: "1.1rem" }}>
                Your dedication is blooming! 🌱
              </p>
            </section>

            <section className="card" aria-labelledby="plant-bloom">
              <h2 id="plant-bloom" className="card-title">
                <span aria-hidden="true">🌼</span> Plant a Bloom
              </h2>
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
                  vibeInputRef.current?.focus();
                }}
              >
                <input
                  ref={vibeInputRef}
                  type="text"
                  value={newVibe}
                  onChange={(e) => setNewVibe(e.target.value)}
                  placeholder="Share an encouraging thought..."
                  className="input"
                  aria-label="Share a positive vibe"
                />
                <button
                  type="submit"
                  className="button"
                  style={{ marginTop: "1.5rem", width: "100%" }}
                  disabled={!newVibe.trim()}
                  aria-label="Plant this vibe"
                >
                  Plant This Bloom
                </button>
              </form>
              <div className="vibe-list" style={{ marginTop: "2rem" }} role="list">
                {vibes.length === 0 ? (
                  <div className="empty-state" role="alert">Be the first to plant a bloom!</div>
                ) : (
                  vibes.slice(0, 4).map((vibe) => (
                    <div key={vibe.id} className="vibe-item" role="listitem">
                      <strong>{vibe.user}:</strong> {vibe.content}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card" aria-labelledby="your-growth">
              <h2 id="your-growth" className="card-title">
                <span aria-hidden="true">📊</span> Your Growth
              </h2>
              <div className="progress-container">
                {["mood", "learning", "social"].map((key) => (
                  <div key={key} className="progress-item" role="group" aria-label={`${key} progress`}>
                    <span className="progress-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${userProgress[key] * 20}%` }}></div>
                    </div>
                    <button
                      onClick={() => updateProgress(key)}
                      style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.4rem" }}
                      aria-label={`Increase ${key} progress`}
                    >
                      ➕
                    </button>
                  </div>
                ))}
                <button
                  className="button-secondary"
                  style={{ width: "100%", marginTop: "1.5rem" }}
                  onClick={() => {
                    updateProgress("mood");
                    updateProgress("learning");
                    updateProgress("social");
                  }}
                  aria-label="Mark all growth areas as improved"
                >
                  I've Grown Today
                </button>
              </div>
            </section>

            <section className="card" aria-labelledby="daily-inspiration">
              <h2 id="daily-inspiration" className="card-title">
                <span aria-hidden="true">🌿</span> Daily Inspiration
              </h2>
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
                  aria-label="Get new inspirational quote"
                >
                  New Inspiration
                </button>
              </div>
            </section>

            <section className="card resources-card" aria-labelledby="exciting-resources">
              <h2 id="exciting-resources" className="card-title">
                <span aria-hidden="true">🔗</span> Exciting Resources
              </h2>
              <div style={{ maxHeight: "300px", overflowY: "auto" }} role="list">
                {resources.length === 0 ? (
                  <div className="empty-state" role="alert">Loading exciting discoveries...</div>
                ) : (
                  resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-item"
                      role="listitem"
                      aria-label={`Resource: ${resource.title}`}
                    >
                      <span style={{ fontSize: "1.8rem" }} aria-hidden="true">🚀</span>
                      <div>
                        <div className="resource-link">{resource.title}</div>
                        <div style={{ fontSize: "1rem", color: highContrast ? "var(--highContrastText)" : "var(--text-light)" }}>
                          {resource.description}
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
              <button
                className="button"
                style={{ width: "100%", marginTop: "1.5rem" }}
                onClick={fetchResources}
                aria-label="Refresh resources"
              >
                Refresh Discoveries
              </button>
            </section>
          </aside>

          <section className="content" role="region" aria-label="Main content">
            <div className="card" aria-labelledby="garden-chat">
              <h2 id="garden-chat" className="card-title">
                <span aria-hidden="true">💬</span> Garden Chat
              </h2>
              <nav className="tabs" role="tablist">
                {["vibes", "chat", "community", "inspiration"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`${tab}-panel`}
                    id={`${tab}-tab`}
                  >
                    {tab === "vibes" ? "Recent Blooms" : tab === "chat" ? "Conversation" : tab === "community" ? "Garden Friends" : "Wellness Tips"}
                  </button>
                ))}
              </nav>

              <div id="vibes-panel" role="tabpanel" aria-labelledby="vibes-tab" hidden={activeTab !== "vibes"}>
                <div className="vibe-list" role="list">
                  {vibes.length === 0 ? (
                    <div className="empty-state" role="alert">No blooms yet. Plant the first one!</div>
                  ) : (
                    vibes.map((vibe) => (
                      <div key={vibe.id} className="vibe-item" role="listitem">
                        <strong>{vibe.user}:</strong> {vibe.content}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div id="chat-panel" role="tabpanel" aria-labelledby="chat-tab" hidden={activeTab !== "chat"}>
                <div className="chat-messages" role="log" aria-live="polite">
                  {chatMessages.length === 0 ? (
                    <div className="empty-state" role="alert">Start a conversation with the garden!</div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`chat-message ${msg.id === socketRef.current.id ? "self" : "other"} ${msg.id === "bot" ? "bot" : ""}`}
                        role="listitem"
                      >
                        <strong>{msg.username}:</strong> {msg.message}
                      </div>
                    ))
                  )}
                </div>
                <div className="chat-input-container">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setIsTyping(!!e.target.value.trim());
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Share something with the garden..."
                    className="input"
                    aria-label="Chat message input"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="button"
                    disabled={!newMessage.trim()}
                    aria-label="Send chat message"
                  >
                    Send
                  </button>
                </div>
                {isTyping && (
                  <p style={{ marginTop: "1.2rem", fontSize: "1.1rem", color: highContrast ? "var(--highContrastText)" : "var(--primary)" }} aria-live="polite">
                    Someone is typing...
                  </p>
                )}
              </div>

              <div id="community-panel" role="tabpanel" aria-labelledby="community-tab" hidden={activeTab !== "community"}>
                <div className="user-list" role="list">
                  {onlineUsers.length === 0 ? (
                    <div className="empty-state" role="alert">You're the first in the garden!</div>
                  ) : (
                    onlineUsers.map((user, idx) => (
                      <div key={idx} className="user-item" role="listitem">
                        <span aria-label={`User ${user}`}>🌻 {user}</span>
                        <button
                          className="button"
                          style={{ padding: "0.8rem 1.2rem", fontSize: "1.1rem" }}
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
                          aria-label={`Send greeting to ${user}`}
                        >
                          Send Sunshine
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div id="inspiration-panel" role="tabpanel" aria-labelledby="inspiration-tab" hidden={activeTab !== "inspiration"}>
                <div className="inspiration-grid">
                  {inspirationCards.map((card, index) => (
                    <button
                      key={index}
                      className="inspiration-card"
                      onClick={() => {
                        playClickSound();
                        showToast(`Added "${card.title}" to your day!`);
                      }}
                      aria-label={`Apply ${card.title} inspiration`}
                    >
                      <div className="card-icon" aria-hidden="true">{card.icon}</div>
                      <div className="card-title-sm">{card.title}</div>
                      <div className="card-content">{card.content}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section className="card" aria-labelledby="todays-intentions">
              <h2 id="todays-intentions" className="card-title">
                <span aria-hidden="true">🌞</span> Today's Intentions
              </h2>
              <div style={{ lineHeight: "1.8" }}>
                <p style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>
                  Set a gentle intention for your day.
                </p>
                <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
                  {["Rest when needed", "Learn one new thing", "Reach out to someone", "Be kind to myself"].map((intention, idx) => (
                    <button
                      key={idx}
                      style={{
                        padding: "1.2rem 2rem",
                        background: highContrast ? "#FFFFFF" : "rgba(255, 111, 145, 0.2)",
                        borderRadius: "3rem",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        border: highContrast ? "2px solid #000000" : "1px solid transparent",
                        color: highContrast ? "var(--highContrastText)" : "var(--text)",
                        minHeight: "44px",
                      }}
                      onClick={() => {
                        playClickSound();
                        showToast(`"${intention}" set as today's intention`);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = highContrast ? "#CCCCCC" : "rgba(255, 111, 145, 0.3)";
                        e.target.style.transform = "translateY(-5px)";
                        e.target.style.borderColor = highContrast ? "#000000" : "var(--primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = highContrast ? "#FFFFFF" : "rgba(255, 111, 145, 0.2)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.borderColor = highContrast ? "#000000" : "transparent";
                      }}
                      aria-label={`Set intention: ${intention}`}
                    >
                      {intention}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </section>
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
          <div className="chatbot-modal" role="dialog" aria-labelledby="chatbot-title">
            <div className="chatbot-header">
              <h2 id="chatbot-title">Garden Guide</h2>
              <button
                onClick={() => {
                  setShowChatbot(false);
                  playClickSound();
                }}
                aria-label="Close chatbot"
                style={{ background: "none", border: "none", color: "white", fontSize: "1rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="chatbot-body">
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }} role="region" aria-label="Chatbot introduction">
                 
                  <p style={{ marginTop: "0.5rem", fontSize: "0.2rem" }}>
                    Here to help you grow and connect. What's on your mind?
                  </p>
                  <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    {[
                      { text: "I'm feeling a bit lonely today", toast: "Your guide is here for you" },
                      { text: "What's something I can learn right now?", toast: "Curiosity helps us grow" },
                      { text: "I need some encouragement", toast: "You're doing better than you think" },
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="chat-message bot"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setNewMessage(suggestion.text);
                          showToast(suggestion.toast);
                          chatInputRef.current?.focus();
                        }}
                        aria-label={`Select suggestion: ${suggestion.text}`}
                      >
                        <strong>Garden Guide:</strong> {suggestion.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-message ${msg.id === socketRef.current.id ? "self" : "other"} ${msg.id === "bot" ? "bot" : ""}`}
                    role="listitem"
                  >
                    <strong>{msg.username}:</strong> {msg.message}
                  </div>
                ))
              )}
            </div>
            <div className="chatbot-footer">
              <div className="chat-input-container">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    setIsTyping(!!e.target.value.trim());
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Chat with your Garden Guide..."
                  className="input"
                  aria-label="Chat with Garden Guide"
                />
                <button
                  onClick={sendChatMessage}
                  className="button"
                  disabled={!newMessage.trim()}
                  aria-label="Send message to Garden Guide"
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