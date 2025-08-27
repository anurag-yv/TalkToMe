import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

// Feature cards content
const features = [
  {
    icon: "🪐",
    title: "Meet Interesting People",
    desc: "Join vibrant conversations and make meaningful connections instantly.",
  },
  {
    icon: "⚡",
    title: "Fast & Secure Chat",
    desc: "Real-time chat, encrypted & blazing fast. Feel safe, talk freely.",
  },
  {
    icon: "🏆",
    title: "Earn Badges",
    desc: "Increase engagement and earn badges as you build your profile!",
  },
  {
    icon: "👾",
    title: "Fun Events",
    desc: "Participate in community events, games and quizzes every week.",
  },
];

// Playful avatars
const avatarList = [
  { src: "https://randomuser.me/api/portraits/men/32.jpg", name: "Arjun" },
  { src: "https://randomuser.me/api/portraits/women/45.jpg", name: "Priya" },
  { src: "https://randomuser.me/api/portraits/men/11.jpg", name: "Samar" },
  { src: "https://randomuser.me/api/portraits/women/42.jpg", name: "Aisha" },
];

// New creative community challenge prompts
const communityChallenges = [
  "Challenge of the week: Share a photo of your favorite local spot!",
  "Can you introduce yourself using three emojis? Give it a try!",
  "Post a short story about your proudest moment!",
  "Share a quote that resonates with your life today!",
  "Create a quick doodle of something that makes you happy!",
  "Describe a dream for your community in one sentence.",
];

const LandingPage = () => {
  const [idx, setIdx] = useState(0);
  const [bgShift, setBgShift] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [response, setResponse] = useState("");

  // Navbar/carousel animation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % features.length);
      setBgShift((s) => !s);
      setChallengeIdx((c) => (c + 1) % communityChallenges.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Handle user answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() === "") {
      setResponse("Feel free to participate when you’re ready!");
      return;
    }
    setResponse(
      `Thanks for sharing! Your input: "${answer.trim()}" helps build our community ❤️`
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        background: bgShift
          ? "linear-gradient(120deg,#ffebd3,#b7e9fa,#fbc2eb,#c1c1c1)"
          : "linear-gradient(120deg,#fbc2eb,#a1c4fd,#a7e4ff,#f6ffd3)",
        transition: "background .7s",
        fontFamily: "Sora, Inter, Arial, sans-serif",
      }}
    >
      {/* Parallax blobs */}
      <svg
        width="330"
        height="300"
        style={{
          position: "absolute",
          top: bgShift ? "7%" : "14%",
          left: bgShift ? "7%" : "16%",
          opacity: 0.42,
          zIndex: 0,
          transition: "all 1.2s",
        }}
      >
        <ellipse cx="150" cy="140" rx="130" ry="120" fill="#fff1e1" />
      </svg>
      <svg
        width="270"
        height="220"
        style={{
          position: "absolute",
          top: bgShift ? "71%" : "66%",
          left: bgShift ? "75%" : "73%",
          opacity: 0.18,
          zIndex: 0,
          transition: "all 1.2s",
        }}
      >
        <ellipse cx="140" cy="105" rx="110" ry="100" fill="#e1f8ff" />
      </svg>

      {/* Main Content */}
      <main
        style={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
          position: "relative",
          width: "100%",
          textAlign: "center",
          padding: "0 12px",
        }}
      >
        {/* Hero Section */}
        <section style={{ marginTop: 50, marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "clamp(2rem,7vw,4rem)",
              fontWeight: 900,
              letterSpacing: 1.1,
              color: "#4152db",
              textShadow: "1px 1px 7px #fffbe966",
            }}
          >
            Solar: Where Stories Shine
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem,2vw,1.25rem)",
              color: "#3d3d3d",
              marginTop: 12,
              marginBottom: 22,
            }}
          >
            Not just a chat. Discover, play & connect. <br />
            <span style={{ color: "#ff6fb5", fontWeight: 600 }}>
              Find companions, join playful debates, & make friends for a lifetime.
            </span>
          </p>
          <div
            style={{
              display: "flex",
              gap: 22,
              justifyContent: "center",
              marginTop: 14,
              marginBottom: 28,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/signup"
              style={{
                background: "linear-gradient(90deg,#6c77f9,#ff7ba9)",
                color: "#fff",
                padding: "15px 38px",
                borderRadius: "38px",
                fontWeight: 700,
                fontSize: "1.15rem",
                boxShadow: "0 3px 16px #ff7ba933",
                textDecoration: "none",
                transition: "transform .2s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Get Started
            </a>
            <a
              href="/explore"
              style={{
                background: "#fff",
                color: "#5855a5",
                border: "2px solid #a7b0f5",
                padding: "15px 38px",
                borderRadius: "38px",
                fontWeight: 700,
                fontSize: "1.15rem",
                boxShadow: "0 2px 10px #6c77f922",
                textDecoration: "none",
                transition: "transform .22s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              Explore
            </a>
          </div>
        </section>

        {/* Feature Carousel */}
        <section
          style={{
            width: "100%",
            maxWidth: "460px",
            margin: "14px auto 30px auto",
            padding: "0 10px",
            userSelect: "none",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              boxShadow: "0 5px 24px #76dafe30",
              padding: "32px 18px",
              minHeight: "180px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              transition: "box-shadow .33s",
              cursor: "pointer",
            }}
            onClick={() => setIdx((i) => (i + 1) % features.length)}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: 10,
                filter: "drop-shadow(0 2px 11px #ff7ba9cc)",
              }}
            >
              {features[idx].icon}
            </div>
            <div
              style={{ fontWeight: 700, fontSize: "1.29rem", color: "#4152db" }}
            >
              {features[idx].title}
            </div>
            <div style={{ fontSize: "1.03rem", color: "#3e3b44" }}>
              {features[idx].desc}
            </div>
            <div
              style={{
                color: "#ff7ba9",
                marginTop: 10,
                fontSize: ".92rem",
                fontStyle: "italic",
              }}
            >
              Tap for next feature
            </div>
          </div>
        </section>

        {/* Avatars */}
        <section
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            alignItems: "center",
            margin: "22px auto 18px auto",
            flexWrap: "wrap",
          }}
        >
          {avatarList.map((avt, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: ".15s",
              }}
            >
              <img
                src={avt.src}
                alt={avt.name}
                style={{
                  width: 61,
                  height: 61,
                  borderRadius: "50%",
                  boxShadow: "0 2px 16px #6cd7c799",
                  border: "2.7px solid #ff7ba9",
                }}
              />
              <span
                style={{
                  marginTop: 4,
                  fontWeight: "500",
                  fontSize: "0.97rem",
                  color: "#5156a7",
                }}
              >
                {avt.name}
              </span>
            </div>
          ))}
        </section>

        {/* Creative Community Challenge Section */}
        <section
          style={{
            background: "#fffcfe",
            margin: "26px auto 18px auto",
            borderRadius: 18,
            maxWidth: "440px",
            boxShadow: "0 3px 22px #7be8c966",
            padding: "26px 22px",
            fontSize: "1.1rem",
            color: "#555",
            fontWeight: "600",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ marginBottom: 14, color: "#4152db" }}>
            Community Challenge
          </div>
          <div
            key={challengeIdx}
            style={{
              flex: 1,
              fontStyle: "italic",
              color: "#6c63ff",
              userSelect: "none",
            }}
          >
            {communityChallenges[challengeIdx]}
          </div>
          <form
            onSubmit={handleSubmit}
            style={{ marginTop: 20, display: "flex", gap: "8px" }}
          >
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Join the challenge by sharing..."
              style={{
                flexGrow: 1,
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1.5px solid #a7b0f5",
                fontSize: "1rem",
                boxShadow: "0 2px 8px #4152db22",
              }}
            />
            <button
              type="submit"
              style={{
                background: "linear-gradient(90deg,#6c77f9,#ff7ba9)",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 3px 12px #ff7ba933",
              }}
            >
              Send
            </button>
          </form>

          {response && (
            <div
              style={{
                marginTop: 14,
                color: "#299c6a",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {response}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          background: "#4152db",
          color: "#fff",
          marginTop: 42,
          padding: "38px 0 12px 0",
          boxShadow: "0 -2px 24px #5f77ff22",
        }}
      >
        <div
          style={{
            maxWidth: "730px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 60,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: "1.34rem" }}>Solar</div>
            <div
              style={{
                opacity: 0.88,
                marginTop: 6,
                fontSize: "1.05rem",
                maxWidth: "260px",
              }}
            >
              Find your voice, shape your story.
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 22,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <a
              href="mailto:info@solarapp.com"
              style={{ color: "#ffd5ef", textDecoration: "none", fontWeight: 600 }}
            >
              Contact
            </a>
            <a
              href="https://instagram.com"
              style={{ color: "#ffc36b", fontWeight: 600 }}
            >
              Instagram
            </a>
            <a href="https://twitter.com" style={{ color: "#6cd7c7", fontWeight: 600 }}>
              Twitter
            </a>
            <a href="https://github.com" style={{ color: "#ec7ff7", fontWeight: 600 }}>
              GitHub
            </a>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 14, opacity: 0.73 }}>
          © 2025 Solar Chat Platform. Powered by MERN stack.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
