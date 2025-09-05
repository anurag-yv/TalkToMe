import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ posts: 0, groups: 0, members: 0, activeToday: 0 });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [gratitudeNote, setGratitudeNote] = useState("");
  const [gratitudeWall, setGratitudeWall] = useState([]);
  const [creativePrompt, setCreativePrompt] = useState("");
  const [petMood, setPetMood] = useState("happy 🐶");
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState("😊");
  const [dailyInspiration, setDailyInspiration] = useState("Believe you can and you're halfway there.");
  const [quickTips, setQuickTips] = useState([
    "Take short mindful breaks every hour.",
    "Drink water regularly.",
    "Connect with someone new this week.",
    "Write down one thing you're grateful for today."
  ]);
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailyGoals, setDailyGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [wellnessScore, setWellnessScore] = useState(50);
  const [breathingExercise, setBreathingExercise] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [socialMediaPosts, setSocialMediaPosts] = useState([]); // New: Social media integration
  const [newSocialPost, setNewSocialPost] = useState("");
  const petMoodTimeoutRef = useRef(null);
  const breathingTimerRef = useRef(null);

  // Fun arrays
  const funFacts = [
    "Did you know? Honey never spoils.",
    "Dolphins have names for each other!",
    "Bamboo can grow up to 3 feet in one day.",
    "There's no sound in space.",
    "Octopuses have three hearts.",
    "Smiling can boost your mood instantly."
  ];

  const challenges = [
    "Share a picture of something blue in chat.",
    "Post your favorite quote.",
    "Recommend a song to the community.",
    "Tell a one-line joke.",
    "Share a self-care tip.",
    "Do a 1-minute meditation."
  ];

  const quotes = [
    "The best way to find yourself is to lose yourself in the service of others. – Mahatma Gandhi",
    "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "We rise by lifting others. – Robert Ingersoll",
    "Be the change you wish to see in the world. – Mahatma Gandhi",
    "Your mind is powerful. Fill it with positive thoughts."
  ];

  const creativePrompts = [
    "Sketch a dream destination you'd love to visit.",
    "Write a 3-sentence story about a magical encounter.",
    "Imagine a new holiday and describe how you'd celebrate it.",
    "Design a superhero inspired by your favorite hobby.",
    "Create a poem about your favorite memory.",
    "Journal about what made you smile today."
  ];

  const petMoods = ["happy 🐶", "playful 🐾", "cozy 😺", "curious 🐰", "adventurous 🦊", "relaxed 🐢"];

  const memberMilestones = [
    { achievement: "First Post", description: "Celebrate your very first post!" },
    { achievement: "Joined 3 Groups", description: "Connect with multiple support groups." },
    { achievement: "100 Messages Sent", description: "You love to stay connected!" },
    { achievement: "1 Month Anniversary", description: "Thank you for being part of our community!" },
    { achievement: "Helped 5 Members", description: "You're a community hero!" },
    { achievement: "Completed 7 Daily Goals", description: "Building habits for life!" }
  ];

  // State handlers
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [challenge, setChallenge] = useState(challenges[0]);

  const playClickSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAACAgICAgICAgICAgICAgICAgICAg"
    );
    audio.play();
  };

  // Dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
      setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)]);
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
      setDailyInspiration(quotes[Math.floor(Math.random() * quotes.length)]);
      setMood(["😊", "😌", "😍", "🤗", "😎", "🥳", "🌟", "💪"][Math.floor(Math.random() * 8)]);
      setQuickTips((tips) => [...tips.slice(1), tips[0]]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (petMoodTimeoutRef.current) clearTimeout(petMoodTimeoutRef.current);
    petMoodTimeoutRef.current = setTimeout(() => {
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
    }, 8000);
    return () => clearTimeout(petMoodTimeoutRef.current);
  }, [petMood]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, groupsRes, statsRes, gratitudeRes, playlistRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/groups"),
          fetch("/api/stats"),
          fetch("/api/gratitude"),
          fetch("/api/playlist"),
        ]);
        const postsData = await postsRes.json();
        setPosts(postsData.slice(0, 3));
        setLoadingPosts(false);

        const groupsData = await groupsRes.json();
        setGroups(groupsData.slice(0, 4));

        const statsData = await statsRes.json();
        setStats(statsData);

        const gratitudeData = await gratitudeRes.json();
        setGratitudeWall(gratitudeData.slice(0, 3));

        const playlistData = await playlistRes.json();
        setPlaylistSongs(playlistData.slice(0, 3));

        setNotifications([
          { id: 1, message: "New message from friend!", type: "message" },
          { id: 2, message: "Your post got 5 likes!", type: "like" },
          { id: 3, message: "Group event tomorrow!", type: "event" }
        ]);

        setEvents([
          { title: "Weekly Support Meetup", date: "Tomorrow at 7 PM" },
          { title: "Art Therapy Workshop", date: "Saturday at 2 PM" },
          { title: "Mindfulness Session", date: "Sunday at 10 AM" },
          { title: "Yoga for Beginners", date: "Monday at 6 PM" }
        ]);

        setHabits([
          { name: "Drink 8 glasses of water", completed: false },
          { name: "Meditate for 10 minutes", completed: true },
          { name: "Walk 5000 steps", completed: false }
        ]);

        setDailyGoals([
          { goal: "Practice gratitude", completed: false },
          { goal: "Connect with a friend", completed: true }
        ]);

        // Mock social media posts
        setSocialMediaPosts([
          { id: 1, platform: "X", content: "Feeling grateful today! #Mindfulness" },
          { id: 2, platform: "Instagram", content: "Sunset vibes and self-care. 🌅 #Wellness" }
        ]);
      } catch {
        setLoadingPosts(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => console.log("Connected to socket"));
    socket.on("statsUpdate", (newStats) => setStats(newStats));
    socket.on("newChatMessage", (message) => {
      setChatMessages((prev) => [...prev, message].slice(-5));
    });
    socket.on("newGratitudeNote", (note) => {
      setGratitudeWall((prev) => [...prev, note].slice(-5));
    });
    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [...prev, notification].slice(-5));
    });
    socket.on("newSocialPost", (post) => {
      setSocialMediaPosts((prev) => [...prev, post].slice(-5));
    });
    socket.on("disconnect", () => console.warn("Disconnected from socket"));

    return () => socket.disconnect();
  }, []);

  // Handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsTyping(false);
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("sendChatMessage", { user: user.username, content: newMessage });
    setNewMessage("");
    playClickSound();
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) setIsTyping(true);
    if (handleInputChange.timeout) clearTimeout(handleInputChange.timeout);
    handleInputChange.timeout = setTimeout(() => setIsTyping(false), 1500);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      playClickSound();
    } catch (err) {
      alert(err.message || "Error");
    }
  };

  const handleGratitudeSubmit = (e) => {
    e.preventDefault();
    if (!gratitudeNote.trim()) return;
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("newGratitudeNote", { user: user.username, content: gratitudeNote });
    setGratitudeNote("");
    playClickSound();
    setWellnessScore((prev) => Math.min(100, prev + 5));
  };

  const handlePetInteraction = () => {
    playClickSound();
    setPetMood("❤️ Loving ❤️");
    setTimeout(() => setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]), 3000);
    setWellnessScore((prev) => Math.min(100, prev + 2));
  };

  const handleAddSong = (e) => {
    e.preventDefault();
    const songInput = e.target.elements.song.value;
    if (!songInput.trim()) return;
    fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: songInput, user: user.username }),
    }).then(() => {
      setPlaylistSongs((prev) => [...prev, { song: songInput, user: user.username }].slice(-3));
      e.target.reset();
      playClickSound();
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    playClickSound();
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setDailyGoals((prev) => [...prev, { goal: newGoal, completed: false }]);
    setNewGoal("");
    playClickSound();
    setWellnessScore((prev) => Math.min(100, prev + 3));
  };

  const handleToggleGoal = (index) => {
    setDailyGoals((prev) => {
      const newGoals = [...prev];
      newGoals[index].completed = !newGoals[index].completed;
      return newGoals;
    });
    playClickSound();
    setWellnessScore((prev) => Math.min(100, prev + 5));
  };

  const handleStartBreathing = () => {
    setBreathingExercise(true);
    let count = 0;
    breathingTimerRef.current = setInterval(() => {
      count++;
      if (count >= 10) {
        clearInterval(breathingTimerRef.current);
        setBreathingExercise(false);
        setWellnessScore((prev) => Math.min(100, prev + 10));
        alert("Great job! You completed the breathing exercise.");
      }
    }, 5000);
  };

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    if (!journalEntry.trim()) return;
    alert("Journal entry saved! Reflecting helps in the long run.");
    setJournalEntry("");
    playClickSound();
    setWellnessScore((prev) => Math.min(100, prev + 7));
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits((prev) => [...prev, { name: newHabit, completed: false }]);
    setNewHabit("");
    playClickSound();
  };

  const handleToggleHabit = (index) => {
    setHabits((prev) => {
      const newHabits = [...prev];
      newHabits[index].completed = !newHabits[index].completed;
      return newHabits;
    });
    playClickSound();
    setWellnessScore((prev) => Math.min(100, prev + 4));
  };

  const handleSocialPost = (e) => {
    e.preventDefault();
    if (!newSocialPost.trim()) return;
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("newSocialPost", { user: user.username, platform: "X", content: newSocialPost });
    setNewSocialPost("");
    playClickSound();
    setWellnessScore((prev) => Math.min(100, prev + 3));
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #e6f3fa 0%, #f3e5f5 100%)", // Soothing blue to lavender gradient
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "50px 25px",
    fontFamily: "'Poppins', sans-serif",
    color: "#37474f",
    overflowX: "hidden",
  };

  const headerSectionStyle = {
    width: "100%",
    maxWidth: "1300px",
    textAlign: "center",
    marginBottom: "50px",
  };

  const contentWrapper = {
    width: "100%",
    maxWidth: "1300px",
    display: "flex",
    flexDirection: "column",
    gap: "50px",
  };

  const sectionStyle = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "25px",
    padding: "35px",
    boxShadow: "0 12px 35px rgba(55, 71, 79, 0.1)",
    transition: "all 0.4s ease",
    position: "relative",
    overflow: "hidden",
  };

  const heroStyle = {
    background: "linear-gradient(120deg, #4fc3f7 0%, #b39ddb 100%)", // Blue to purple, calming and authentic
    borderRadius: "35px",
    padding: "60px 35px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 20px 50px rgba(55, 71, 79, 0.2)",
    marginBottom: "60px",
  };

  const sectionTitleStyle = {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#263238",
    position: "relative",
    display: "inline-block",
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 22px",
    borderRadius: "50px",
    border: "none",
    background: "#eceff1",
    fontSize: "1.1rem",
    color: "#37474f",
    outline: "none",
    transition: "all 0.3s",
    boxShadow: "inset 0 3px 6px rgba(0,0,0,0.05)",
  };

  const buttonBaseStyle = {
    background: "linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)",
    borderRadius: "50px",
    border: "none",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1.1rem",
    padding: "14px 32px",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(79, 195, 247, 0.4)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
  };

  const linkStyle = {
    color: "#0288d1",
    fontWeight: "600",
    textDecoration: "none",
    transition: "color 0.3s",
  };

  const flexRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: "25px",
    justifyContent: "space-between",
  };

  const progressBarStyle = {
    height: "20px",
    background: "#eceff1",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
  };

  const progressFillStyle = {
    width: `${wellnessScore}%`,
    height: "100%",
    background: "linear-gradient(to right, #4fc3f7, #0288d1)",
    transition: "width 0.5s ease",
  };

  // Components
  const Button = ({ style, children, onClick, disabled, ariaLabel, type }) => {
    const [hover, setHover] = React.useState(false);
    const combinedStyle = {
      ...buttonBaseStyle,
      ...style,
      transform: hover && !disabled ? "scale(1.06)" : "scale(1)",
      opacity: disabled ? 0.7 : 1,
    };
    return (
      <button
        aria-label={ariaLabel}
        type={type || "button"}
        style={combinedStyle}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        onMouseEnter={() => !disabled && setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </button>
    );
  };

  const AnimatedSection = ({ children, style, delay = 0, label }) => (
    <section
      aria-label={label}
      style={{
        ...sectionStyle,
        ...style,
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationName: "fadeSlideIn",
        animationDuration: "900ms",
        animationTimingFunction: "ease-in-out",
      }}
      tabIndex="0"
    >
      {children}
    </section>
  );

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          ::-webkit-scrollbar {
            width: 12px;
          }
          ::-webkit-scrollbar-track {
            background: #eceff1;
            border-radius: 6px;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #0288d1;
            border-radius: 6px;
          }
          input:focus, textarea:focus {
            box-shadow: 0 0 12px #4fc3f7 !important;
          }
          a:hover, a:focus {
            color: #01579b !important;
          }
          section:hover {
            transform: translateY(-8px);
            box-shadow: 0 18px 50px rgba(55,71,79,0.15) !important;
          }
          @media (max-width: 768px) {
            .flex-row {
              flex-direction: column;
            }
            h1 {
              font-size: 2.8rem !important;
            }
            section {
              padding: 25px !important;
            }
          }
          @media (max-width: 480px) {
            main {
              padding: 25px 12px !important;
            }
          }
        `}
      </style>
      <main style={containerStyle} role="main">
        <div style={headerSectionStyle}>
          <div style={heroStyle}>
            <h1 style={{ fontSize: "4rem", marginBottom: "15px", textShadow: "0 3px 6px rgba(0,0,0,0.2)" }}>
              Hello, {user?.username || user}! Let's Thrive Today {mood}
            </h1>
            <p style={{ fontSize: "1.5rem", marginBottom: "35px" }}>A sanctuary for growth, connection, and lasting well-being.</p>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for inspiration, groups, or tools..."
              style={{ ...inputStyle, maxWidth: "700px", margin: "0 auto 25px", display: "block" }}
            />
            <Button onClick={() => alert('Searching... (Implement filter logic)')}>Find Your Path</Button>
          </div>
        </div>
        <div style={contentWrapper}>
          {/* Wellness Score */}
          <AnimatedSection label="Wellness Journey" delay={0}>
            <h2 style={sectionTitleStyle}>🌟 Your Wellness Score</h2>
            <p>Track your progress with daily actions for lasting growth.</p>
            <div style={progressBarStyle}>
              <div style={progressFillStyle}></div>
            </div>
            <p style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: "bold" }}>{wellnessScore}/100</p>
            <p>Small steps today lead to big changes tomorrow.</p>
          </AnimatedSection>

          {/* Notifications */}
          <AnimatedSection label="Notifications" delay={50}>
            <h2 style={sectionTitleStyle}>🔔 Updates</h2>
            {notifications.length === 0 ? (
              <p>You're all caught up! Focus on your journey.</p>
            ) : (
              <>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {notifications.map((notif) => (
                    <li key={notif.id} style={{ marginBottom: "18px", padding: "12px", background: "#eceff1", borderRadius: "12px" }}>
                      {notif.message}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleClearNotifications} style={{ marginTop: "15px" }}>Clear</Button>
              </>
            )}
          </AnimatedSection>

          {/* Social Media Tools */}
          <AnimatedSection label="Social Media Sharing" delay={100}>
            <h2 style={sectionTitleStyle}>📱 Share Positivity</h2>
            <p>Spread inspiration on X or Instagram with a positive post!</p>
            <form onSubmit={handleSocialPost} style={{ display: "flex", gap: "18px", marginBottom: "25px" }}>
              <input
                type="text"
                value={newSocialPost}
                onChange={(e) => setNewSocialPost(e.target.value)}
                placeholder="Share a positive message... (e.g., #Mindfulness)"
                style={inputStyle}
              />
              <Button type="submit">Post to X</Button>
            </form>
            {socialMediaPosts.length === 0 ? (
              <p>Be the first to share positivity!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {socialMediaPosts.map((post) => (
                  <li key={post.id} style={{ marginBottom: "18px", padding: "12px", background: "#e3f2fd", borderRadius: "12px" }}>
                    <strong>{post.platform}:</strong> {post.content} by {post.user}
                  </li>
                ))}
              </ul>
            )}
          </AnimatedSection>

          {/* Daily Goals and Habits */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Daily Goals" style={{ flex: 1 }} delay={150}>
              <h2 style={sectionTitleStyle}>🎯 Daily Goals</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {dailyGoals.map((goal, idx) => (
                  <li key={idx} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="checkbox" checked={goal.completed} onChange={() => handleToggleGoal(idx)} />
                    {goal.goal}
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddGoal} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a goal for today..."
                  style={inputStyle}
                />
                <Button type="submit">Add</Button>
              </form>
              <p style={{ marginTop: "15px", color: "#37474f" }}>Build habits one day at a time.</p>
            </AnimatedSection>
            <AnimatedSection label="Habit Tracker" style={{ flex: 1 }} delay={200}>
              <h2 style={sectionTitleStyle}>🔄 Habit Tracker</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {habits.map((habit, idx) => (
                  <li key={idx} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="checkbox" checked={habit.completed} onChange={() => handleToggleHabit(idx)} />
                    {habit.name}
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddHabit} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Add a new habit..."
                  style={inputStyle}
                />
                <Button type="submit">Add</Button>
              </form>
              <p style={{ marginTop: "15px", color: "#37474f" }}>Consistency is key to growth.</p>
            </AnimatedSection>
          </div>

          {/* Breathing Exercise and Journaling */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Breathing Exercise" style={{ flex: 1 }} delay={250}>
              <h2 style={sectionTitleStyle}>🌬️ Breathing Exercise</h2>
              <p>Take a moment to reduce stress with deep breathing.</p>
              {breathingExercise ? (
                <p style={{ fontSize: "1.5rem", textAlign: "center", animation: "breathe 5s infinite" }}>Inhale... Hold... Exhale...</p>
              ) : (
                <Button onClick={handleStartBreathing} style={{ width: "100%" }}>Start 1-Min Exercise</Button>
              )}
              <style>{`
                @keyframes breathe {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.1); }
                  100% { transform: scale(1); }
                }
              `}</style>
            </AnimatedSection>
            <AnimatedSection label="Daily Journal" style={{ flex: 1 }} delay={300}>
              <h2 style={sectionTitleStyle}>📖 Daily Reflection</h2>
              <form onSubmit={handleJournalSubmit}>
                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Reflect on your day... What went well?"
                  style={{ ...inputStyle, height: "120px", resize: "none" }}
                />
                <Button type="submit" style={{ marginTop: "15px", width: "100%" }}>Save Entry</Button>
              </form>
              <p style={{ marginTop: "15px", color: "#37474f" }}>Reflecting builds self-awareness.</p>
            </AnimatedSection>
          </div>

          {/* Stats and Mood Booster */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Community Stats" style={{ flex: 1 }} delay={350}>
              <h2 style={sectionTitleStyle}>📊 Stats</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "18px" }}>
                <div style={{ textAlign: "center", padding: "18px", background: "#e3f2fd", borderRadius: "18px" }}>Posts: {stats.posts}</div>
                <div style={{ textAlign: "center", padding: "18px", background: "#e3f2fd", borderRadius: "18px" }}>Groups: {stats.groups}</div>
                <div style={{ textAlign: "center", padding: "18px", background: "#e3f2fd", borderRadius: "18px" }}>Members: {stats.members}</div>
                <div style={{ textAlign: "center", padding: "18px", background: "#e3f2fd", borderRadius: "18px" }}>Active: {stats.activeToday}</div>
              </div>
            </AnimatedSection>
            <AnimatedSection label="Mood Booster" style={{ flex: 1 }} delay={400}>
              <h2 style={sectionTitleStyle}>😊 Mood Booster</h2>
              <p style={{ fontSize: "2.2rem", textAlign: "center", marginBottom: "25px" }}>{petMood}</p>
              <Button onClick={() => setMood("🤩")} style={{ width: "100%" }}>Instant Boost</Button>
            </AnimatedSection>
          </div>

          {/* Inspiration and Fun Zone */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Inspiration" style={{ flex: 1 }} delay={450}>
              <h2 style={sectionTitleStyle}>✨ Inspiration</h2>
              <blockquote style={{ fontSize: "1.3rem", fontStyle: "italic", color: "#263238", padding: "25px", background: "#e3f2fd", borderRadius: "18px" }}>
                “{dailyInspiration}”
              </blockquote>
            </AnimatedSection>
            <AnimatedSection label="Fun Zone" style={{ flex: 1 }} delay={500}>
              <h2 style={sectionTitleStyle}>🎉 Fun Zone</h2>
              <p><strong>Fact:</strong> {funFact}</p>
              <p><strong>Challenge:</strong> {challenge}</p>
              <p><strong>Quote:</strong> {quotes[Math.floor(Math.random() * quotes.length)]}</p>
            </AnimatedSection>
          </div>

          {/* Chat */}
          <AnimatedSection label="Chat" delay={550}>
            <h2 style={sectionTitleStyle}>💬 Community Chat</h2>
            <div style={{ maxHeight: "280px", overflowY: "auto", background: "#e3f2fd", borderRadius: "18px", padding: "25px", marginBottom: "25px" }}>
              {chatMessages.length === 0 ? <p>Chat to connect and support!</p> : chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: "18px" }}>
                  <strong>{msg.user}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "18px" }}>
              <input type="text" value={newMessage} onChange={handleInputChange} placeholder="Share your thoughts..." style={inputStyle} />
              <Button disabled={!newMessage.trim()} type="submit">Send</Button>
            </form>
            {isTyping && <p style={{ color: "#4fc3f7", marginTop: "12px" }}>Typing...</p>}
            <Link to="/chat" style={{ ...linkStyle, display: "block", marginTop: "18px" }}>Full Chat →</Link>
          </AnimatedSection>

          {/* Posts and Groups */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Posts" style={{ flex: 2 }} delay={600}>
              <h2 style={sectionTitleStyle}>📰 Recent Posts</h2>
              {loadingPosts ? <p>Loading...</p> : posts.length === 0 ? (
                <p>Create a post to inspire! <Link to="/create" style={linkStyle}>Start Now</Link></p>
              ) : posts.map((p) => (
                <div key={p._id} style={{ marginBottom: "25px", padding: "18px", background: "#e3f2fd", borderRadius: "18px" }}>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>{p.title}</h3>
                  <p style={{ color: "#78909c" }}>By {p.author?.username}</p>
                  <p>{p.content.slice(0, 120)}...</p>
                  <Button onClick={() => handleDeletePost(p._id)} style={{ background: "linear-gradient(135deg, #ef5350 0%, #f44336 100%)", marginTop: "12px" }}>Delete</Button>
                </div>
              ))}
              <Link to="/feed" style={{ ...linkStyle, display: "block", marginTop: "18px" }}>All Posts →</Link>
            </AnimatedSection>
            <AnimatedSection label="Groups" style={{ flex: 1 }} delay={650}>
              <h2 style={sectionTitleStyle}>🤝 Support Groups</h2>
              {groups.length === 0 ? <p>Explore groups for connection. <Link to="/support-groups" style={linkStyle}>Browse</Link></p> : groups.map((group) => (
                <div key={group._id} style={{ marginBottom: "18px" }}>
                  <strong>{group.name}</strong>
                  <p>{group.description?.slice(0, 100)}...</p>
                </div>
              ))}
              <Link to="/support-groups" style={{ ...linkStyle, display: "block", marginTop: "18px" }}>More Groups →</Link>
            </AnimatedSection>
          </div>

          {/* Events */}
          <AnimatedSection label="Events" delay={700}>
            <h2 style={sectionTitleStyle}>🗓️ Upcoming Events</h2>
            {events.length === 0 ? <p>No events yet – suggest one!</p> : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {events.map((event, idx) => (
                  <li key={idx} style={{ marginBottom: "18px", padding: "12px", background: "#e3f2fd", borderRadius: "12px" }}>
                    <strong>{event.title}</strong> - {event.date}
                  </li>
                ))}
              </ul>
            )}
          </AnimatedSection>

          {/* Milestones and Creative */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Milestones" style={{ flex: 1 }} delay={750}>
              <h2 style={sectionTitleStyle}>🏆 Your Milestones</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {memberMilestones.map((milestone, idx) => (
                  <li key={idx} style={{ marginBottom: "18px" }}>
                    <span style={{ color: "#4fc3f7" }}>{milestone.achievement}:</span> {milestone.description}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection label="Creative" style={{ flex: 1 }} delay={800}>
              <h2 style={sectionTitleStyle}>🎨 Creative Prompt</h2>
              <p style={{ fontSize: "1.3rem", marginBottom: "25px" }}>{creativePrompt}</p>
              <Button onClick={() => setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)])}>Refresh</Button>
              <Link to="/create-art" style={{ ...linkStyle, marginLeft: "25px" }}>Share →</Link>
            </AnimatedSection>
          </div>

          {/* Gratitude and Pet */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Gratitude" style={{ flex: 1 }} delay={850}>
              <h2 style={sectionTitleStyle}>🙏 Gratitude Wall</h2>
              {gratitudeWall.map((note, idx) => (
                <div key={idx} style={{ marginBottom: "18px" }}>
                  <strong>{note.user}:</strong> {note.content}
                </div>
              ))}
              <form onSubmit={handleGratitudeSubmit} style={{ display: "flex", gap: "18px", marginTop: "25px" }}>
                <input type="text" value={gratitudeNote} onChange={(e) => setGratitudeNote(e.target.value)} placeholder="What are you grateful for?" style={inputStyle} />
                <Button type="submit">Share</Button>
              </form>
            </AnimatedSection>
            <AnimatedSection label="Pet" style={{ flex: 1 }} delay={900}>
              <h2 style={sectionTitleStyle}>🐾 Virtual Pet</h2>
              <p style={{ fontSize: "2.8rem", textAlign: "center", marginBottom: "25px" }}>{petMood}</p>
              <Button onClick={handlePetInteraction} style={{ width: "100%" }}>Interact</Button>
              <p style={{ textAlign: "center", marginTop: "12px", color: "#78909c" }}>A fun way to lift your spirits!</p>
            </AnimatedSection>
          </div>

          {/* Playlist */}
          <AnimatedSection label="Playlist" delay={950}>
            <h2 style={sectionTitleStyle}>🎵 Community Playlist</h2>
            {playlistSongs.map((song, idx) => (
              <div key={idx} style={{ marginBottom: "18px" }}>
                <strong>{song.song}</strong> by {song.user}
              </div>
            ))}
            <form onSubmit={handleAddSong} style={{ display: "flex", gap: "18px", marginTop: "25px" }}>
              <input type="text" name="song" placeholder="Suggest a soothing song..." style={inputStyle} />
              <Button type="submit">Add</Button>
            </form>
            <Link to="/playlist" style={{ ...linkStyle, display: "block", marginTop: "18px" }}>Full Playlist →</Link>
          </AnimatedSection>

          {/* Tips */}
          <AnimatedSection label="Tips" delay={1000}>
            <h2 style={sectionTitleStyle}>💡 Daily Tips</h2>
            <ul style={{ listStyle: "disc", paddingLeft: "25px" }}>
              {quickTips.slice(0, 5).map((tip, i) => (
                <li key={i} style={{ marginBottom: "12px" }}>{tip}</li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

