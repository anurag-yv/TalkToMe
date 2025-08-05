import React, { useState } from 'react';
// import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const motivationalQuotes = [
  "Every journey begins with a single step.",
  "You matter. Your voice matters.",
  "Here, you are safe and supported."
];

const Signup = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [quote, setQuote] = useState(motivationalQuotes[0]);

  // Change quote every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Signup successful, please log in!');
      } else {
        alert('Signup failed: ' + (data.message || 'Unknown error'));
      }
    } catch {
      alert('Error signing up.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(120deg,#c3e9f7,#f5f3fc 80%)', display: 'flex', flexDirection: 'column' }}>
      {/* <NavBar /> */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        <div style={{
          width: '400px',
          background: '#fff',
          padding: 40,
          borderRadius: 18,
          boxShadow: '0 4px 24px 0 rgba(80,130,200,0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2 style={{ marginBottom: 8, color: '#3B82F6', fontWeight: 800, fontSize: 32 }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: 16, color: '#777', marginBottom: 16, fontStyle: 'italic', minHeight: 22 }}>
            {quote}
          </p>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 16 }}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 16 }}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 16 }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 0',
                background: 'linear-gradient(90deg,#3B82F6 60%,#94A3B8)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                borderRadius: 9,
                boxShadow: '0 2px 8px rgba(80,120,200,0.12)',
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </form>
          <div style={{ marginTop: 20, color: '#757575', fontSize: 15 }}>
            Already have an account? <a href="/login" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Login</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
