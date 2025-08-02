import React, { useState } from 'react';

const Signup = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert('Signup successful, please log in!');
      } else {
        alert('Signup failed.');
      }
    } catch {
      alert('Error signing up.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Sign Up</h2>
      <input name="username" placeholder="Username" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
