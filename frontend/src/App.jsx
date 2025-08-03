import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import HomeFeed from './pages/HomeFeed';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import SupportGroups from './pages/SupportGroups';
import Chat from './pages/Chat';
import Resources from './pages/Resources';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Contact from './pages/Contact';
function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={token ? <HomeFeed /> : <Navigate to="/login" />} />
        <Route path="/profile/:id" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/create" element={token ? <CreatePost token={token} /> : <Navigate to="/login" />} />
        <Route path="/support-groups" element={token ? <SupportGroups /> : <Navigate to="/login" />} />
        <Route path="/chat" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
