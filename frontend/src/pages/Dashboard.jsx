import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const fadeUpAnimation = {
  animationName: "fadeUp",
  animationDuration: "0.9s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",
  opacity: 0,
  transform: "translateY(25px)",
};

const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ posts: 0, groups: 0, members: 0, activeToday: 0 });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [quote, setQuote] = useState("");
  const [spotlightUser, setSpotlightUser] = useState(null);
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
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
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
        const [postsRes, groupsRes, statsRes, spotlightRes, gratitudeRes, playlistRes] = await Promise.all([
          fetch("/api/posts"),
          fetch("/api/groups"),
          fetch("/api/stats"),
          fetch("/api/users/random"),
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

        const spotlightData = await spotlightRes.json();
        setSpotlightUser(spotlightData);

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

  const surpriseAll = () => {
    playClickSound();
    setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
    setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)]);
    setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
  };

  // Style objects with animations and larger sizes for engagement

  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    backgroundColor: "#f9fafb",
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1f2937",
    padding: "32px",
    boxSizing: "border-box",
  };

  const contentWrapper = {
    width: "100%",
    maxWidth: "1150px",
    display: "flex",
    flexDirection: "column",
    gap: "3.5em",
    animationName: "fadeUp",
    animationDuration: "1s",
    animationFillMode: "forwards",
    opacity: 1,
  };

  const headerStyle = {
    fontSize: "3rem",
    fontWeight: "700",
    marginBottom: "0.4em",
    opacity: 0,
    animationName: "fadeUp",
    animationDuration: "1s",
    animationFillMode: "forwards",
    animationDelay: "0.1s",
  };

  const subHeaderStyle = {
    fontWeight: "500",
    fontSize: "1.3rem",
    marginBottom: "2em",
    color: "#4b5563",
    opacity: 0,
    animationName: "fadeUp",
    animationDuration: "1s",
    animationFillMode: "forwards",
    animationDelay: "0.2s",
  };

  const sectionStyle = {
    marginBottom: "3em",
    borderBottom: "1.5px solid #e5e7eb",
    paddingBottom: "1.8em",
    opacity: 0,
    transform: "translateY(30px)",
    animationName: "fadeUp",
    animationDuration: "0.9s",
    animationFillMode: "forwards",
    animationTimingFunction: "ease-out",
  };

  const sectionTitleStyle = {
    fontSize: "1.6rem",
    fontWeight: "600",
    borderBottom: "3px solid #3b82f6",
    paddingBottom: "0.6em",
    marginBottom: "1.2em",
    color: "#2563eb",
  };

  const statsListStyle = {
    display: "flex",
    gap: "3.4em",
    listStyle: "none",
    padding: 0,
    margin: 0,
    fontSize: "1.2rem",
  };

  const statItemStyle = {
    fontSize: "1.3rem",
  };

  const buttonStyle = {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: "16px 36px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "1.15rem",
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  };

  const buttonHoverFocus = {
    backgroundColor: "#2563eb",
    transform: "scale(1.05)",
  };

  const linkStyle = {
    color: "#2563eb",
    textDecoration: "underline",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "1.1rem",
    transition: "color 0.3s ease",
  };

  const flexRowWrap = {
    display: "flex",
    flexWrap: "wrap",
    gap: "2.2em",
  };

  const postStyle = {
    flex: "1 1 320px",
    border: "1.5px solid #e0e7ff",
    borderRadius: "8px",
    padding: "22px 26px",
    backgroundColor: "#ffffff",
    boxShadow: "5px 5px 15px rgba(59, 130, 246, 0.15)",
    fontSize: "1.1rem",
  };

  const postTitleStyle = {
    fontWeight: 700,
    marginBottom: "0.6em",
    fontSize: "1.3rem",
  };

  const postAuthorStyle = {
    fontStyle: "italic",
    color: "#4b5563",
    fontSize: "1.05rem",
    marginBottom: "1em",
  };

  const postContentStyle = {
    fontSize: "1.05rem",
    marginBottom: "1.3em",
    color: "#374151",
  };

  const deleteButtonStyle = {
    backgroundColor: "#ef4444",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    fontWeight: "700",
    transition: "background-color 0.2s ease",
  };

  const inputStyle = {
    width: "72%",
    padding: "14px",
    marginRight: "16px",
    borderRadius: "8px",
    border: "1.8px solid #d1d5db",
    fontSize: "1.15rem",
  };

  // To add hover/focus animations for buttons and links using inline styles with onMouseEnter & onMouseLeave handlers
  // We will create dynamic components or helper components for repeated animations if needed,
  // but in this example inline handlers suffice for demonstration.

  return (
    <>
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(25px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          /* Scrollbar styles for webkit browsers */
          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
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
          <h1
            style={headerStyle}
            className="fadeUp"
          >
            Welcome back, {user?.username || user}!
          </h1>
          <p
            style={subHeaderStyle}
            className="fadeUp"
          >
            Spark joy, connect, and create with our amazing community!
          </p>

          <div style={{ marginBottom: "3em" }}>
            <AnimatedButton
              style={buttonStyle}
              onClick={surpriseAll}
              ariaLabel="Surprise me with new fun facts, challenges, quotes, and pet mood"
            >
              🎲 Surprise Me!
            </AnimatedButton>
          </div>

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

          <AnimatedSection label="Fun Zone" style={sectionStyle} delay={100}>
            <h2 style={sectionTitleStyle}>🎉 Fun Zone</h2>
            <p>
              <strong>Fun Fact:</strong> {funFact}
            </p>
            <p>
              <strong>Challenge:</strong> {challenge}
            </p>
            <p>
              <strong>Quote of the Moment:</strong> {quote}
            </p>
            <small style={{ color: "#6b7280" }}>Rotates every 10s</small>
          </AnimatedSection>

          <AnimatedSection label="Live Community Chat" style={sectionStyle} delay={200}>
            <h2 style={sectionTitleStyle}>💬 Live Community Chat</h2>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                marginBottom: "16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "14px",
                backgroundColor: "#ffffff",
              }}
              tabIndex="0"
            >
              {chatMessages.length === 0 ? (
                <p>No messages yet. Start the conversation!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "10px", fontSize: "1.1rem" }}>
                    <strong>{msg.user}:</strong> {msg.content}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} aria-label="Send chat message" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              <p aria-live="assertive" style={{ color: "#2563eb", fontSize: "1rem" }}>
                Typing...
              </p>
            )}
            <Link to="/chat" style={linkStyle} aria-label="Join full chat">
              Join Full Chat →
            </Link>
          </AnimatedSection>

          <AnimatedSection label="Recent Posts" style={sectionStyle} delay={300}>
            <h2 style={sectionTitleStyle}>📰 Recent Posts</h2>
            {loadingPosts ? (
              <p style={{ fontSize: "1.15rem" }}>Loading...</p>
            ) : posts.length === 0 ? (
              <p style={{ fontSize: "1.15rem" }}>
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
            <Link to="/feed" style={linkStyle} aria-label="View all posts">
              View All Posts →
            </Link>
          </AnimatedSection>

          <AnimatedSection label="Support Groups" style={sectionStyle} delay={400}>
            <h2 style={sectionTitleStyle}>🤝 Support Groups</h2>
            {groups.length === 0 ? (
              <p style={{ fontSize: "1.1rem" }}>
                No groups yet. <Link to="/support-groups" style={linkStyle}>Browse groups</Link>
              </p>
            ) : (
              <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: "1.3em" }}>
                {groups.map((group) => (
                  <li key={group._id} style={{ marginBottom: "1em", fontSize: "1.1rem" }}>
                    <strong>{group.name}</strong>
                    <p style={{ margin: 0, color: "#4b5563" }}>{group.description?.slice(0, 100)}...</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/support-groups" style={linkStyle} aria-label="Browse more groups">
              Browse More Groups →
            </Link>
          </AnimatedSection>

          <AnimatedSection label="Community Spotlight" style={sectionStyle} delay={500}>
            <h2 style={sectionTitleStyle}>🌟 Community Spotlight</h2>
            {spotlightUser ? (
              <>
                <h3 style={{ fontWeight: "700", fontSize: "1.4rem" }}>{spotlightUser.username}</h3>
                <p style={{ color: "#4b5563", fontSize: "1.1rem", marginBottom: "1em" }}>
                  {spotlightUser.bio?.slice(0, 120) || "An amazing community member!"}...
                </p>
                <Link
                  to={`/profile/${spotlightUser._id}`}
                  style={linkStyle}
                  aria-label={`Visit profile of ${spotlightUser.username}`}
                >
                  Visit Profile →
                </Link>
              </>
            ) : (
              <p style={{ fontSize: "1.15rem" }}>Loading spotlight...</p>
            )}
          </AnimatedSection>

          <AnimatedSection label="Creative Prompts" style={sectionStyle} delay={600}>
            <h2 style={sectionTitleStyle}>✍️ Creative Spark</h2>
            <p style={{ fontSize: "1.2rem", marginBottom: "1.3em" }}>{creativePrompt}</p>
            <AnimatedButton
              style={buttonStyle}
              onClick={() =>
                setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)])
              }
              ariaLabel="Get new creative prompt"
            >
              New Prompt
            </AnimatedButton>
            <Link to="/create-art" style={{ ...linkStyle, marginLeft: "1.2em" }} aria-label="Share your creation">
              Share Your Creation →
            </Link>
          </AnimatedSection>

          <AnimatedSection label="Gratitude Wall" style={sectionStyle} delay={700}>
            <h2 style={sectionTitleStyle}>🙏 Gratitude Wall</h2>
            {gratitudeWall.length === 0 ? (
              <p style={{ fontSize: "1.1rem" }}>Be the first to share gratitude!</p>
            ) : (
              gratitudeWall.map((note, idx) => (
                <div key={idx} style={{ marginBottom: "1em", fontSize: "1.1rem" }}>
                  <strong>{note.user}:</strong> {note.content}
                </div>
              ))
            )}
            <form onSubmit={handleGratitudeSubmit} aria-label="Submit gratitude note" style={{ marginTop: "1.5em", display: "flex", gap: "16px" }}>
              <input
                type="text"
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="What are you grateful for?"
                aria-label="Gratitude note input"
                style={{ ...inputStyle, width: "68%" }}
              />
              <AnimatedButton style={buttonStyle} type="submit">
                Share
              </AnimatedButton>
            </form>
          </AnimatedSection>

          <AnimatedSection label="Virtual Pet" style={sectionStyle} delay={800}>
            <h2 style={sectionTitleStyle}>🐾 Your Virtual Pet</h2>
            <p style={{ fontSize: "1.2rem" }}>
              <strong>Pet Mood:</strong> <span aria-live="polite">{petMood}</span>
            </p>
            <AnimatedButton
              style={buttonStyle}
              onClick={handlePetInteraction}
              ariaLabel="Play with your virtual pet"
            >
              Play with Pet
            </AnimatedButton>
            <small style={{ display: "block", marginTop: "0.6em", color: "#6b7280", fontSize: "1rem" }}>
              Your pet changes mood every 10 seconds!
            </small>
          </AnimatedSection>

          <AnimatedSection label="Community Playlist" style={sectionStyle} delay={900}>
            <h2 style={sectionTitleStyle}>🎵 Community Playlist</h2>
            {playlistSongs.length === 0 ? (
              <p style={{ fontSize: "1.1rem" }}>No songs yet. Add one!</p>
            ) : (
              <ul style={{ paddingLeft: 0, listStyle: "none", marginBottom: "1.5em", fontSize: "1.1rem" }}>
                {playlistSongs.map((song, idx) => (
                  <li key={idx}>
                    <strong>{song.song}</strong> by {song.user}
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={handleAddSong} aria-label="Add song to playlist" style={{ marginBottom: "2em", display: "flex", gap: "16px" }}>
              <input
                type="text"
                name="song"
                placeholder="Add a song title..."
                aria-label="Song title input"
                style={{ ...inputStyle, width: "67%" }}
              />
              <AnimatedButton style={buttonStyle} type="submit">
                Add Song
              </AnimatedButton>
            </form>
            <Link to="/playlist" style={linkStyle} aria-label="View full playlist">
              View Full Playlist →
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </>
  );
};

// Animated Button Wrapper with hover + focus effects
const AnimatedButton = ({ style, children, onClick, disabled, ariaDisabled, type, ariaLabel }) => {
  const [hover, setHover] = React.useState(false);
  const [focus, setFocus] = React.useState(false);

  const combinedStyle = {
    ...style,
    ...(hover || focus
      ? {
          backgroundColor: "#2563eb",
          transform: "scale(1.05)",
          transition: "background-color 0.3s ease, transform 0.2s ease",
        }
      : {
          transition: "background-color 0.3s ease, transform 0.2s ease",
        }),
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };

  const handleMouseEnter = () => {
    if (!disabled) setHover(true);
  };
  const handleMouseLeave = () => setHover(false);
  const handleFocus = () => !disabled && setFocus(true);
  const handleBlur = () => setFocus(false);

  return (
    <button
      aria-label={ariaLabel}
      type={type || "button"}
      style={combinedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-disabled={ariaDisabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </button>
  );
};

// Animated Section Wrapper for fadeUp animations with delay
const AnimatedSection = ({ children, style, delay = 0, label }) => {
  return (
    <section
      aria-label={label}
      style={{
        ...style,
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        animationName: "fadeUp",
        animationDuration: "900ms",
        animationTimingFunction: "ease-out",
      }}
      tabIndex="0"
    >
      {children}
    </section>
  );
};

export default Dashboard;
