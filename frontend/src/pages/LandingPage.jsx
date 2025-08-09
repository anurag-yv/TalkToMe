import React, { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";

const taglines = [
  "Connect. Share. Grow.",
  "Talk. Listen. Belong.",
  "A safe space to meet new voices."
];

const quotes = [
  '"Every conversation starts with hello."',
  '"Sometimes, a simple chat can change everything."',
  '"You’re one hello away from something new."',
];

const LandingPage = () => {
  const [tagline, setTagline] = useState(taglines[0]);
  const [quote, setQuote] = useState(quotes[0]);
  const [fade, setFade] = useState(true);

  // Rotate tagline/quote
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        setFade(true);
      }, 450);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background:
          "linear-gradient(110deg, #ece9f7 0%, #e0f7fa 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 20px",
          maxWidth: "520px",
          margin: "auto",
        }}
      >
        <h1
          style={{
            fontSize: 44,
            fontWeight: 800,
            color: "#344055",
            marginBottom: 10,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          Welcome to Talk
        </h1>

        <h2
          style={{
            color: "#5855a5",
            fontSize: 22,
            marginBottom: 14,
            opacity: fade ? 1 : 0,
            transition: "opacity .45s",
            textAlign: "center",
            fontWeight: 500,
          }}
        >
          {tagline}
        </h2>

        <div
          style={{
            padding: "12px 18px",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(100,100,140,0.08)",
            maxWidth: 380,
            marginBottom: 28,
            fontSize: 16,
            color: "#444",
            fontStyle: "italic",
            textAlign: "center",
            opacity: fade ? 1 : 0,
            transition: "opacity .45s",
          }}
        >
          {quote}
        </div>

        {/* Optional doodle pad or visual */}
        <div style={{
          marginBottom: 18,
          textAlign: "center",
          color: "#999",
          fontSize: 15,
        }}>
          <span>Welcome, guest! To take part, simply <b>sign up</b> or <b>log in</b> below.</span>
        </div>

        <div style={{
          display: "flex",
          gap: 18,
          marginTop: 18,
          flexWrap: "wrap",
        }}>
          <a
            href="/signup"
            style={{
              background: "linear-gradient(90deg,#6c77f9,#6cd7c7)",
              color: "#fff",
              padding: "13px 34px",
              borderRadius: 35,
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: 1,
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              textDecoration: "none",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.target.style.transform = "scale(1)")}
          >
            Join Now
          </a>
          <a
            href="/login"
            style={{
              background: "#fff",
              color: "#5855a5",
              border: "2px solid #a7b0f5",
              padding: "13px 34px",
              borderRadius: 35,
              fontWeight: 700,
              fontSize: 18,
              boxShadow: "0 2px 10px rgba(100,130,160,0.05)",
              textDecoration: "none",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.target.style.transform = "scale(1)")}
          >
            Log In
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
