import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => (
  <nav style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    boxSizing: 'border-box',
    background: '#f7f9fa',
    borderBottom: '1px solid #ececec'
  }}>
    <div style={{ fontWeight: 700, fontSize: 22, color: '#3B82F6' }}>
      Talk
    </div>
    <div>
      <Link to="/login" style={{ margin: '0 12px', textDecoration: 'none', color: '#111', fontWeight: 500 }}>
        Login
      </Link>
      <Link to="/signup" style={{
        background: '#3B82F6', color: '#fff', padding: '6px 18px', borderRadius: '20px',
        textDecoration: 'none', fontWeight: 600
      }}>
        Sign Up
      </Link>
    </div>
  </nav>
);

export default NavBar;
