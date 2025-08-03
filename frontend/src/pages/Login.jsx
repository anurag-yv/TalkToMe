import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin && onLogin(data.token);
        window.location.href = '/feed';
      } else {
        setErrorMsg(data.message || 'Login failed.');
      }
    } catch {
      setErrorMsg('Unexpected error—please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(120deg,#f5f3fc,#c3e9f7 80%)', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
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
            Sign In
          </h2>
          <p style={{ fontSize: 16, color: '#7C3AED', marginBottom: 16 }}>
            Welcome back! Your story continues here.
          </p>
          {errorMsg && <div style={{ color: '#C0392B', marginBottom: 10 }}>{errorMsg}</div>}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 16 }}
            />
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={show ? 'text' : 'password'}
                placeholder="Password"
                onChange={handleChange}
                required
                style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #cfd8dc', fontSize: 16 }}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 13,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#3B82F6',
                  fontSize: 14
                }}
                onClick={() => setShow(!show)}
              >
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px 0',
                background: 'linear-gradient(90deg,#3B82F6 70%,#94A3B8)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 18,
                border: 'none',
                borderRadius: 9,
                boxShadow: '0 2px 8px rgba(140,110,220,0.13)',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
          <div style={{ marginTop: 20, color: '#757575', fontSize: 15 }}>
            Don&apos;t have an account? <a href="/signup" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Sign Up</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
