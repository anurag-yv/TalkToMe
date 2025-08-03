import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    textAlign: 'center',
    padding: '30px 10px 20px 10px',
    color: '#666',
    background: '#f7f9fa',
    borderTop: '1px solid #ececec',
    marginTop: '60px'
  }}>
    <div style={{ marginBottom: 10 }}>
      <Link to="/about" style={{ margin: '0 15px', color: '#3B82F6', textDecoration: 'none' }}>About</Link>
      <Link to="/contact" style={{ margin: '0 15px', color: '#3B82F6', textDecoration: 'none' }}>Contact</Link>
      <Link to="/resources" style={{ margin: '0 15px', color: '#3B82F6', textDecoration: 'none' }}>Resources</Link>
    </div>
    <div style={{ fontSize: 14 }}>
      &copy; {new Date().getFullYear()} Talk – A Supportive Platform For All
    </div>
  </footer>
);

export default Footer;
