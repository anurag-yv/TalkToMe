import React from 'react';

const resources = [
  { name: 'National Suicide Prevention Lifeline', url: 'https://suicidepreventionlifeline.org', desc: '24/7 confidential support.' },
  { name: 'Mental Health America', url: 'https://mhanational.org', desc: 'Mental health resources.' },
  // Add more as needed
];

const Resources = () => (
  <div style={{ padding: 20 }}>
    <h2>Helpful Resources</h2>
    <ul>
      {resources.map(r => (
        <li key={r.url}>
          <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>: {r.desc}
        </li>
      ))}
    </ul>
  </div>
);

export default Resources;
