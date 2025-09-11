import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    posts: 0,
    groups: 0,
    members: 0,
    activeToday: 0,
  });
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
  const [dailyInspiration, setDailyInspiration] = useState(
    "Believe you can and you're halfway there."
  );
  const [quickTips, setQuickTips] = useState([
    "Take short mindful breaks every hour.",
    "Drink water regularly.",
    "Connect with someone new this week.",
    "Write down one thing you're grateful for today.",
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
  const [socialMediaPosts, setSocialMediaPosts] = useState([]);
  const [newSocialPost, setNewSocialPost] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [userProfile, setUserProfile] = useState({
    username: user?.username || "User",
    avatar: "🧑",
  });
  const petMoodTimeoutRef = useRef(null);
  const breathingTimerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Separate debounce refs per input for smoother typing
  const debounceRefs = {
    newMessage: useRef(null),
    searchQuery: useRef(null),
    gratitudeNote: useRef(null),
    newGoal: useRef(null),
    newHabit: useRef(null),
    newSocialPost: useRef(null),
    journalEntry: useRef(null),
  };

  const createDebouncedSetter = (setter, refName, setTyping = null, typingValue = null) =>
    useCallback(
      (value) => {
        if (debounceRefs[refName].current)
          clearTimeout(debounceRefs[refName].current);
        debounceRefs[refName].current = setTimeout(() => {
          setter(value);
          if (setTyping) setTyping(typingValue);
          debounceRefs[refName].current = null;
        }, 150);
      },
      [setter, setTyping, typingValue]
    );

  const debouncedSetNewMessage = createDebouncedSetter(
    setNewMessage,
    "newMessage",
    setIsTyping,
    true
  );
  const debouncedSetSearchQuery = createDebouncedSetter(setSearchQuery, "searchQuery");
  const debouncedSetGratitudeNote = createDebouncedSetter(setGratitudeNote, "gratitudeNote");
  const debouncedSetNewGoal = createDebouncedSetter(setNewGoal, "newGoal");
  const debouncedSetNewHabit = createDebouncedSetter(setNewHabit, "newHabit");
  const debouncedSetNewSocialPost = createDebouncedSetter(setNewSocialPost, "newSocialPost");
  const debouncedSetJournalEntry = createDebouncedSetter(setJournalEntry, "journalEntry");

  // Input handlers
  const handleNewMessageChange = (e) => debouncedSetNewMessage(e.target.value);
  const handleSearchChange = (e) => debouncedSetSearchQuery(e.target.value);
  const handleGratitudeNoteChange = (e) => debouncedSetGratitudeNote(e.target.value);
  const handleNewGoalChange = (e) => debouncedSetNewGoal(e.target.value);
  const handleNewHabitChange = (e) => debouncedSetNewHabit(e.target.value);
  const handleSocialPostChange = (e) => debouncedSetNewSocialPost(e.target.value);
  const handleJournalEntryChange = (e) => debouncedSetJournalEntry(e.target.value);

  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop);
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
      scrollTimeoutRef.current = requestAnimationFrame(() => {
        scrollContainerRef.current.scrollTop = scrollPosition;
      });
    }
  }, [scrollPosition]);

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

  // Your other handlers (handleSendMessage, handleDeletePost, etc.) remain unchanged
  // Just be sure to replace inputs onChange with their respective handlers below

  // Styles - Keeping original styles
  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: darkMode
      ? "linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)"
      : "linear-gradient(135deg, #e6f3fa 0%, #f3e5f5 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
    color: darkMode ? "#e2e8f0" : "#37474f",
    overflowX: "hidden",
    overflowY: "auto",
    scrollBehavior: "smooth",
  };

  const headerSectionStyle = {
    width: "100%",
    maxWidth: "960px",
    textAlign: "center",
    marginBottom: "30px",
  };

  const contentWrapper = {
    width: "100%",
    maxWidth: "960px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const sectionStyle = {
    background: darkMode ? "rgba(32, 46, 38, 0.95)" : "rgba(255, 255, 255, 0.9)",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: darkMode
      ? "0 8px 24px rgba(0, 0, 0, 0.15)"
      : "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  const sectionTitleStyle = {
    fontSize: "1.4rem",
    fontWeight: "600",
    marginBottom: "15px",
    color: darkMode ? "#e2e8f0" : "#303030",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1.5px solid ${darkMode ? "#4fd1c5" : "#68d391"}`,
    background: darkMode ? "#1c2f23" : "#e6f3ea",
    fontSize: "1rem",
    color: darkMode ? "#cff6e0" : "#276749",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const buttonBaseStyle = {
    background: darkMode
      ? "linear-gradient(135deg, #4fd1c5, #2e7d32)"
      : "linear-gradient(135deg, #68d391, #2e7d32)",
    borderRadius: "12px",
    border: "none",
    color: "#e6fff2",
    fontWeight: "600",
    fontSize: "1rem",
    padding: "12px 28px",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.1s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const linkStyle = {
    color: darkMode ? "#4fd1c5" : "#276749",
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

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .flex-row {
              flex-direction: column;
            }
            input, textarea {
              font-size: 1rem !important;
            }
          }
        `}
      </style>
      <main style={containerStyle} ref={scrollContainerRef}>
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "15px 25px",
              borderRadius: "12px",
              background: toast.type === "error" ? "#ef4444" : "#48bb78",
              color: "#f0fdf4",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              zIndex: 9999,
            }}
          >
            {toast.message}
          </div>
        )}

        <div style={headerSectionStyle}>
          <div style={sectionStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "1.25rem" }}>
                {userProfile.avatar} {userProfile.username}
              </span>
              <button
                aria-label="Toggle dark mode"
                onClick={() => {
                  setDarkMode((prev) => !prev);
                  playClickSound();
                  showToast(
                    `Switched to ${darkMode ? "Light" : "Dark"} Mode!`
                  );
                }}
                style={{
                  ...buttonBaseStyle,
                  padding: "8px 18px",
                  fontSize: "0.9rem",
                }}
              >
                {darkMode ? "🌞 Light" : "🌙 Dark"}
              </button>
            </div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "10px" }}>
              Welcome, {mood}
            </h1>
            <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
              Your space for growth and connection.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate("/search");
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Find groups, posts, or tips..."
                style={inputStyle}
                aria-label="Search"
              />
              <button
                type="submit"
                style={{ ...buttonBaseStyle, marginTop: 14, width: "100%" }}
                aria-label="Search"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div style={contentWrapper}>
          {/* Wellness Score */}
          <section style={sectionStyle} aria-label="Wellness Journey">
            <h2 style={sectionTitleStyle}>🌱 Wellness Score</h2>
            <div
              style={{
                height: "10px",
                background: darkMode ? "#2f855a" : "#a3f5a4",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${wellnessScore}%`,
                  background:
                    "linear-gradient(90deg, #4fd1c5 0%, #68d391 100%)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <p style={{ textAlign: "center", fontWeight: "600" }}>
              {wellnessScore}/100
            </p>
          </section>

          {/* Notifications */}
          <section style={sectionStyle} aria-label="Notifications">
            <h2 style={sectionTitleStyle}>🔔 Notifications</h2>
            {notifications.length === 0 ? (
              <p>You're all caught up!</p>
            ) : (
              <>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      background: darkMode ? "#22543d" : "#d9fdd3",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    {notif.message}
                  </div>
                ))}
                <button
                  onClick={() => {
                    setNotifications([]);
                    playClickSound();
                    showToast("Notifications cleared!");
                  }}
                  style={{
                    ...buttonBaseStyle,
                    width: "100%",
                    marginTop: "12px",
                  }}
                  aria-label="Clear notifications"
                >
                  Clear All
                </button>
              </>
            )}
          </section>

          {/* Share Positivity */}
          <section style={sectionStyle} aria-label="Share Positivity">
            <h2 style={sectionTitleStyle}>📝 Share Positivity</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSocialPost.trim()) return;
                const socket = io(SOCKET_SERVER_URL);
                socket.emit("newSocialPost", {
                  user: userProfile.username,
                  platform: "X",
                  content: newSocialPost,
                });
                setNewSocialPost("");
                playClickSound();
                setWellnessScore((p) => Math.min(100, p + 3));
                showToast("Posted!");
              }}
              style={{ display: "flex", gap: "10px", marginBottom: 20 }}
            >
              <input
                type="text"
                value={newSocialPost}
                onChange={handleSocialPostChange}
                placeholder="Share a positive thought..."
                style={{ ...inputStyle, flex: 1 }}
                aria-label="Social post"
              />
              <button
                type="submit"
                style={buttonBaseStyle}
                disabled={!newSocialPost.trim()}
                aria-label="Post"
              >
                Post
              </button>
            </form>
            {socialMediaPosts.length === 0 ? (
              <p>Be the first to share positivity!</p>
            ) : (
              socialMediaPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: darkMode ? "#22543d" : "#d9fdd3",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>{post.platform}:</strong> {post.content} by{" "}
                  {post.user}
                  <button
                    onClick={() => {
                      setSocialMediaPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id
                            ? { ...p, likes: (p.likes || 0) + 1 }
                            : p
                        )
                      );
                      setGratitudeWall((prev) =>
                        prev.map((note) =>
                          note.id === post.id
                            ? { ...note, likes: (note.likes || 0) + 1 }
                            : note
                        )
                      );
                      playClickSound();
                      showToast("Liked!");
                    }}
                    style={{
                      marginLeft: 15,
                      background: "linear-gradient(90deg, #ef4444, #b91c1c)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                    aria-label={`Like post ${post.id}`}
                  >
                    ❤️ {post.likes || 0}
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Daily Goals & Habits side-by-side */}
          <div style={{ ...flexRow }}>
            <section
              style={{ ...sectionStyle, flex: "1" }}
              aria-label="Daily Goals"
            >
              <h2 style={sectionTitleStyle}>🎯 Daily Goals</h2>
              {dailyGoals.map((goal, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => {
                      setDailyGoals((prev) => {
                        const newGoals = [...prev];
                        newGoals[idx].completed = !newGoals[idx].completed;
                        return newGoals;
                      });
                      playClickSound();
                      setWellnessScore((p) => Math.min(100, p + 5));
                      showToast("Goal updated!");
                    }}
                    aria-label={`Toggle goal ${goal.goal}`}
                  />
                  {goal.goal}
                </label>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newGoal.trim()) return;
                  setDailyGoals((prev) => [...prev, { goal: newGoal, completed: false }]);
                  setNewGoal("");
                  playClickSound();
                  setWellnessScore((p) => Math.min(100, p + 3));
                  showToast("Goal added!");
                }}
                style={{ marginTop: 15, display: "flex", gap: "10px" }}
              >
                <input
                  type="text"
                  value={newGoal}
                  onChange={handleNewGoalChange}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Add a goal..."
                  aria-label="Add new goal"
                />
                <button type="submit" style={buttonBaseStyle} aria-label="Add goal" disabled={!newGoal.trim()}>
                  Add
                </button>
              </form>
            </section>

            <section
              style={{ ...sectionStyle, flex: "1" }}
              aria-label="Habit Tracker"
            >
              <h2 style={sectionTitleStyle}>🔄 Habit Tracker</h2>
              {habits.map((habit, idx) => (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={() => {
                      setHabits((prev) => {
                        const newHabits = [...prev];
                        newHabits[idx].completed = !newHabits[idx].completed;
                        return newHabits;
                      });
                      playClickSound();
                      setWellnessScore((p) => Math.min(100, p + 4));
                      showToast("Habit updated!");
                    }}
                    aria-label={`Toggle habit ${habit.name}`}
                  />
                  {habit.name}
                </label>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newHabit.trim()) return;
                  setHabits((prev) => [
                    ...prev,
                    { name: newHabit, completed: false },
                  ]);
                  setNewHabit("");
                  playClickSound();
                  showToast("Habit added!");
                }}
                style={{ marginTop: 15, display: "flex", gap: "10px" }}
              >
                <input
                  type="text"
                  value={newHabit}
                  onChange={handleNewHabitChange}
                  placeholder="Add a habit..."
                  style={{ ...inputStyle, flex: 1 }}
                  aria-label="Add new habit"
                />
                <button
                  type="submit"
                  style={buttonBaseStyle}
                  aria-label="Add habit"
                  disabled={!newHabit.trim()}
                >
                  Add
                </button>
              </form>
            </section>
          </div>

          {/* And so on for the rest of your sections with input onChange hooked to debounced handlers */}

          {/* Chat input example */}
          <section style={sectionStyle} aria-label="Community Chat">
            <h2 style={sectionTitleStyle}>💬 Community Chat</h2>
            <div
              style={{
                maxHeight: "160px",
                overflowY: "auto",
                marginBottom: "12px",
                borderRadius: "8px",
                background: darkMode ? "#1a202c" : "#fff8e1",
                padding: "8px",
              }}
            >
              {chatMessages.length === 0 ? (
                <p>Start the conversation!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "8px" }}>
                    <strong>{msg.user}:</strong> {msg.content}
                  </div>
                ))
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMessage.trim()) return;
                const socket = io(SOCKET_SERVER_URL);
                socket.emit("sendChatMessage", {
                  user: userProfile.username,
                  content: newMessage,
                });
                setNewMessage("");
                setIsTyping(false);
                playClickSound();
                showToast("Message sent!");
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={handleNewMessageChange}
                placeholder="Type a message..."
                style={inputStyle}
                aria-label="Chat message"
              />
              <button
                type="submit"
                style={buttonBaseStyle}
                disabled={!newMessage.trim()}
                aria-label="Send message"
              >
                Send
              </button>
            </form>
            {isTyping && (
              <p
                style={{
                  color: darkMode ? "#68d391" : "#4a5568",
                  fontSize: "0.75rem",
                  marginTop: "4px",
                }}
              >
                Typing...
              </p>
            )}
            <Link
              to="/chat"
              style={{ ...linkStyle, display: "block", marginTop: "8px" }}
              aria-label="Go to full chat"
            >
              Full Chat →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
