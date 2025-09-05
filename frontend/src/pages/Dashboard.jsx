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
  const [notifications, setNotifications] = useState([]); // New: Notifications
  const [resources, setResources] = useState([]); // New: Helpful resources
  const [events, setEvents] = useState([]); // New: Upcoming events
  const [searchQuery, setSearchQuery] = useState(""); // New: Search bar

  // Fun arrays for different slots
  const funFacts = [
    "Did you know? Honey never spoils.",
    "Dolphins have names for each other!",
    "Bamboo can grow up to 3 feet in one day.",
    "There's no sound in space.",
    "Octopuses have three hearts."
  ];

  const challenges = [
    "Share a picture of something blue in chat.",
    "Post your favorite quote.",
    "Recommend a song to the community.",
    "Tell a one-line joke.",
    "Share a self-care tip."
  ];

  const quotes = [
    "The best way to find yourself is to lose yourself in the service of others. – Mahatma Gandhi",
    "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "We rise by lifting others. – Robert Ingersoll",
    "Be the change you wish to see in the world. – Mahatma Gandhi"
  ];

  const creativePrompts = [
    "Sketch a dream destination you'd love to visit.",
    "Write a 3-sentence story about a magical encounter.",
    "Imagine a new holiday and describe how you'd celebrate it.",
    "Design a superhero inspired by your favorite hobby.",
    "Create a poem about your favorite memory."
  ];

  const petMoods = ["happy 🐶", "playful 🐾", "cozy 😺", "curious 🐰", "adventurous 🦊"];

  const memberMilestones = [
    { achievement: "First Post", description: "Celebrate your very first post!" },
    { achievement: "Joined 3 Groups", description: "Connect with multiple support groups." },
    { achievement: "100 Messages Sent", description: "You love to stay connected!" },
    { achievement: "1 Month Anniversary", description: "Thank you for being part of our community!" },
    { achievement: "Helped 5 Members", description: "You're a community hero!" }
  ];

  // State handlers for fun dynamic content
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [challenge, setChallenge] = useState(challenges[0]);
  const petMoodTimeoutRef = useRef(null);

  const playClickSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAACAgICAgICAgICAgICAgICAgICAg"
    );
    audio.play();
  };

  // Interval to update fun facts, challenges, prompts, pet moods, daily inspiration & mood
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
      setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)]);
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
      setDailyInspiration(quotes[Math.floor(Math.random() * quotes.length)]);
      setMood(["😊", "😌", "😍", "🤗", "😎", "🥳", "🌟"][Math.floor(Math.random() * 7)]);
      setQuickTips((tips) => [...tips.slice(1), tips[0]]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (petMoodTimeoutRef.current) clearTimeout(petMoodTimeoutRef.current);
    petMoodTimeoutRef.current = setTimeout(() => {
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
    }, 10000);
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

        // Mock new data fetches (in real app, add APIs)
        setNotifications([
          { id: 1, message: "New message from friend!", type: "message" },
          { id: 2, message: "Your post got 5 likes!", type: "like" },
          { id: 3, message: "Group event tomorrow!", type: "event" }
        ]);

        setResources([
          { title: "Mindfulness Meditation Guide", link: "/resources/meditation" },
          { title: "Coping with Anxiety", link: "/resources/anxiety" },
          { title: "Hotline Support Numbers", link: "/resources/hotlines" },
          { title: "Healthy Eating Tips", link: "/resources/nutrition" }
        ]);

        setEvents([
          { title: "Weekly Support Meetup", date: "Tomorrow at 7 PM" },
          { title: "Art Therapy Workshop", date: "Saturday at 2 PM" },
          { title: "Mindfulness Session", date: "Sunday at 10 AM" }
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

    socket.on("connect", () => {
      console.log("Connected to socket");
    });

    socket.on("statsUpdate", (newStats) => {
      setStats(newStats);
    });

    socket.on("newChatMessage", (message) => {
      setChatMessages((prev) => [...prev, message].slice(-5));
    });

    socket.on("newGratitudeNote", (note) => {
      setGratitudeWall((prev) => [...prev, note].slice(-5));
    });

    socket.on("newNotification", (notification) => { // New: Socket for notifications
      setNotifications((prev) => [...prev, notification].slice(-5));
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from socket");
    });

    return () => socket.disconnect();
  }, []);

  // Handlers...
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
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      playClickSound();
    } catch (err) {
      alert(err.message || "Error deleting post");
    }
  };

  const handleGratitudeSubmit = (e) => {
    e.preventDefault();
    if (!gratitudeNote.trim()) return;
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("newGratitudeNote", { user: user.username, content: gratitudeNote });
    setGratitudeNote("");
    playClickSound();
  };

  const handlePetInteraction = () => {
    playClickSound();
    setPetMood("❤️ Loving ❤️");
    setTimeout(() => {
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
    }, 3000);
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
    // In real app, filter posts/groups etc. based on searchQuery
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    playClickSound();
  };

  // --- STYLES ---

  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(135deg, #f6d5f7 0%, #fbeed5 100%)", // Softer, more engaging gradient
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Poppins', sans-serif", // More modern font (assume imported or use system)
    color: "#333",
    overflowX: "hidden",
  };

  const headerSectionStyle = {
    width: "100%",
    maxWidth: "1200px",
    textAlign: "center",
    marginBottom: "40px",
  };

  const contentWrapper = {
    width: "100%",
    maxWidth: "1200px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  };

  const sectionStyle = {
    background: "rgba(255, 255, 255, 0.85)", // Semi-transparent for depth
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    transition: "all 0.4s ease",
    position: "relative",
    overflow: "hidden",
  };

  const heroStyle = {
    background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
    borderRadius: "30px",
    padding: "50px 30px",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)",
    marginBottom: "50px",
  };

  const sectionTitleStyle = {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#4a148c",
    position: "relative",
    display: "inline-block",
  };

  const inputStyle = {
    width: "100%",
    padding: "15px 20px",
    borderRadius: "50px",
    border: "none",
    background: "#f3e5f5",
    fontSize: "1rem",
    color: "#512da8",
    outline: "none",
    transition: "all 0.3s",
    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)",
  };

  const buttonBaseStyle = {
    background: "linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)",
    borderRadius: "50px",
    border: "none",
    color: "#fff",
    fontWeight: "600",
    fontSize: "1rem",
    padding: "12px 28px",
    cursor: "pointer",
    boxShadow: "0 5px 15px rgba(171,71,188,0.4)",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  const linkStyle = {
    color: "#7b1fa2",
    fontWeight: "600",
    textDecoration: "none",
    transition: "color 0.3s",
  };

  const flexRow = {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "space-between",
  };

  // Components

  const Button = ({ style, children, onClick, disabled, ariaLabel, type }) => {
    const [hover, setHover] = React.useState(false);
    const combinedStyle = {
      ...buttonBaseStyle,
      ...style,
      transform: hover && !disabled ? "scale(1.05)" : "scale(1)",
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
        animationName: "slideIn",
        animationDuration: "800ms",
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

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          ::-webkit-scrollbar {
            width: 10px;
          }
          ::-webkit-scrollbar-track {
            background: #f3e5f5;
            border-radius: 5px;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #7b1fa2;
            border-radius: 5px;
          }
          input:focus {
            box-shadow: 0 0 10px #ab47bc !important;
          }
          a:hover, a:focus {
            color: #4a148c !important;
          }
          section:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15) !important;
          }
          @media (max-width: 768px) {
            .flex-row {
              flex-direction: column;
            }
            h1 {
              font-size: 2.5rem !important;
            }
            section {
              padding: 20px !important;
            }
          }
          @media (max-width: 480px) {
            main {
              padding: 20px 10px !important;
            }
          }
        `}
      </style>
      <main style={containerStyle} role="main">
        <div style={headerSectionStyle}>
          <div style={heroStyle}>
            <h1 style={{ fontSize: "3.5rem", marginBottom: "10px", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              Welcome Back, {user?.username || user}! {mood}
            </h1>
            <p style={{ fontSize: "1.4rem", marginBottom: "30px" }}>Discover inspiration, connect with others, and nurture your well-being.</p>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search posts, groups, or resources..."
              style={{ ...inputStyle, maxWidth: "600px", margin: "0 auto 20px", display: "block" }}
            />
            <Button onClick={() => alert('Search functionality coming soon!')}>Search</Button>
          </div>
        </div>
        <div style={contentWrapper}>
          {/* Notifications */}
          <AnimatedSection label="Notifications" delay={0}>
            <h2 style={sectionTitleStyle}>🔔 Notifications</h2>
            {notifications.length === 0 ? (
              <p>No new notifications. You're all caught up!</p>
            ) : (
              <>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {notifications.map((notif) => (
                    <li key={notif.id} style={{ marginBottom: "15px", padding: "10px", background: "#f3e5f5", borderRadius: "10px" }}>
                      {notif.message}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleClearNotifications} style={{ marginTop: "10px" }}>Clear All</Button>
              </>
            )}
          </AnimatedSection>

          {/* Stats and Mood Tracker - Combined for flow */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Community Stats" style={{ flex: 1 }} delay={100}>
              <h2 style={sectionTitleStyle}>📊 Community Stats</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
                <div style={{ textAlign: "center", padding: "15px", background: "#e1bee7", borderRadius: "15px" }}>Posts: {stats.posts}</div>
                <div style={{ textAlign: "center", padding: "15px", background: "#e1bee7", borderRadius: "15px" }}>Groups: {stats.groups}</div>
                <div style={{ textAlign: "center", padding: "15px", background: "#e1bee7", borderRadius: "15px" }}>Members: {stats.members}</div>
                <div style={{ textAlign: "center", padding: "15px", background: "#e1bee7", borderRadius: "15px" }}>Active Today: {stats.activeToday}</div>
              </div>
            </AnimatedSection>
            <AnimatedSection label="Mood Tracker" style={{ flex: 1 }} delay={150}>
              <h2 style={sectionTitleStyle}>🌈 Mood Tracker</h2>
              <p style={{ fontSize: "2rem", textAlign: "center", marginBottom: "20px" }}>{petMood}</p>
              <Button onClick={() => setMood("🤩")} style={{ width: "100%" }}>Boost My Mood</Button>
            </AnimatedSection>
          </div>

          {/* Daily Inspiration and Fun Zone - Side by side */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Daily Inspiration" style={{ flex: 1 }} delay={200}>
              <h2 style={sectionTitleStyle}>✨ Daily Inspiration</h2>
              <blockquote style={{ fontSize: "1.2rem", fontStyle: "italic", color: "#6a1b9a", padding: "20px", background: "#f3e5f5", borderRadius: "15px" }}>
                “{dailyInspiration}”
              </blockquote>
            </AnimatedSection>
            <AnimatedSection label="Fun Zone" style={{ flex: 1 }} delay={250}>
              <h2 style={sectionTitleStyle}>🎊 Fun Zone</h2>
              <p><strong>Fun Fact:</strong> {funFact}</p>
              <p><strong>Daily Challenge:</strong> {challenge}</p>
              <p><strong>Quick Quote:</strong> {quotes[Math.floor(Math.random() * quotes.length)]}</p>
            </AnimatedSection>
          </div>

          {/* Live Chat */}
          <AnimatedSection label="Community Chat" delay={300}>
            <h2 style={sectionTitleStyle}>💬 Live Chat</h2>
            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                background: "#f3e5f5",
                borderRadius: "15px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              {chatMessages.length === 0 ? (
                <p>Start the conversation!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "15px" }}>
                    <strong>{msg.user}:</strong> {msg.content}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "15px" }}>
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                style={inputStyle}
              />
              <Button disabled={!newMessage.trim()} type="submit">Send</Button>
            </form>
            {isTyping && <p style={{ color: "#ab47bc", marginTop: "10px" }}>Typing...</p>}
            <Link to="/chat" style={{ ...linkStyle, display: "block", marginTop: "15px" }}>Go to Full Chat →</Link>
          </AnimatedSection>

          {/* Recent Posts and Support Groups - Side by side */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Recent Posts" style={{ flex: 2 }} delay={350}>
              <h2 style={sectionTitleStyle}>📝 Recent Posts</h2>
              {loadingPosts ? (
                <p>Loading...</p>
              ) : posts.length === 0 ? (
                <p>No posts yet. <Link to="/create" style={linkStyle}>Create one!</Link></p>
              ) : (
                posts.map((p) => (
                  <div key={p._id} style={{ marginBottom: "20px", padding: "15px", background: "#f3e5f5", borderRadius: "15px" }}>
                    <h3 style={{ fontSize: "1.3rem", marginBottom: "5px" }}>{p.title}</h3>
                    <p style={{ color: "#757575" }}>By {p.author?.username}</p>
                    <p>{p.content.slice(0, 100)}...</p>
                    <Button onClick={() => handleDeletePost(p._id)} style={{ background: "linear-gradient(135deg, #ef5350 0%, #f44336 100%)", marginTop: "10px" }}>Delete</Button>
                  </div>
                ))
              )}
              <Link to="/feed" style={{ ...linkStyle, display: "block", marginTop: "15px" }}>See All Posts →</Link>
            </AnimatedSection>
            <AnimatedSection label="Support Groups" style={{ flex: 1 }} delay={400}>
              <h2 style={sectionTitleStyle}>🤝 Groups</h2>
              {groups.length === 0 ? (
                <p>No groups. <Link to="/support-groups" style={linkStyle}>Explore</Link></p>
              ) : (
                groups.map((group) => (
                  <div key={group._id} style={{ marginBottom: "15px" }}>
                    <strong>{group.name}</strong>
                    <p>{group.description?.slice(0, 80)}...</p>
                  </div>
                ))
              )}
              <Link to="/support-groups" style={{ ...linkStyle, display: "block", marginTop: "15px" }}>Browse Groups →</Link>
            </AnimatedSection>
          </div>

          {/* New: Upcoming Events */}
          <AnimatedSection label="Upcoming Events" delay={450}>
            <h2 style={sectionTitleStyle}>🗓️ Upcoming Events</h2>
            {events.length === 0 ? (
              <p>No events scheduled. Check back soon!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {events.map((event, idx) => (
                  <li key={idx} style={{ marginBottom: "15px", padding: "10px", background: "#e1bee7", borderRadius: "10px" }}>
                    <strong>{event.title}</strong> - {event.date}
                  </li>
                ))}
              </ul>
            )}
          </AnimatedSection>

          {/* Member Milestones and Creative Prompts */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Milestones" style={{ flex: 1 }} delay={500}>
              <h2 style={sectionTitleStyle}>🏆 Milestones</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {memberMilestones.map((milestone, idx) => (
                  <li key={idx} style={{ marginBottom: "15px" }}>
                    <span style={{ color: "#ab47bc" }}>{milestone.achievement}:</span> {milestone.description}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection label="Creative Spark" style={{ flex: 1 }} delay={550}>
              <h2 style={sectionTitleStyle}>🎨 Creative Spark</h2>
              <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>{creativePrompt}</p>
              <Button onClick={() => setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)])}>New Prompt</Button>
              <Link to="/create-art" style={{ ...linkStyle, marginLeft: "20px" }}>Share Creation →</Link>
            </AnimatedSection>
          </div>

          {/* Gratitude Wall and Virtual Pet */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Gratitude Wall" style={{ flex: 1 }} delay={600}>
              <h2 style={sectionTitleStyle}>🙏 Gratitude Wall</h2>
              {gratitudeWall.map((note, idx) => (
                <div key={idx} style={{ marginBottom: "15px" }}>
                  <strong>{note.user}:</strong> {note.content}
                </div>
              ))}
              <form onSubmit={handleGratitudeSubmit} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <input
                  type="text"
                  value={gratitudeNote}
                  onChange={(e) => setGratitudeNote(e.target.value)}
                  placeholder="Share your gratitude..."
                  style={inputStyle}
                />
                <Button type="submit">Share</Button>
              </form>
            </AnimatedSection>
            <AnimatedSection label="Virtual Pet" style={{ flex: 1 }} delay={650}>
              <h2 style={sectionTitleStyle}>🐶 Virtual Pet</h2>
              <p style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "20px" }}>{petMood}</p>
              <Button onClick={handlePetInteraction} style={{ width: "100%" }}>Play with Pet</Button>
              <p style={{ textAlign: "center", marginTop: "10px", color: "#757575" }}>Mood changes every 10s!</p>
            </AnimatedSection>
          </div>

          {/* Community Playlist */}
          <AnimatedSection label="Community Playlist" delay={700}>
            <h2 style={sectionTitleStyle}>🎶 Playlist</h2>
            {playlistSongs.map((song, idx) => (
              <div key={idx} style={{ marginBottom: "15px" }}>
                <strong>{song.song}</strong> added by {song.user}
              </div>
            ))}
            <form onSubmit={handleAddSong} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
              <input
                type="text"
                name="song"
                placeholder="Add a song..."
                style={inputStyle}
              />
              <Button type="submit">Add</Button>
            </form>
            <Link to="/playlist" style={{ ...linkStyle, display: "block", marginTop: "15px" }}>Full Playlist →</Link>
          </AnimatedSection>

          {/* Quick Tips and New Resources */}
          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Quick Tips" style={{ flex: 1 }} delay={750}>
              <h2 style={sectionTitleStyle}>💡 Quick Tips</h2>
              <ul style={{ listStyle: "disc", paddingLeft: "20px" }}>
                {quickTips.slice(0, 4).map((tip, i) => (
                  <li key={i} style={{ marginBottom: "10px" }}>{tip}</li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection label="Helpful Resources" style={{ flex: 1 }} delay={800}>
              <h2 style={sectionTitleStyle}>📚 Resources</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {resources.map((res, idx) => (
                  <li key={idx} style={{ marginBottom: "15px" }}>
                    <Link to={res.link} style={linkStyle}>{res.title}</Link>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;