import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
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
  const [socialMediaPosts, setSocialMediaPosts] = useState([]);
  const [newSocialPost, setNewSocialPost] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [userProfile, setUserProfile] = useState({ username: user?.username || "User", avatar: "🧑" });
  const petMoodTimeoutRef = useRef(null);
  const breathingTimerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fun arrays
  const funFacts = useMemo(() => [
    "Did you know? Honey never spoils.",
    "Dolphins have names for each other!",
    "Bamboo can grow up to 3 feet in one day.",
    "There's no sound in space.",
    "Octopuses have three hearts.",
    "Smiling can boost your mood instantly."
  ], []);

  const challenges = useMemo(() => [
    "Share a picture of something blue in chat.",
    "Post your favorite quote.",
    "Recommend a song to the community.",
    "Tell a one-line joke.",
    "Share a self-care tip.",
    "Do a 1-minute meditation."
  ], []);

  const quotes = useMemo(() => [
    "The best way to find yourself is to lose yourself in the service of others. – Mahatma Gandhi",
    "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
    "The only way to do great work is to love what you do. – Steve Jobs",
    "We rise by lifting others. – Robert Ingersoll",
    "Be the change you wish to see in the world. – Mahatma Gandhi",
    "Your mind is powerful. Fill it with positive thoughts."
  ], []);

  const creativePrompts = useMemo(() => [
    "Sketch a dream destination you'd love to visit.",
    "Write a 3-sentence story about a magical encounter.",
    "Imagine a new holiday and describe how you'd celebrate it.",
    "Design a superhero inspired by your favorite hobby.",
    "Create a poem about your favorite memory.",
    "Journal about what made you smile today."
  ], []);

  const petMoods = useMemo(() => ["happy 🐶", "playful 🐾", "cozy 😺", "curious 🐰", "adventurous 🦊", "relaxed 🐢"], []);

  const memberMilestones = useMemo(() => [
    { achievement: "First Post", description: "Celebrate your very first post!" },
    { achievement: "Joined 3 Groups", description: "Connect with multiple support groups." },
    { achievement: "100 Messages Sent", description: "You love to stay connected!" },
    { achievement: "1 Month Anniversary", description: "Thank you for being part of our community!" },
    { achievement: "Helped 5 Members", description: "You're a community hero!" },
    { achievement: "Completed 7 Daily Goals", description: "Building habits for life!" }
  ], []);

  // State handlers
  const [funFact, setFunFact] = useState(funFacts[0]);
  const [challenge, setChallenge] = useState(challenges[0]);

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollTop);
    }
  }, []);

  // Restore scroll position with requestAnimationFrame
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

  // Debounced state updates for typing
  const debouncedSetNewMessage = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setNewMessage(value);
      setIsTyping(!!value.trim());
    }, 100);
  }, []);

  const debouncedSetSearchQuery = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
    }, 100);
  }, []);

  const debouncedSetGratitudeNote = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setGratitudeNote(value);
    }, 100);
  }, []);

  const debouncedSetNewGoal = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setNewGoal(value);
    }, 100);
  }, []);

  const debouncedSetNewHabit = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setNewHabit(value);
    }, 100);
  }, []);

  const debouncedSetNewSocialPost = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setNewSocialPost(value);
    }, 100);
  }, []);

  const debouncedSetJournalEntry = useCallback((value) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setJournalEntry(value);
    }, 100);
  }, []);

  // Dynamic updates with longer interval to reduce frequency
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      setChallenge(challenges[Math.floor(Math.random() * challenges.length)]);
      setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)]);
      setDailyInspiration(quotes[Math.floor(Math.random() * quotes.length)]);
      setMood(["😊", "😌", "😍", "🤗", "😎", "🥳", "🌟", "💪"][Math.floor(Math.random() * 8)]);
      setQuickTips((tips) => [...tips.slice(1), tips[0]]);
    }, 30000); // Increased to 30s to reduce re-renders
    return () => clearInterval(interval);
  }, [funFacts, challenges, creativePrompts, quotes]);

  useEffect(() => {
    if (petMoodTimeoutRef.current) clearTimeout(petMoodTimeoutRef.current);
    petMoodTimeoutRef.current = setTimeout(() => {
      setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]);
    }, 30000); // Increased to 30s
    return () => clearTimeout(petMoodTimeoutRef.current);
  }, [petMood, petMoods]);

  // Buffer for Socket.IO updates
  const messageBuffer = useRef([]);
  const gratitudeBuffer = useRef([]);
  const notificationBuffer = useRef([]);
  const socialPostBuffer = useRef([]);

  useEffect(() => {
    async function fetchData() {
      setLoadingPosts(true);
      try {
        const [postsRes, groupsRes, statsRes, gratitudeRes, playlistRes] = await Promise.all([
          fetch("/api/posts").then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch posts"))),
          fetch("/api/groups").then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch groups"))),
          fetch("/api/stats").then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch stats"))),
          fetch("/api/gratitude").then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch gratitude"))),
          fetch("/api/playlist").then((res) => (res.ok ? res.json() : Promise.reject("Failed to fetch playlist"))),
        ]);
        setPosts(postsRes.slice(0, 3));
        setGroups(groupsRes.slice(0, 4));
        setStats(statsRes);
        setGratitudeWall(gratitudeRes.slice(0, 3));
        setPlaylistSongs(playlistRes.slice(0, 3));
        setNotifications([
          { id: 1, message: "New message from friend!", type: "message" },
          { id: 2, message: "Your post got 5 likes!", type: "like" },
          { id: 3, message: "Group event tomorrow!", type: "event" },
        ]);
        setEvents([
          { title: "Weekly Support Meetup", date: "Tomorrow at 7 PM" },
          { title: "Art Therapy Workshop", date: "Saturday at 2 PM" },
          { title: "Mindfulness Session", date: "Sunday at 10 AM" },
          { title: "Yoga for Beginners", date: "Monday at 6 PM" },
        ]);
        setHabits([
          { name: "Drink 8 glasses of water", completed: false },
          { name: "Meditate for 10 minutes", completed: true },
          { name: "Walk 5000 steps", completed: false },
        ]);
        setDailyGoals([
          { goal: "Practice gratitude", completed: false },
          { goal: "Connect with a friend", completed: true },
        ]);
        setSocialMediaPosts([
          { id: 1, platform: "X", content: "Feeling grateful today! #Mindfulness", likes: 0 },
          { id: 2, platform: "Instagram", content: "Sunset vibes and self-care. 🌅 #Wellness", likes: 0 },
        ]);
      } catch (error) {
        showToast(`Error fetching data: ${error}`, "error");
      } finally {
        setLoadingPosts(false);
      }
    }
    fetchData();
  }, [showToast]);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("Connected to socket");
      showToast("Connected to real-time updates!");
    });

    socket.on("statsUpdate", (newStats) => setStats(newStats));

    socket.on("newChatMessage", (message) => {
      messageBuffer.current.push(message);
    });

    socket.on("newGratitudeNote", (note) => {
      gratitudeBuffer.current.push({ ...note, likes: 0 });
    });

    socket.on("newNotification", (notification) => {
      notificationBuffer.current.push(notification);
    });

    socket.on("newSocialPost", (post) => {
      socialPostBuffer.current.push({ ...post, likes: 0 });
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from socket");
      showToast("Lost connection, reconnecting...", "error");
    });

    // Batch update every 500ms
    const updateInterval = setInterval(() => {
      if (messageBuffer.current.length > 0) {
        saveScrollPosition();
        setChatMessages((prev) => [...prev, ...messageBuffer.current].slice(-5));
        messageBuffer.current = [];
      }
      if (gratitudeBuffer.current.length > 0) {
        saveScrollPosition();
        setGratitudeWall((prev) => [...prev, ...gratitudeBuffer.current].slice(-5));
        gratitudeBuffer.current = [];
      }
      if (notificationBuffer.current.length > 0) {
        saveScrollPosition();
        setNotifications((prev) => [...prev, ...notificationBuffer.current].slice(-5));
        notificationBuffer.current = [];
      }
      if (socialPostBuffer.current.length > 0) {
        saveScrollPosition();
        setSocialMediaPosts((prev) => [...prev, ...socialPostBuffer.current].slice(-5));
        socialPostBuffer.current = [];
      }
    }, 500);

    return () => {
      socket.disconnect();
      clearInterval(updateInterval);
    };
  }, [saveScrollPosition, showToast]);

  useEffect(() => {
    restoreScrollPosition();
  }, [chatMessages, gratitudeWall, notifications, socialMediaPosts, restoreScrollPosition]);

  // Handlers
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      saveScrollPosition();
      setIsTyping(false);
      const socket = io(SOCKET_SERVER_URL);
      socket.emit("sendChatMessage", { user: userProfile.username, content: newMessage });
      setNewMessage("");
      playClickSound();
      showToast("Message sent!");
    },
    [newMessage, userProfile, playClickSound, saveScrollPosition, showToast]
  );

  const handleInputChange = useCallback(
    (e) => {
      saveScrollPosition();
      debouncedSetNewMessage(e.target.value);
    },
    [saveScrollPosition, debouncedSetNewMessage]
  );

  const handleChatKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  const handleDeletePost = useCallback(
    async (postId) => {
      if (!window.confirm("Are you sure?")) return;
      try {
        saveScrollPosition();
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to delete");
        setPosts((prev) => prev.filter((post) => post._id !== postId));
        playClickSound();
        showToast("Post deleted!");
      } catch (err) {
        showToast(err.message || "Error deleting post", "error");
      }
    },
    [playClickSound, saveScrollPosition, showToast]
  );

  const handleGratitudeSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!gratitudeNote.trim()) return;
      saveScrollPosition();
      const socket = io(SOCKET_SERVER_URL);
      socket.emit("newGratitudeNote", { user: userProfile.username, content: gratitudeNote });
      setGratitudeNote("");
      playClickSound();
      setWellnessScore((prev) => Math.min(100, prev + 5));
      showToast("Gratitude shared!");
    },
    [gratitudeNote, userProfile, playClickSound, saveScrollPosition, showToast]
  );

  const handleGratitudeKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleGratitudeSubmit(e);
      }
    },
    [handleGratitudeSubmit]
  );

  const handlePetInteraction = useCallback(() => {
    saveScrollPosition();
    playClickSound();
    setPetMood("❤️ Loving ❤️");
    setTimeout(() => setPetMood(petMoods[Math.floor(Math.random() * petMoods.length)]), 3000);
    setWellnessScore((prev) => Math.min(100, prev + 2));
    showToast("Pet interaction boosted your mood!");
  }, [playClickSound, saveScrollPosition, petMoods, showToast]);

  const handleAddSong = useCallback(
    (e) => {
      e.preventDefault();
      const songInput = e.target.elements.song.value;
      if (!songInput.trim()) return;
      saveScrollPosition();
      fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ song: songInput, user: userProfile.username }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to add song");
          setPlaylistSongs((prev) => [...prev, { song: songInput, user: userProfile.username }].slice(-3));
          e.target.reset();
          playClickSound();
          showToast("Song added to playlist!");
        })
        .catch((err) => showToast(err.message || "Error adding song", "error"));
    },
    [userProfile, playClickSound, saveScrollPosition, showToast]
  );

  const handleSongKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddSong(e);
      }
    },
    [handleAddSong]
  );

  const handleSearch = useCallback(
    (e) => {
      saveScrollPosition();
      debouncedSetSearchQuery(e.target.value);
    },
    [saveScrollPosition, debouncedSetSearchQuery]
  );

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        navigate("/search");
        showToast("Searching...");
      }
    },
    [navigate, showToast]
  );

  const handleClearNotifications = useCallback(() => {
    saveScrollPosition();
    setNotifications([]);
    playClickSound();
    showToast("Notifications cleared!");
  }, [playClickSound, saveScrollPosition, showToast]);

  const handleAddGoal = useCallback(
    (e) => {
      e.preventDefault();
      if (!newGoal.trim()) return;
      saveScrollPosition();
      setDailyGoals((prev) => [...prev, { goal: newGoal, completed: false }]);
      setNewGoal("");
      playClickSound();
      setWellnessScore((prev) => Math.min(100, prev + 3));
      showToast("Goal added!");
    },
    [newGoal, playClickSound, saveScrollPosition, showToast]
  );

  const handleGoalKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddGoal(e);
      }
    },
    [handleAddGoal]
  );

  const handleToggleGoal = useCallback(
    (index) => {
      saveScrollPosition();
      setDailyGoals((prev) => {
        const newGoals = [...prev];
        newGoals[index].completed = !newGoals[index].completed;
        return newGoals;
      });
      playClickSound();
      setWellnessScore((prev) => Math.min(100, prev + 5));
      showToast("Goal updated!");
    },
    [playClickSound, saveScrollPosition, showToast]
  );

  const handleStartBreathing = useCallback(() => {
    saveScrollPosition();
    setBreathingExercise(true);
    let count = 0;
    breathingTimerRef.current = setInterval(() => {
      count++;
      if (count >= 10) {
        clearInterval(breathingTimerRef.current);
        setBreathingExercise(false);
        setWellnessScore((prev) => Math.min(100, prev + 10));
        showToast("Breathing exercise completed!");
      }
    }, 5000);
  }, [saveScrollPosition, showToast]);

  const handleJournalSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!journalEntry.trim()) return;
      saveScrollPosition();
      setJournalEntry("");
      playClickSound();
      setWellnessScore((prev) => Math.min(100, prev + 7));
      showToast("Journal entry saved!");
    },
    [journalEntry, playClickSound, saveScrollPosition, showToast]
  );

  const handleJournalKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleJournalSubmit(e);
      }
    },
    [handleJournalSubmit]
  );

  const handleAddHabit = useCallback(
    (e) => {
      e.preventDefault();
      if (!newHabit.trim()) return;
      saveScrollPosition();
      setHabits((prev) => [...prev, { name: newHabit, completed: false }]);
      setNewHabit("");
      playClickSound();
      showToast("Habit added!");
    },
    [newHabit, playClickSound, saveScrollPosition, showToast]
  );

  const handleHabitKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddHabit(e);
      }
    },
    [handleAddHabit]
  );

  const handleToggleHabit = useCallback(
    (index) => {
      saveScrollPosition();
      setHabits((prev) => {
        const newHabits = [...prev];
        newHabits[index].completed = !newHabits[index].completed;
        return newHabits;
      });
      playClickSound();
      setWellnessScore((prev) => Math.min(100, prev + 4));
      showToast("Habit updated!");
    },
    [playClickSound, saveScrollPosition, showToast]
  );

  const handleSocialPost = useCallback(
    (e) => {
      e.preventDefault();
      if (!newSocialPost.trim()) return;
      saveScrollPosition();
      const socket = io(SOCKET_SERVER_URL);
      socket.emit("newSocialPost", { user: userProfile.username, platform: "X", content: newSocialPost });
      setNewSocialPost("");
      playClickSound();
      setWellnessScore((prev) => Math.min(100, prev + 3));
      showToast("Posted to X!");
    },
    [newSocialPost, userProfile, playClickSound, saveScrollPosition, showToast]
  );

  const handleSocialPostKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSocialPost(e);
      }
    },
    [handleSocialPost]
  );

  const handleLikePost = useCallback(
    (postId) => {
      saveScrollPosition();
      setSocialMediaPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post))
      );
      setGratitudeWall((prev) =>
        prev.map((note) => (note.id === postId ? { ...note, likes: (note.likes || 0) + 1 } : note))
      );
      playClickSound();
      showToast("Liked!");
    },
    [playClickSound, saveScrollPosition, showToast]
  );

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
    playClickSound();
    showToast(`Switched to ${!darkMode ? "dark" : "light"} mode!`);
  }, [darkMode, playClickSound, showToast]);

  const handleUpdateProfile = useCallback(
    (e) => {
      e.preventDefault();
      const newUsername = e.target.elements.username.value;
      const newAvatar = e.target.elements.avatar.value;
      if (newUsername.trim()) {
        setUserProfile((prev) => ({ ...prev, username: newUsername, avatar: newAvatar }));
        showToast("Profile updated!");
        playClickSound();
      }
    },
    [playClickSound, showToast]
  );

  const handleProfileKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUpdateProfile(e);
      }
    },
    [handleUpdateProfile]
  );

  // Styles
  const containerStyle = {
    minHeight: "100vh",
    width: "100vw",
    background: darkMode ? "linear-gradient(135deg, #2c3e50 0%, #4a5568 100%)" : "linear-gradient(135deg, #e6f3fa 0%, #f3e5f5 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "50px 25px",
    fontFamily: "'Poppins', sans-serif",
    color: darkMode ? "#e2e8f0" : "#37474f",
    overflowX: "hidden",
    overflowY: "auto",
    scrollBehavior: "smooth", // Smooth scrolling
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
    background: darkMode ? "rgba(45, 55, 72, 0.95)" : "rgba(255, 255, 255, 0.95)",
    borderRadius: "25px",
    padding: "35px",
    position: "relative",
    overflow: "hidden",
    willChange: "transform", // Optimize for animations
  };

  const heroStyle = {
    background: darkMode ? "linear-gradient(120deg, #2b6cb0 0%, #6b46c1 100%)" : "linear-gradient(120deg, #4fc3f7 0%, #b39ddb 100%)",
    borderRadius: "35px",
    padding: "60px 35px",
    textAlign: "center",
    color: "#fff",
    marginBottom: "60px",
  };

  const sectionTitleStyle = {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "25px",
    color: darkMode ? "#e2e8f0" : "#263238",
    position: "relative",
    display: "inline-block",
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 22px",
    borderRadius: "50px",
    border: "none",
    background: darkMode ? "#4a5568" : "#eceff1",
    fontSize: "1.1rem",
    color: darkMode ? "#e2e8f0" : "#37474f",
    outline: "none",
    transition: "background 0.3s, box-shadow 0.3s",
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
    transition: "background 0.3s, opacity 0.3s",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
  };

  const linkStyle = {
    color: darkMode ? "#63b3ed" : "#0288d1",
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
    background: darkMode ? "#4a5568" : "#eceff1",
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

  const toastStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "15px 25px",
    borderRadius: "10px",
    color: "#fff",
    background: toast?.type === "error" ? "#ef5350" : "#4fc3f7",
    zIndex: 1000,
  };

  // Components
  const Button = React.memo(({ style, children, onClick, disabled, ariaLabel, type }) => {
    const [hover, setHover] = useState(false);
    const combinedStyle = {
      ...buttonBaseStyle,
      ...style,
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
  });

  const AnimatedSection = React.memo(({ children, style, delay = 0, label }) => (
    <section
      aria-label={label}
      style={{
        ...sectionStyle,
        ...style,
      }}
      tabIndex="0"
    >
      {children}
    </section>
  ));

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

          ::-webkit-scrollbar {
            width: 12px;
          }
          ::-webkit-scrollbar-track {
            background: ${darkMode ? "#4a5568" : "#eceff1"};
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
            color: ${darkMode ? "#90cdf4" : "#01579b"} !important;
          }
          .loading-spinner {
            border: 4px solid ${darkMode ? "#4a5568" : "#eceff1"};
            border-top: 4px solid #4fc3f7;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
      <main style={containerStyle} role="main" ref={scrollContainerRef}>
        {toast && <div style={toastStyle}>{toast.message}</div>}
        <div style={headerSectionStyle}>
          <div style={heroStyle}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <Button onClick={handleToggleDarkMode} ariaLabel="Toggle dark mode">
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </Button>
            </div>
            <h1 style={{ fontSize: "4rem", marginBottom: "15px" }}>
              Hello, {userProfile.username}! Let's Thrive Today {mood}
            </h1>
            <p style={{ fontSize: "1.5rem", marginBottom: "35px" }}>A sanctuary for growth, connection, and lasting well-being.</p>
            <form onSubmit={(e) => { e.preventDefault(); navigate("/search"); }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for inspiration, groups, or tools..."
                style={{ ...inputStyle, maxWidth: "700px", margin: "0 auto 25px", display: "block" }}
                aria-label="Search"
              />
              <Button type="submit" ariaLabel="Search">Find Your Path</Button>
            </form>
          </div>
        </div>
        <div style={contentWrapper}>
          <AnimatedSection label="User Profile" delay={0}>
            <h2 style={sectionTitleStyle}>👤 Your Profile</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <span style={{ fontSize: "2.5rem" }}>{userProfile.avatar}</span>
              <p><strong>{userProfile.username}</strong></p>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
              <input
                type="text"
                defaultValue={userProfile.username}
                name="username"
                placeholder="Update username..."
                style={inputStyle}
                onKeyDown={handleProfileKeyDown}
                aria-label="Update username"
              />
              <input
                type="text"
                defaultValue={userProfile.avatar}
                name="avatar"
                placeholder="Update avatar (emoji)"
                style={inputStyle}
                onKeyDown={handleProfileKeyDown}
                aria-label="Update avatar"
              />
              <Button type="submit" ariaLabel="Update profile">Update</Button>
            </form>
          </AnimatedSection>

          <AnimatedSection label="Wellness Journey" delay={50}>
            <h2 style={sectionTitleStyle}>🌟 Your Wellness Score</h2>
            <p>Track your progress with daily actions for lasting growth.</p>
            <div style={progressBarStyle}>
              <div style={progressFillStyle}></div>
            </div>
            <p style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: "bold" }}>{wellnessScore}/100</p>
            <p>Small steps today lead to big changes tomorrow.</p>
          </AnimatedSection>

          <AnimatedSection label="Notifications" delay={100}>
            <h2 style={sectionTitleStyle}>🔔 Updates</h2>
            {notifications.length === 0 ? (
              <p>You're all caught up! Focus on your journey.</p>
            ) : (
              <>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {notifications.map((notif) => (
                    <li key={notif.id} style={{ marginBottom: "18px", padding: "12px", background: darkMode ? "#4a5568" : "#eceff1", borderRadius: "12px" }}>
                      {notif.message}
                    </li>
                  ))}
                </ul>
                <Button onClick={handleClearNotifications} type="button" style={{ marginTop: "15px" }} ariaLabel="Clear notifications">
                  Clear
                </Button>
              </>
            )}
          </AnimatedSection>

          <AnimatedSection label="Social Media Sharing" delay={150}>
            <h2 style={sectionTitleStyle}>📱 Share Positivity</h2>
            <p>Spread inspiration on X or Instagram with a positive post!</p>
            <form onSubmit={handleSocialPost} style={{ display: "flex", gap: "18px", marginBottom: "25px" }}>
              <input
                type="text"
                value={newSocialPost}
                onChange={(e) => debouncedSetNewSocialPost(e.target.value)}
                onKeyDown={handleSocialPostKeyDown}
                placeholder="Share a positive message... (e.g., #Mindfulness)"
                style={inputStyle}
                aria-label="Share social post"
              />
              <Button type="submit" ariaLabel="Post to X">Post to X</Button>
            </form>
            {socialMediaPosts.length === 0 ? (
              <p>Be the first to share positivity!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {socialMediaPosts.map((post) => (
                  <li key={post.id} style={{ marginBottom: "18px", padding: "12px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "12px" }}>
                    <strong>{post.platform}:</strong> {post.content} by {post.user}
                    <div style={{ marginTop: "10px" }}>
                      <Button
                        onClick={() => handleLikePost(post.id)}
                        type="button"
                        style={{ background: "linear-gradient(135deg, #ff6b6b 0%, #e53e3e 100%)", padding: "8px 16px" }}
                        ariaLabel={`Like post ${post.id}`}
                      >
                        ❤️ {post.likes || 0}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AnimatedSection>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Daily Goals" style={{ flex: 1 }} delay={200}>
              <h2 style={sectionTitleStyle}>🎯 Daily Goals</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {dailyGoals.map((goal, idx) => (
                  <li key={idx} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => handleToggleGoal(idx)}
                      aria-label={`Toggle goal ${goal.goal}`}
                    />
                    {goal.goal}
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddGoal} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => debouncedSetNewGoal(e.target.value)}
                  onKeyDown={handleGoalKeyDown}
                  placeholder="Add a goal for today..."
                  style={inputStyle}
                  aria-label="Add new goal"
                />
                <Button type="submit" ariaLabel="Add goal">Add</Button>
              </form>
              <p style={{ marginTop: "15px", color: darkMode ? "#e2e8f0" : "#37474f" }}>Build habits one day at a time.</p>
            </AnimatedSection>
            <AnimatedSection label="Habit Tracker" style={{ flex: 1 }} delay={250}>
              <h2 style={sectionTitleStyle}>🔄 Habit Tracker</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {habits.map((habit, idx) => (
                  <li key={idx} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="checkbox"
                      checked={habit.completed}
                      onChange={() => handleToggleHabit(idx)}
                      aria-label={`Toggle habit ${habit.name}`}
                    />
                    {habit.name}
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddHabit} style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => debouncedSetNewHabit(e.target.value)}
                  onKeyDown={handleHabitKeyDown}
                  placeholder="Add a new habit..."
                  style={inputStyle}
                  aria-label="Add new habit"
                />
                <Button type="submit" ariaLabel="Add habit">Add</Button>
              </form>
              <p style={{ marginTop: "15px", color: darkMode ? "#e2e8f0" : "#37474f" }}>Consistency is key to growth.</p>
            </AnimatedSection>
          </div>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Breathing Exercise" style={{ flex: 1 }} delay={300}>
              <h2 style={sectionTitleStyle}>🌬️ Breathing Exercise</h2>
              <p>Take a moment to reduce stress with deep breathing.</p>
              {breathingExercise ? (
                <p style={{ fontSize: "1.5rem", textAlign: "center" }}>Inhale... Hold... Exhale...</p>
              ) : (
                <Button onClick={handleStartBreathing} type="button" style={{ width: "100%" }} ariaLabel="Start breathing exercise">
                  Start 1-Min Exercise
                </Button>
              )}
            </AnimatedSection>
            <AnimatedSection label="Daily Journal" style={{ flex: 1 }} delay={350}>
              <h2 style={sectionTitleStyle}>📖 Daily Reflection</h2>
              <form onSubmit={handleJournalSubmit}>
                <textarea
                  value={journalEntry}
                  onChange={(e) => debouncedSetJournalEntry(e.target.value)}
                  onKeyDown={handleJournalKeyDown}
                  placeholder="Reflect on your day... What went well?"
                  style={{ ...inputStyle, height: "120px", resize: "none" }}
                  aria-label="Daily journal entry"
                />
                <Button type="submit" style={{ marginTop: "15px", width: "100%" }} ariaLabel="Save journal entry">
                  Save Entry
                </Button>
              </form>
              <p style={{ marginTop: "15px", color: darkMode ? "#e2e8f0" : "#37474f" }}>Reflecting builds self-awareness.</p>
            </AnimatedSection>
          </div>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Community Stats" style={{ flex: 1 }} delay={400}>
              <h2 style={sectionTitleStyle}>📊 Stats</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "18px" }}>
                <div style={{ textAlign: "center", padding: "18px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "18px" }}>
                  Posts: {stats.posts}
                </div>
                <div style={{ textAlign: "center", padding: "18px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "18px" }}>
                  Groups: {stats.groups}
                </div>
                <div style={{ textAlign: "center", padding: "18px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "18px" }}>
                  Members: {stats.members}
                </div>
                <div style={{ textAlign: "center", padding: "18px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "18px" }}>
                  Active: {stats.activeToday}
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection label="Mood Booster" style={{ flex: 1 }} delay={450}>
              <h2 style={sectionTitleStyle}>😊 Mood Booster</h2>
              <p style={{ fontSize: "2.2rem", textAlign: "center", marginBottom: "25px" }}>{petMood}</p>
              <Button
                onClick={() => {
                  setMood("🤩");
                  navigate("/mood-boost");
                }}
                type="button"
                style={{ width: "100%" }}
                ariaLabel="Instant mood boost"
              >
                Instant Boost
              </Button>
            </AnimatedSection>
          </div>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Inspiration" style={{ flex: 1 }} delay={500}>
              <h2 style={sectionTitleStyle}>✨ Inspiration</h2>
              <blockquote
                style={{
                  fontSize: "1.3rem",
                  fontStyle: "italic",
                  color: darkMode ? "#e2e8f0" : "#263238",
                  padding: "25px",
                  background: darkMode ? "#4a5568" : "#e3f2fd",
                  borderRadius: "18px",
                }}
              >
                “{dailyInspiration}”
              </blockquote>
            </AnimatedSection>
            <AnimatedSection label="Fun Zone" style={{ flex: 1 }} delay={550}>
              <h2 style={sectionTitleStyle}>🎉 Fun Zone</h2>
              <p>
                <strong>Fact:</strong> {funFact}
              </p>
              <p>
                <strong>Challenge:</strong> {challenge}
              </p>
              <p>
                <strong>Quote:</strong> {quotes[Math.floor(Math.random() * quotes.length)]}
              </p>
            </AnimatedSection>
          </div>

          <AnimatedSection label="Chat" delay={600}>
            <h2 style={sectionTitleStyle}>💬 Community Chat</h2>
            <div style={{ maxHeight: "280px", overflowY: "auto", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "18px", padding: "25px", marginBottom: "25px" }}>
              {chatMessages.length === 0 ? (
                <p>Chat to connect and support!</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: "18px" }}>
                    <strong>{msg.user}:</strong> {msg.content}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "18px" }}>
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleChatKeyDown}
                placeholder="Share your thoughts..."
                style={inputStyle}
                aria-label="Chat message"
              />
              <Button disabled={!newMessage.trim()} type="submit" ariaLabel="Send message">
                Send
              </Button>
            </form>
            {isTyping && <p style={{ color: "#4fc3f7", marginTop: "12px" }}>Typing...</p>}
            <Link to="/chat" style={{ ...linkStyle, display: "block", marginTop: "18px" }} aria-label="Go to full chat">
              Full Chat →
            </Link>
          </AnimatedSection>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Posts" style={{ flex: 2 }} delay={650}>
              <h2 style={sectionTitleStyle}>📰 Recent Posts</h2>
              {loadingPosts ? (
                <div className="loading-spinner" aria-label="Loading posts"></div>
              ) : posts.length === 0 ? (
                <p>
                  Create a post to inspire! <Link to="/create" style={linkStyle} aria-label="Create new post">Start Now</Link>
                </p>
              ) : (
                posts.map((p) => (
                  <div key={p._id} style={{ marginBottom: "25px", padding: "18px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "18px" }}>
                    <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>{p.title}</h3>
                    <p style={{ color: darkMode ? "#cbd5e0" : "#78909c" }}>By {p.author?.username}</p>
                    <p>{p.content.slice(0, 120)}...</p>
                    <Button
                      onClick={() => handleDeletePost(p._id)}
                      type="button"
                      style={{ background: "linear-gradient(135deg, #ef5350 0%, #f44336 100%)", marginTop: "12px" }}
                      ariaLabel={`Delete post ${p._id}`}
                    >
                      Delete
                    </Button>
                  </div>
                ))
              )}
              <Link to="/feed" style={{ ...linkStyle, display: "block", marginTop: "18px" }} aria-label="View all posts">
                All Posts →
              </Link>
            </AnimatedSection>
            <AnimatedSection label="Groups" style={{ flex: 1 }} delay={700}>
              <h2 style={sectionTitleStyle}>🤝 Support Groups</h2>
              {groups.length === 0 ? (
                <p>
                  Explore groups for connection. <Link to="/support-groups" style={linkStyle} aria-label="Browse support groups">Browse</Link>
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group._id} style={{ marginBottom: "18px" }}>
                    <strong>{group.name}</strong>
                    <p>{group.description?.slice(0, 100)}...</p>
                  </div>
                ))
              )}
              <Link to="/support-groups" style={{ ...linkStyle, display: "block", marginTop: "18px" }} aria-label="View more groups">
                More Groups →
              </Link>
            </AnimatedSection>
          </div>

          <AnimatedSection label="Events" delay={750}>
            <h2 style={sectionTitleStyle}>🗓️ Upcoming Events</h2>
            {events.length === 0 ? (
              <p>No events yet – suggest one!</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {events.map((event, idx) => (
                  <li key={idx} style={{ marginBottom: "18px", padding: "12px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "12px" }}>
                    <strong>{event.title}</strong> - {event.date}
                  </li>
                ))}
              </ul>
            )}
          </AnimatedSection>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Milestones" style={{ flex: 1 }} delay={800}>
              <h2 style={sectionTitleStyle}>🏆 Your Milestones</h2>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {memberMilestones.map((milestone, idx) => (
                  <li key={idx} style={{ marginBottom: "18px" }}>
                    <span style={{ color: "#4fc3f7" }}>{milestone.achievement}:</span> {milestone.description}
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection label="Creative" style={{ flex: 1 }} delay={850}>
              <h2 style={sectionTitleStyle}>🎨 Creative Prompt</h2>
              <p style={{ fontSize: "1.3rem", marginBottom: "25px" }}>{creativePrompt}</p>
              <Button
                onClick={() => {
                  setCreativePrompt(creativePrompts[Math.floor(Math.random() * creativePrompts.length)]);
                  navigate("/creative-prompt");
                }}
                type="button"
                ariaLabel="Refresh creative prompt"
              >
                Refresh
              </Button>
              <Link to="/create-art" style={{ ...linkStyle, marginLeft: "25px" }} aria-label="Share creative prompt">
                Share →
              </Link>
            </AnimatedSection>
          </div>

          <div style={flexRow} className="flex-row">
            <AnimatedSection label="Gratitude" style={{ flex: 1 }} delay={900}>
              <h2 style={sectionTitleStyle}>🙏 Gratitude Wall</h2>
              {gratitudeWall.map((note, idx) => (
                <div key={idx} style={{ marginBottom: "18px", padding: "12px", background: darkMode ? "#4a5568" : "#e3f2fd", borderRadius: "12px" }}>
                  <strong>{note.user}:</strong> {note.content}
                  <div style={{ marginTop: "10px" }}>
                    <Button
                      onClick={() => handleLikePost(note.id)}
                      type="button"
                      style={{ background: "linear-gradient(135deg, #ff6b6b 0%, #e53e3e 100%)", padding: "8px 16px" }}
                      ariaLabel={`Like gratitude note ${note.id}`}
                    >
                      ❤️ {note.likes || 0}
                    </Button>
                  </div>
                </div>
              ))}
              <form onSubmit={handleGratitudeSubmit} style={{ display: "flex", gap: "18px", marginTop: "25px" }}>
                <input
                  type="text"
                  value={gratitudeNote}
                  onChange={(e) => debouncedSetGratitudeNote(e.target.value)}
                  onKeyDown={handleGratitudeKeyDown}
                  placeholder="What are you grateful for?"
                  style={inputStyle}
                  aria-label="Share gratitude"
                />
                <Button type="submit" ariaLabel="Share gratitude">Share</Button>
              </form>
            </AnimatedSection>
            <AnimatedSection label="Pet" style={{ flex: 1 }} delay={950}>
              <h2 style={sectionTitleStyle}>🐾 Virtual Pet</h2>
              <p style={{ fontSize: "2.8rem", textAlign: "center", marginBottom: "25px" }}>{petMood}</p>
              <Button onClick={handlePetInteraction} type="button" style={{ width: "100%" }} ariaLabel="Interact with pet">
                Interact
              </Button>
              <p style={{ textAlign: "center", marginTop: "12px", color: darkMode ? "#cbd5e0" : "#78909c" }}>A fun way to lift your spirits!</p>
            </AnimatedSection>
          </div>

          <AnimatedSection label="Playlist" delay={1000}>
            <h2 style={sectionTitleStyle}>🎵 Community Playlist</h2>
            {playlistSongs.map((song, idx) => (
              <div key={idx} style={{ marginBottom: "18px" }}>
                <strong>{song.song}</strong> by {song.user}
              </div>
            ))}
            <form onSubmit={handleAddSong} style={{ display: "flex", gap: "18px", marginTop: "25px" }}>
              <input
                type="text"
                name="song"
                onKeyDown={handleSongKeyDown}
                placeholder="Suggest a soothing song..."
                style={inputStyle}
                aria-label="Suggest song"
              />
              <Button type="submit" ariaLabel="Add song to playlist">Add</Button>
            </form>
            <Link to="/playlist" style={{ ...linkStyle, display: "block", marginTop: "18px" }} aria-label="View full playlist">
              Full Playlist →
            </Link>
          </AnimatedSection>

          <AnimatedSection label="Tips" delay={1050}>
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
