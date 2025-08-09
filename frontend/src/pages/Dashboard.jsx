import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000"; // make sure this matches backend

const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({ posts: 0, groups: 0, members: 0, activeToday: 0 });
  const [loadingPosts, setLoadingPosts] = useState(true);

  const moods = ["😊", "😌", "😢", "🥳", "🤗", "😴", "😇"];
  const dailyMood = useMemo(() => moods[Math.floor(Math.random() * moods.length)], []);

  // Fun facts & challenges (auto rotate)
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
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [challenge, setChallenge] = useState(challenges[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch posts, groups, and initial stats
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
      } catch {
        setLoadingPosts(false);
      }
      try {
        const statsRes = await fetch("/api/stats");
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch {}
    }
    fetchData();
  }, []);

  // Real-time live stats via websocket
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socket.on("connect", () => {
      console.log("Connected to stats socket");
    });

    socket.on("statsUpdate", (newStats) => {
      console.log("Received stats update:", newStats);
      setStats(newStats);
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from stats socket");
    });

    return () => socket.disconnect();
  }, []);

  // ===== Delete post function =====
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token"); // adjust if you store token differently
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete post");

      // Remove from UI immediately
      setPosts(prev => prev.filter(post => post._id !== postId));

    } catch (err) {
      alert(err.message || "Error deleting post");
    }
  };

  // --- Styles ---
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
    justifyContent: "space-between"
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
    border: "none"
  };

  // --- End styles ---

  return (
    <div style={containerStyle}>
      <div style={contentWrapper}>
        <h1 style={{
          fontSize: "2.3rem",
          textAlign: "center",
          color: "#7c2d12",
          fontWeight: 800
        }}>
          Welcome back, {user}! {dailyMood}
        </h1>

        <p style={{
          textAlign: "center",
          margin: "12px 0 30px 0",
          color: "#8b5cf6",
          fontSize: "1.13rem",
          fontWeight: 500
        }}>
          Feel the warmth of the community as you grow together!
        </p>

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
            ["Resources", "/resources"]
          ].map(([label, to]) => (
            <Link key={label} to={to} style={buttonStyle}>{label}</Link>
          ))}
        </div>

        <div style={cardsGrid}>
          {/* Quick Stats Card */}
          <section style={{ ...cardStyle, background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}>
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
          <section style={{ ...cardStyle, background: "linear-gradient(137deg, #c3f0ca 20%, #a8e6cf 100%)" }}>
            <h2 style={{ ...titleStyle, color: "#256029" }}>🎉 Fun Zone</h2>
            <p><b>Fun Fact:</b> {funFact}</p>
            <p><b>Challenge:</b> {challenge}</p>
            <small style={{ color: "#378262" }}>Rotates every 10s</small>
          </section>

          {/* Recent Posts Card */}
          <section style={cardStyle}>
            <h2 style={titleStyle}>📰 Recent Posts</h2>
            {loadingPosts ? <p>Loading...</p> :
              (posts.length === 0
                ? <p>No posts yet. <Link to="/create">Create the first post</Link></p>
                : posts.map((p) =>
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
                    {/* Delete Button */}
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
                )
              )
            }
            <Link to="/feed" style={{ color: "#9333ea", textDecoration: "underline" }}>View All Posts →</Link>
          </section>

          {/* Groups Card */}
          <section style={cardStyle}>
            <h2 style={titleStyle}>🤝 Support Groups</h2>
            {groups.length === 0
              ? <p>No groups yet. <Link to="/support-groups">Browse groups</Link></p>
              : groups.map((group) =>
                <div key={group._id} style={{ marginBottom: 12 }}>
                  <b>{group.name}</b>
                  <div style={{ color: "#92400e", fontSize: "0.98em" }}>
                    {group.description?.slice(0, 54)}...
                  </div>
                </div>
              )
            }
            <Link to="/support-groups" style={{ color: "#9a3412", textDecoration: "underline" }}>Browse More Groups →</Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
