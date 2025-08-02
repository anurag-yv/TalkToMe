import React, { useEffect, useState } from 'react';

const SupportGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(() => setGroups([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Support Groups</h2>
      {groups.length === 0 && <p>No groups found.</p>}
      {groups.map(group => (
        <div key={group._id} style={{ border: '1px solid green', margin: 6, padding: 6 }}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </div>
      ))}
    </div>
  );
};

export default SupportGroups;
