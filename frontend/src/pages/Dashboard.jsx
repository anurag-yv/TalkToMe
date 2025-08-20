import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000"; // make sure this matches backend

const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ posts: 0, groups: 0, members: 0, activeToday: 0 });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [quote, setQuote] = useState("");
  const [spotlightUser, setSpotlightUser] = useState(null);
  const [gratitudeNote, setGratitudeNote] = useState("");
  const [gratitudeWall, setGratitudeWall] = useState([]);
  const [creativePrompt, setCreativePrompt] = useState("");
  const [petMood, setPetMood] = useState("happy");
  const [playlistSongs, setPlaylistSongs] = useState([]);

  const moods = ["😊 Happy", "😌 Calm", "😢 Reflective", "🥳 Excited", "🤗 Warm", "😴 Chill", "😇 Hopeful"];
  const dailyMood = useMemo(() => moods[Math.floor(Math.random() * moods.length)].split(" ")[0], []);

  // Fun facts, challenges, quotes, creative prompts, and pet interactions
  const funFacts = [
    "💡 Did you know? Honey never spoils.",
    "🐬 Dolphins have names for each other!",
    "🌱 Bamboo can grow up to 3 feet in one day.",
    "🌕 There's no sound in space."
  ];
  const challenges = [
    "📸 Share a picture of something blue in chat.",
    "✍️ Post your favorite quote.",
    "🎶 Recommend a song to the community.",
    "😂 Tell a one-line joke."
  ];
  const quotes = [
    "The best way to find yourself is to lose yourself in the service of others. – Mahatma Gandhi",
    "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "We rise by lifting others. – Robert Ingersoll"
  ];
  const creativePrompts = [
    "Sketch a dream destination you'd love to visit.",
    "Write a 3-sentence story about a magical encounter.",
    "Imagine a new holiday and describe how you'd celebrate it.",
    "Design a superhero inspired by your favorite hobby."
  ];
  const petMoods = ["happy 🐶", "playful 🐾", "cozy 😺", "curious 🐰"];
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [challenge, setChallenge] = useState(challenges[0]);

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

  // Fetch posts, groups, stats, spotlight user, gratitude wall, and playlist
  useEffect(() => {
    async function fetchData() {
      try {
        const postsRes = await fetch("/api/posts");
        const postsData = await postsRes.json();
        setPosts(postsData.slice(0, 3));
        setLoadingPosts(false);

        const groupsRes = await fetch("/api/groups");
        const groupsData = await groupsRes.json();
        setGroups(groupsData.slice(0, 4));

        const statsRes = await fetch("/api/stats");
        const statsData = await statsRes.json();
        setStats(statsData);

        const spotlightRes = await fetch("/api/users/random");
        const spotlightData = await spotlightRes.json();
        setSpotlightUser(spotlightData);

        const gratitudeRes = await fetch("/api/gratitude");
        const gratitudeData = await gratitudeRes.json();
        setGratitudeWall(gratitudeData.slice(0, 3));

        const playlistRes = await fetch("/api/playlist");
        const playlistData = await playlistRes.json();
        setPlaylistSongs(playlistData.slice(0, 3));
      } catch {
        setLoadingPosts(false);
      }
    }
    fetchData();
  }, []);

  // Real-time live stats, chat, and gratitude wall via websocket
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
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

  // Handle sending chat message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("sendChatMessage", { user: user.username, content: newMessage });
    setNewMessage("");
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (err) {
      alert(err.message || "Error deleting post");
    }
  };

  // Handle mood selection
  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    fetch("/api/user/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: mood.split(" ")[0] })
    });
  };

  // Handle gratitude note submission
  const handleGratitudeSubmit = (e) => {
    e.preventDefault();
    if (!gratitudeNote.trim()) return;
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("newGratitudeNote", { user: user.username, content: gratitudeNote });
    setGratitudeNote("");
  };

  // Handle pet interaction
  const handlePetInteraction = () => {
    setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
    alert(`Your virtual pet is feeling ${petMood}! Give it some love!`);
  };

  // Handle adding song to playlist
  const handleAddSong = (e) => {
    e.preventDefault();
    const songInput = e.target.elements.song.value;
    if (!songInput.trim()) return;
    fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ song: songInput, user: user.username })
    }).then(() => {
      setPlaylistSongs((prev) => [...prev, { song: songInput, user: user.username }].slice(-3));
      e.target.reset();
    });
  };

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    background: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  };

  const contentWrapper = {
    flex: 1,
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "2vw 2vw 4vw 2vw",
    display: "flex",
    flexDirection: "column"
  };

  const cardsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "28px",
    marginTop: "18px",
    flex: 1,
    width: "100%"
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.96)",
    boxShadow: "0 4px 24px rgba(140,85,255,0.09)",
    borderRadius: "18px",
    padding: "22px",
    minHeight: "205px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    transition: "transform 0.3s ease",
    cursor: "pointer"
  };

  const cardHoverStyle = {
    ...cardStyle,
    transform: "scale(1.02)"
  };

  const titleStyle = {
    color: "#b45309",
    fontWeight: 700,
    marginBottom: 14,
    fontSize: "1.3rem"
  };

  const buttonStyle = {
    background: "linear-gradient(85deg, #fad0c4 0%, #fbc2eb 100%)",
    padding: "13px 28px",
    borderRadius: 28,
    color: "#7c2d12",
    fontWeight: 700,
    fontSize: "1.03rem",
    textDecoration: "none",
    boxShadow: "0 4px 14px rgba(251,146,60,0.08)",
    margin: "7px 4px",
    display: "inline-block",
    border: "none",
    transition: "transform 0.2s ease"
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        <h1 style={{
          fontSize: "2.3rem",
          textAlign: "center",
          color: "#7c2d12",
          fontWeight: 800
        }}>
          Welcome back, {user}! {selectedMood ? selectedMood.split(" ")[0] : dailyMood}
        </h1>

        <p style={{
          textAlign: "center",
          margin: "12px 0 30px 0",
          color: "#8b5cf6",
          fontSize: "1.13rem",
          fontWeight: 500
        }}>
          Spark joy, connect, and create with our amazing community!
        </p>

        {/* Mood Selector */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "20px"
        }}>
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              style={{
                ...buttonStyle,
                background: selectedMood === mood ? "#a6c1ee" : buttonStyle.background,
                transform: selectedMood === mood ? "scale(1.1)" : "none"
              }}
            >
              {mood}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "30px"
        }}>
          {[
            ["Create Post", "/create"],
            ["Join Group", "/support-groups"],
            ["Chat Now", "/chat"],
            ["Resources", "/resources"],
            ["Share Story", "/share-story"],
            ["Create Art", "/create-art"]
          ].map(([label, to]) => (
            <Link key={label} to={to} style={buttonStyle}>{label}</Link>
          ))}
        </div>

        <div style={cardsGrid}>
          {/* Quick Stats Card */}
          <section style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={titleStyle}>📊 Quick Stats (Live)</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>📝 Total Posts: <span style={{ color: "#b45309" }}>{stats.posts}</span></li>
              <li>👥 Groups: <span style={{ color: "#b45309" }}>{stats.groups}</span></li>
              <li>🌍 Members: <span style={{ color: "#b45309" }}>{stats.members}</span></li>
              <li>🔥 Active Today: <span style={{ color: "#b45309" }}>{stats.activeToday}</span></li>
            </ul>
            <span style={{ fontSize: "0.9em", color: "#9ca3af" }}>Updated live</span>
          </section>

          {/* Fun Zone */}
          <section style={{ ...cardStyle, background: "linear-gradient(137deg, #c3f0ca 20%, #a8e6cf 100%)" }} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={{ ...titleStyle, color: "#256029" }}>🎉 Fun Zone</h2>
            <p><b>Fun Fact:</b> {funFact}</p>
            <p><b>Challenge:</b> {challenge}</p>
            <p><b>Quote of the Moment:</b> {quote}</p>
            <small style={{ color: "#378262" }}>Rotates every 10s</small>
          </section>

          {/* Live Chat Preview */}
          <section style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={titleStyle}>💬 Live Community Chat</h2>
            {chatMessages.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <b>{msg.user}:</b> {msg.content}
                </div>
              ))
            )}
            <form onSubmit={handleSendMessage} style={{ marginTop: 10 }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  width: "70%",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid #ccc"
                }}
              />
              <button type="submit" style={{ ...buttonStyle, padding: "8px 16px" }}>Send</button>
            </form>
            <Link to="/chat" style={{ color: "#9333ea", textDecoration: "underline" }}>Join Full Chat →</Link>
          </section>

          {/* Recent Posts Card */}
          <section style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={titleStyle}>📰 Recent Posts</h2>
            {loadingPosts ? <p>Loading...</p> :
              (posts.length === 0
                ? <p>No posts yet. <Link to="/create">Create the first post</Link></p>
                : posts.map((p) => (
                  <div key={p._id} style={{
                    marginBottom: 12,
                    position: "relative",
                    paddingRight: 70
                  }}>
                    <b>{p.title}</b>
                    <span style={{ color: "#7e22ce", fontStyle: "italic" }}>
                      {p.author?.username && ` by ${p.author.username}`}
                    </span>
                    <div style={{ color: "#78350f", fontSize: "0.96em" }}>
                      {p.content.slice(0, 56)}...
                    </div>
                    <button
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 12
                      }}
                      onClick={() => handleDeletePost(p._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )
            }
            <Link to="/feed" style={{ color: "#9333ea", textDecoration: "underline" }}>View All Posts →</Link>
          </section>

          {/* Groups Card */}
          <section style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={titleStyle}>🤝 Support Groups</h2>
            {groups.length === 0
              ? <p>No groups yet. <Link to="/support-groups">Browse groups</Link></p>
              : groups.map((group) => (
                <div key={group._id} style={{ marginBottom: 12 }}>
                  <b>{group.name}</b>
                  <div style={{ color: "#92400e", fontSize: "0.98em" }}>
                    {group.description?.slice(0, 54)}...
                  </div>
                </div>
              ))
            }
            <Link to="/support-groups" style={{ color: "#9a3412", textDecoration: "underline" }}>Browse More Groups →</Link>
          </section>

          {/* Community Spotlight */}
          <section style={{ ...cardStyle, background: "linear-gradient(135deg, #fbc2eb 0%, #fef3c7 100%)" }} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={{ ...titleStyle, color: "#7c2d12" }}>🌟 Community Spotlight</h2>
            {spotlightUser ? (
              <div>
                <b>{spotlightUser.username}</b>
                <p style={{ color: "#78350f", fontSize: "0.96em" }}>
                  {spotlightUser.bio?.slice(0, 60) || "An amazing community member!"}...
                </p>
                <Link to={`/profile/${spotlightUser._id}`} style={{ color: "#9333ea", textDecoration: "underline" }}>
                  Visit Profile →
                </Link>
              </div>
            ) : (
              <p>Loading spotlight...</p>
            )}
          </section>

          {/* Creative Prompt Generator */}
          <section style={{ ...cardStyle, background: "linear-gradient(135deg, #fef3c7 0%, #a6c1ee 100%)" }} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={{ ...titleStyle, color: "#7c2d12" }}>✍️ Creative Spark</h2>
            <p><b>Today's Prompt:</b> {creativePrompt}</p>
            <button
              onClick={() => setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)])}
              style={{ ...buttonStyle, padding: "8px 16px" }}
            >
              New Prompt
            </button>
            <Link to="/create-art" style={{ color: "#9333ea", textDecoration: "underline" }}>Share Your Creation →</Link>
          </section>

          {/* Gratitude Wall */}
          <section style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={titleStyle}>🙏 Gratitude Wall</h2>
            {gratitudeWall.length === 0 ? (
              <p>Be the first to share gratitude!</p>
            ) : (
              gratitudeWall.map((note, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <b>{note.user}:</b> {note.content}
                </div>
              ))
            )}
            <form onSubmit={handleGratitudeSubmit} style={{ marginTop: 10 }}>
              <input
                type="text"
                value={gratitudeNote}
                onChange={(e) => setGratitudeNote(e.target.value)}
                placeholder="What are you grateful for?"
                style={{
                  width: "70%",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid #ccc"
                }}
              />
              <button type="submit" style={{ ...buttonStyle, padding: "8px 16px" }}>Share</button>
            </form>
          </section>

          {/* Virtual Pet Companion */}
          <section style={{ ...cardStyle, background: "linear-gradient(135deg, #c3f0ca 0%, #fbc2eb 100%)" }} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={{ ...titleStyle, color: "#256029" }}>🐾 Your Virtual Pet</h2>
            <p><b>Pet Mood:</b> {petMood}</p>
            <button
              onClick={handlePetInteraction}
              style={{ ...buttonStyle, padding: "8px 16px" }}
            >
              Play with Pet
            </button>
            <small style={{ color: "#378262" }}>Your pet changes mood every 10s!</small>
          </section>

          {/* Community Playlist */}
          <section style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = cardHoverStyle.transform} onMouseOut={(e) => e.currentTarget.style.transform = "none"}>
            <h2 style={titleStyle}>🎵 Community Playlist</h2>
            {playlistSongs.length === 0 ? (
              <p>No songs yet. Add one!</p>
            ) : (
              playlistSongs.map((song, idx) => (
                <div key={idx} style={{ marginBottom: 10 }}>
                  <b>{song.song}</b> <i>by {song.user}</i>
                </div>
              ))
            )}
            <form onSubmit={handleAddSong} style={{ marginTop: 10 }}>
              <input
                type="text"
                name="song"
                placeholder="Add a song title..."
                style={{
                  width: "70%",
                  padding: "8px",
                  borderRadius: 8,
                  border: "1px solid #ccc"
                }}
              />
              <button type="submit" style={{ ...buttonStyle, padding: "8px 16px" }}>Add Song</button>
            </form>
            <Link to="/playlist" style={{ color: "#9333ea", textDecoration: "underline" }}>View Full Playlist →</Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;