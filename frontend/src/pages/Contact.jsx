import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Contact = () => (
  <div>
    <NavBar />
    <main style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <h1 style={{ color: '#3B82F6', fontWeight: 'bold', marginBottom: 8 }}>Contact Us</h1>
      <p style={{ fontSize: 18, textAlign: 'center', maxWidth: 600, color: '#444' }}>
        Need to get in touch? Have feedback, questions, or want to partner with us? <br />
        Email us anytime at:
        <br />
        <a href="mailto:support@talkplatform.com" style={{ color: '#3B82F6', fontWeight: 600 }}>
          support@talkplatform.com
        </a>
        <br /><br />
        We aim to respond within 2 business days.<br />
        Your voice matters and we’re here to help.
      </p>
    </main>
    <Footer />
  </div>
);

export default Contact;
