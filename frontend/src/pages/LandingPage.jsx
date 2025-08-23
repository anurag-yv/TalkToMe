import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";

const taglines = [
  "Find voices that feel like home.",
  "Conversations that light up the dark.",
  "You’re never really alone here.",
];

const quotes = [
  '"Every hello plants a seed of connection."',
  '"Loneliness fades when stories are shared."',
  '"Strangers today, companions tomorrow."',
];

const LandingPage = () => {
  const [tagline, setTagline] = useState(taglines[0]);
  const [quote, setQuote] = useState(quotes[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        setFade(true);
      }, 450);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: "100vh", // lock viewport height
        width: "100vw",
        background:
          "linear-gradient(120deg, #a1c4fd, #c2e9fb, #fbc2eb, #a6c0fe)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 18s ease infinite",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // ✅ keeps footer at bottom
        alignItems: "center",
        overflow: "hidden", // ✅ no scroll
      }}
    >
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floaty {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
        `}
      </style>

      {/* Floating blobs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "8%",
          width: 120,
          height: 120,
          background: "rgba(255,255,255,0.25)",
          borderRadius: "50%",
          filter: "blur(20px)",
          animation: "floaty 9s ease-in-out infinite",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "12%",
          width: 180,
          height: 130,
          background: "rgba(255,255,255,0.18)",
          borderRadius: "50%",
          filter: "blur(30px)",
          animation: "floaty 11s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
          maxWidth: "90%", // responsive
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: 12,
            textShadow: "0px 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          Welcome to Solar
        </h1>

        <h2
          style={{
            color: "#fff",
            fontSize: "clamp(1rem, 3vw, 1.5rem)",
            marginBottom: 14,
            opacity: fade ? 1 : 0,
            transform: fade ? "scale(1)" : "scale(0.95)",
            transition: "all .45s ease",
            fontWeight: 500,
            textShadow: "0px 2px 10px rgba(0,0,0,0.25)",
          }}
        >
          {tagline}
        </h2>

        <div
          style={{
            padding: "12px 18px",
            background: "rgba(255,255,255,0.9)",
            borderRadius: 14,
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            maxWidth: 380,
            marginBottom: 20,
            fontSize: "clamp(0.85rem, 2vw, 1rem)",
            color: "#444",
            fontStyle: "italic",
            opacity: fade ? 1 : 0,
            transform: fade ? "translateY(0)" : "translateY(15px)",
            transition: "all .45s ease",
          }}
        >
          {quote}
        </div>

        <p
          style={{
            marginBottom: 18,
            color: "#fff",
            fontSize: "clamp(0.8rem, 2vw, 1rem)",
            textShadow: "0px 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          Join conversations, make friends, and share stories — you belong here.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="/signup"
            style={{
              background: "linear-gradient(90deg,#6c77f9,#6cd7c7)",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 30,
              fontWeight: 700,
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              letterSpacing: 1,
              boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
              textDecoration: "none",
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Join Now
          </a>
          <a
            href="/login"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "#5855a5",
              border: "2px solid #a7b0f5",
              padding: "12px 28px",
              borderRadius: 30,
              fontWeight: 700,
              fontSize: "clamp(0.9rem, 2vw, 1rem)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              textDecoration: "none",
              transition: "transform 0.25s ease",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Log In
          </a>
        </div>
      </main>

      {/* Footer fixed at bottom without causing scroll */}
      <div style={{ flexShrink: 0, width: "100%" }}>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
