import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const About = () => (
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
      <h1 style={{ color: '#3B82F6', fontWeight: 'bold', marginBottom: 8 }}>About Talk</h1>
      <p style={{ fontSize: 18, textAlign: 'center', maxWidth: 600, color: '#444' }}>
        <b>Talk</b> is an online platform dedicated to offering support, encouragement,
        and community for anyone feeling lonely or struggling with depression or anxiety.
        Our mission is to create a safe, welcoming space for open discussion,
        friendship, sharing stories, and finding mental health resources.
        <br /><br />
        Whether you need someone to listen, wish to participate in support groups,
        or want to access helpful contacts, <b>Talk</b> is here for you.
      </p>
    </main>
    <Footer />
  </div>
);

export default About;
