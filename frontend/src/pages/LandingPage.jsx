import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => (
  <div style={{ padding: 20 }}>
    <h1>Welcome to the Support Platform</h1>
    <p>A safe community for those feeling lonely or struggling with depression.</p>
    <Link to="/signup">Get Started</Link> | <Link to="/login">Login</Link>
  </div>
);

export default LandingPage;
