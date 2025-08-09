import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import SupportGroups from './pages/SupportGroups';
import Chat from './pages/Chat';
import Resources from './pages/Resources';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  // State for login token and username
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(localStorage.getItem('username') || '');

  // Called after successful login; store token and username in state and localStorage
  const handleLogin = (token, username) => {
    setToken(token);
    setUser(username);
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  };

  // Called on logout; clear state and localStorage
  const handleLogout = () => {
    setToken('');
    setUser('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      {/* NavBar receives user and logout handler to render conditionally */}
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected routes: redirect to /login if no token */}
        <Route path="/feed" element={token ? <HomeFeed /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/create" element={token ? <CreatePost token={token} /> : <Navigate to="/login" />} />
        <Route path="/support-groups" element={token ? <SupportGroups /> : <Navigate to="/login" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={token ? <Dashboard user={user} /> : <Navigate to="/login" />} />
       

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
