import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Failed to load profile', err));
  }, [id]);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{profile.username}'s Profile</h2>
      <p>Email: {profile.email}</p>
      <p>Bio: {profile.bio || 'No bio set'}</p>
    </div>
  );
};

export default Profile;
