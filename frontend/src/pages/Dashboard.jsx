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

  const funFacts = [
    "Did you know? Honey never spoils.",
    "Dolphins have names for each other!",
    "Bamboo can grow up to 3 feet in one day.",
    "There's no sound in space.",
  ];
  const challenges = [
    "Share a picture of something blue in chat.",
    "Post your favorite quote.",
    "Recommend a song to the community.",
    "Tell a one-line joke.",
  ];
  const quotes = [
    "The best way to find yourself is to lose yourself in the service of others. – Mahatma Gandhi",
    "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "We rise by lifting others. – Robert Ingersoll",
  ];
  const creativePrompts = [
    "Sketch a dream destination you'd love to visit.",
    "Write a 3-sentence story about a magical encounter.",
    "Imagine a new holiday and describe how you'd celebrate it.",
    "Design a superhero inspired by your favorite hobby.",
  ];
  const petMoods = ["happy 🐶", "playful 🐾", "cozy 😺", "curious 🐰"];

  const memberMilestones = [
    { achievement: "First Post", description: "Celebrate your very first post!" },
    { achievement: "Joined 3 Groups", description: "Connect with multiple support groups." },
    { achievement: "100 Messages Sent", description: "You love to stay connected!" },
    { achievement: "1 Month Anniversary", description: "Thank you for being part of our community!" },
  ];

  const [funFact, setFunFact] = useState(funFacts[0]);
  const [challenge, setChallenge] = useState(challenges[0]);
  const petMoodTimeoutRef = useRef(null);

  const playClickSound = () => {
    const audio = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAACAgICAgICAgICAgICAgICAg"
    );
    audio.play();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
      setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)]);
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
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
      setChatMessages((prev) => [...prev, message].slice(-3));
    });

    socket.on("newGratitudeNote", (note) => {
      setGratitudeWall((prev) => [...prev, note].slice(-3));
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from socket");
    });

    return () => socket.disconnect();
  }, []);

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

  // --- COMPACT STYLES ---
  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1f2937",
    padding: "12px",
    boxSizing: "border-box",
  };
  const contentWrapper = {
    width: "100%",
    maxWidth: "950px",
    display: "flex",
    flexDirection: "column",
    gap: "1.4em",
    animationName: "fadeUp",
    animationDuration: "1s",
    animationFillMode: "forwards",
    opacity: 1,
  };
  const headerStyle = {
    fontSize: "2.3rem",
    fontWeight: "700",
    marginBottom: "0.2em",
    opacity: 0,
    animationName: "fadeUp",
    animationDuration: "1s",
    animationFillMode: "forwards",
    animationDelay: "0.1s",
    letterSpacing: "1px"
  };
  const subHeaderStyle = {
    fontWeight: "500",
    fontSize: "1rem",
    marginBottom: "1.2em",
    color: "#4b5563",
    opacity: 0,
    animationName: "fadeUp",
    animationDuration: "1s",
    animationFillMode: "forwards",
    animationDelay: "0.2s",
  };
  const sectionStyle = {
    marginBottom: "1.1em",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "1.1em",
    opacity: 0,
    transform: "translateY(15px)",
    animationName: "fadeUp",
    animationDuration: "0.8s",
    animationFillMode: "forwards",
    animationTimingFunction: "ease-out",
  };
  const sectionTitleStyle = {
    fontSize: "1.15rem",
    fontWeight: "600",
    borderBottom: "2px solid #3b82f6",
    paddingBottom: "0.35em",
    marginBottom: "0.85em",
    color: "#2563eb",
    letterSpacing: "0.5px"
  };
  const statsListStyle = {
    display: "flex",
    gap: "2em",
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "1.03rem",
  };
  const statItemStyle = {
    fontSize: "1.09rem",
  };
  const buttonStyle = {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "10px 26px",
    border: "none",
    borderRadius: "18px",
    fontWeight: "700",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(59,130,246,0.08)",
    letterSpacing: "0.5px",
    transition: "background 0.2s, box-shadow 0.2s, transform 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3em"
  };
  const buttonHoverFocus = {
    backgroundColor: "#1d4ed8",
    transform: "scale(1.04)"
  };
  const linkStyle = {
    color: "#2563eb",
    textDecoration: "none",
    background: "#e0e7ff",
    padding: "6px 15px",
    borderRadius: "14px",
    fontWeight: "700",
    fontSize: "0.99rem",
    transition: "background .2s, color .2s",
    cursor: "pointer",
    marginLeft: "5px"
  };
  const flexRowWrap = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.25em",
  };
  const postStyle = {
    flex: "1 1 260px",
    border: "1px solid #e0e7ff",
    borderRadius: "8px",
    padding: "12px 16px",
    backgroundColor: "#ffffff",
    boxShadow: "2px 2px 9px rgba(59,130,246,0.10)",
    fontSize: "1.05rem",
    marginBottom: "4px"
  };
  const postTitleStyle = {
    fontWeight: 700,
    marginBottom: "0.4em",
    fontSize: "1.05rem",
  };
  const postAuthorStyle = {
    fontStyle: "italic",
    color: "#4b5563",
    fontSize: "0.94rem",
    marginBottom: "0.7em",
  };
  const postContentStyle = {
    fontSize: "0.96rem",
    marginBottom: "1em",
    color: "#374151",
  };
  const deleteButtonStyle = {
    backgroundColor: "#ef4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "14px",
    color: "white",
    fontSize: "0.98rem",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "2px",
    letterSpacing: "0.3px",
    transition: "background 0.15s, transform 0.13s"
  };
  const inputStyle = {
    width: "60%",
    padding: "10px",
    marginRight: "5px",
    borderRadius: "10px",
    border: "1.3px solid #d1d5db",
    fontSize: "0.99rem",
  };

  // --- MAIN RETURN ---
  return (
    <>
      <style>
        {`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #2563eb;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        `}
      </style>
      <div style={containerStyle} role="main">
        <div style={contentWrapper}>
          <h1 style={headerStyle} className="fadeUp">
            Welcome back, {user?.username || user}!
          </h1>
          <p style={subHeaderStyle} className="fadeUp">
            Spark joy, connect, and create with our amazing community!
          </p>

          <AnimatedSection label="Live Quick Stats" style={sectionStyle} delay={0}>
            <h2 style={sectionTitleStyle}>📊 Quick Stats (Live)</h2>
            <ul style={statsListStyle}>
              <li style={statItemStyle}>
                📝 Total Posts: <strong>{stats.posts}</strong>
              </li>
              <li style={statItemStyle}>
                👥 Groups: <strong>{stats.groups}</strong>
              </li>
              <li style={statItemStyle}>
                🌍 Members: <strong>{stats.members}</strong>
              </li>
              <li style={statItemStyle}>
                🔥 Active Today: <strong>{stats.activeToday}</strong>
              </li>
            </ul>
            <small style={{ color: "#6b7280" }}>Updated live</small>
          </AnimatedSection>

          <AnimatedSection label="Fun Zone" style={sectionStyle} delay={50}>
            <h2 style={sectionTitleStyle}>🎉 Fun Zone</h2>
            <p><strong>Fun Fact:</strong> {funFact}</p>
            <p><strong>Challenge:</strong> {challenge}</p>
            <p><strong>Quote of the Moment:</strong> {quotes[Math.floor(Math.random() * quotes.length)]}</p>
            <small style={{ color: "#6b7280" }}>Rotates every 10s</small>
          </AnimatedSection>

          <AnimatedSection label="Live Community Chat" style={sectionStyle} delay={100}>
            <h2 style={sectionTitleStyle}>💬 Live Community Chat</h2>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                marginBottom: "10px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "#ffffff",
              }}
              tabIndex="0"
            >
              {chatMessages.length === 0 ? (
                <p>No messages yet. Start the conversation!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "8px", fontSize: "1rem" }}>
                    <strong>{msg.user}:</strong> {msg.content}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} aria-label="Send chat message" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                aria-label="Type your chat message"
                style={inputStyle}
                autoComplete="off"
              />
              <AnimatedButton
                style={buttonStyle}
                disabled={!newMessage.trim()}
                ariaDisabled={!newMessage.trim()}
              >
                Send
              </AnimatedButton>
            </form>
            {isTyping && (
              <p aria-live="assertive" style={{ color: "#2563eb", fontSize: "0.97rem" }}>
                Typing...
              </p>
            )}
            <Link to="/chat" style={linkStyle} aria-label="Join full chat">Join Full Chat →</Link>
          </AnimatedSection>

          <AnimatedSection label="Recent Posts" style={sectionStyle} delay={150}>
            <h2 style={sectionTitleStyle}>📰 Recent Posts</h2>
            {loadingPosts ? (
              <p style={{ fontSize: "1.01rem" }}>Loading...</p>
            ) : posts.length === 0 ? (
              <p style={{ fontSize: "1.01rem" }}>
                No posts yet. <Link to="/create" style={linkStyle}>Create the first post</Link>
              </p>
            ) : (
              <div style={flexRowWrap}>
                {posts.map((p) => (
                  <article key={p._id} style={postStyle}>
                    <h3 style={postTitleStyle}>{p.title}</h3>
                    <p style={postAuthorStyle}>{p.author?.username && `by ${p.author.username}`}</p>
                    <p style={postContentStyle}>{p.content.slice(0, 70)}...</p>
                    <AnimatedButton
                      style={deleteButtonStyle}
                      onClick={() => handleDeletePost(p._id)}
                      ariaLabel={`Delete post titled ${p.title}`}
                    >
                      Delete
                    </AnimatedButton>
                  </article>
                ))}
              </div>
            )}
            <Link to="/feed" style={linkStyle} aria-label="View all posts">View All Posts →</Link>
          </AnimatedSection>

          <AnimatedSection label="Support Groups" style={sectionStyle} delay={190}>
            <h2 style={sectionTitleStyle}>🤝 Support Groups</h2>
            {groups.length === 0 ? (
              <p style={{ fontSize: "0.98rem" }}>
                No groups yet. <Link to="/support-groups" style={linkStyle}>Browse groups</Link>
              </p>
            ) : (
              <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: "1em" }}>
                {groups.map((group) => (
                  <li key={group._id} style={{ marginBottom: "0.7em", fontSize: "0.98rem" }}>
                    <strong>{group.name}</strong>
                    <p style={{ margin: 0, color: "#4b5563" }}>{group.description?.slice(0, 90)}...</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/support-groups" style={linkStyle} aria-label="Browse more groups">Browse More Groups →</Link>
          </AnimatedSection>

          <AnimatedSection label="Member Milestones" style={sectionStyle} delay={220}>
            <h2 style={sectionTitleStyle}>🎯 Member Milestones</h2>
            <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: "1em" }}>
              {memberMilestones.map((milestone, idx) => (
                <li key={idx} style={{ marginBottom: "0.7em", fontSize: "0.97rem" }}>
                  <strong>{milestone.achievement}:</strong> {milestone.description}
                </li>
              ))}
            </ul>
            <small style={{ color: "#6b7280" }}>Check your progress in your profile!</small>
          </AnimatedSection>

          <AnimatedSection label="Creative Prompts" style={sectionStyle} delay={260}>
            <h2 style={sectionTitleStyle}>✍️ Creative Spark</h2>
            <p style={{ fontSize: "1rem", marginBottom: "1em" }}>{creativePrompt}</p>
            <AnimatedButton
              style={buttonStyle}
              onClick={() =>
                setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)])
              }
              ariaLabel="Get new creative prompt"
            >
              New Prompt
            </AnimatedButton>
            <Link to="/create-art" style={linkStyle} aria-label="Share your creation">Share Your Creation →</Link>
          </AnimatedSection>

          <AnimatedSection label="Gratitude Wall" style={sectionStyle} delay={300}>
            <h2 style={sectionTitleStyle}>🙏 Gratitude Wall</h2>
            {gratitudeWall.length === 0 ? (
              <p style={{ fontSize: "0.98rem" }}>Be the first to share gratitude!</p>
            ) : (
              gratitudeWall.map((note, idx) => (
                <div key={idx} style={{ marginBottom: "0.8em", fontSize: "0.97rem" }}>
                  <strong>{note.user}:</strong> {note.content}
                </div>
              ))
            )}
            <form onSubmit={handleGratitudeSubmit} aria-label="Submit gratitude note" style={{ marginTop: "1em", display: "flex", gap: "11px" }}>
              <input
                type="text"
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="What are you grateful for?"
                aria-label="Gratitude note input"
                style={{ ...inputStyle, width: "56%" }}
              />
              <AnimatedButton style={buttonStyle} type="submit">Share</AnimatedButton>
            </form>
          </AnimatedSection>

          <AnimatedSection label="Virtual Pet" style={sectionStyle} delay={340}>
            <h2 style={sectionTitleStyle}>🐾 Your Virtual Pet</h2>
            <p style={{ fontSize: "1.02rem" }}>
              <strong>Pet Mood:</strong> <span aria-live="polite">{petMood}</span>
            </p>
            <AnimatedButton
              style={buttonStyle}
              onClick={handlePetInteraction}
              ariaLabel="Play with your virtual pet"
            >
              Play with Pet
            </AnimatedButton>
            <small style={{ display: "block", marginTop: "0.5em", color: "#6b7280", fontSize: "0.97rem" }}>
              Your pet changes mood every 10 seconds!
            </small>
          </AnimatedSection>

          <AnimatedSection label="Community Playlist" style={sectionStyle} delay={380}>
            <h2 style={sectionTitleStyle}>🎵 Community Playlist</h2>
            {playlistSongs.length === 0 ? (
              <p style={{ fontSize: "0.98rem" }}>No songs yet. Add one!</p>
            ) : (
              <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: "0.9em", fontSize: "0.97rem" }}>
                {playlistSongs.map((song, idx) => (
                  <li key={idx}>
                    <strong>{song.song}</strong> by {song.user}
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddSong} aria-label="Add song to playlist" style={{ marginBottom: "0.8em", display: "flex", gap: "10px" }}>
              <input
                type="text"
                name="song"
                placeholder="Add a song title..."
                aria-label="Song title input"
                style={{ ...inputStyle, width: "55%" }}
              />
              <AnimatedButton style={buttonStyle} type="submit">Add Song</AnimatedButton>
            </form>
            <Link to="/playlist" style={linkStyle} aria-label="View full playlist">View Full Playlist →</Link>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};

// Animated Button with modern rounded style and hover/focus effect
const AnimatedButton = ({ style, children, onClick, disabled, ariaDisabled, type, ariaLabel }) => {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);

  const combinedStyle = {
    ...style,
    ...(hover || focus ? {
      backgroundColor: "#1d4ed8",
      transform: "scale(1.04)"
    } : {}),
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <button
      aria-label={ariaLabel}
      type={type || "button"}
      style={combinedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={ariaDisabled}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => !disabled && setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      {children}
    </button>
  );
};

// FadeUp Animated Section
const AnimatedSection = ({ children, style, delay = 0, label }) => (
  <section
    aria-label={label}
    style={{
      ...style,
      animationDelay: `${delay}ms`,
      animationFillMode: "forwards",
      animationName: "fadeUp",
      animationDuration: "800ms",
      animationTimingFunction: "ease-out",
    }}
    tabIndex="0"
  >
    {children}
  </section>
);

export default Dashboard;
