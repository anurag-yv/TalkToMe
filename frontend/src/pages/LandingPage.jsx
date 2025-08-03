import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

// Example dynamic content
const taglines = [
  "Connecting Hearts, Changing Lives.",
  "You're Never Alone at Talk.",
  "A Safe Place to Share and Support."
];

const quotes = [
  "“You are stronger than you think.”",
  "“It’s okay to ask for help.”",
  "“Every story matters, including yours.”"
];

const LandingPage = () => {
  const [tagline, setTagline] = useState(taglines[0]);
  const [quote, setQuote] = useState(quotes[0]);

  useEffect(() => {
    // Change tagline and quote every 5 seconds
    const interval = setInterval(() => {
      setTagline(taglines[Math.floor(Math.random() * taglines.length)]);
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f2f7fb', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{
        flex: 1,
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: '#3B82F6', marginBottom: 8, width: '100%', textAlign: 'center' }}>
          Welcome to Talk
        </h1>
        <h2 style={{
          color: '#333',
          fontSize: 32,
          textAlign: 'center',
          marginBottom: 16,
          transition: 'all 0.5s'
        }}>
          {tagline}
        </h2>
        <span style={{
          fontSize: 20, color: '#666', fontStyle: 'italic', marginBottom: 25,
          display: 'block', textAlign: 'center', minHeight: 32
        }}>
          {quote}
        </span>
        <a href="/signup" style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg,#3B82F6 50%,#64748B 100%)',
          color: '#fff',
          padding: '16px 38px',
          borderRadius: 60,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1,
          boxShadow: '0 2px 8px rgba(80,120,200,0.15)',
          textDecoration: 'none',
          marginTop: 18
        }}>
          Join the Community
        </a>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
