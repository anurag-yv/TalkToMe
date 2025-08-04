import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.slice(0, 3));
        setLoadingPosts(false);
      })
      .catch(() => setLoadingPosts(false));

    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data.slice(0, 4));
        setLoadingGroups(false);
      })
      .catch(() => setLoadingGroups(false));
  }, []);

  return (
    <div style={{
      padding: '20px',
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h1 style={{ color: '#2563eb', fontWeight: 'bold', marginBottom: 20, width: '100%', textAlign: 'center' }}>
        Welcome back, {user}!
      </h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        justifyContent: 'center',
        width: '100%',
        maxWidth: '1400px'
      }}>
        {/* Quick Stats */}
        <div style={{
          flex: '1 1 200px',
          background: '#e0f2fe',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
          minWidth: 200,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#0284c7' }}>Posts Created</h3>
          <p style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{posts.length}</p>
        </div>
        <div style={{
          flex: '1 1 200px',
          background: '#e0f2fe',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(59,130,246,0.15)',
          minWidth: 200,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#0284c7' }}>Support Groups</h3>
          <p style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{groups.length}</p>
        </div>
      </div>

      {/* Recent Posts */}
      <section style={{ marginTop: 40, width: '100%', maxWidth: '1400px' }}>
        <h2 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: 6, color: '#1e3a8a' }}>Recent Posts</h2>
        {loadingPosts ? (
          <p>Loading posts...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet. <Link to="/create" style={{ color: '#3b82f6' }}>Create a post?</Link></p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, marginTop: 20 }}>
            {posts.map(post => (
              <div key={post._id} style={{
                backgroundColor: '#dbeafe',
                borderRadius: 10,
                padding: 15,
                boxShadow: '0 2px 8px rgba(41,121,255,0.2)'
              }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#2563eb' }}>{post.title}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{post.content.slice(0, 120)}...</p>
                <small style={{ color: '#475569' }}>By {post.author?.username || 'Unknown'}</small>
              </div>
            ))}
          </div>
        )}
        <Link to="/feed" style={{ marginTop: 15, display: 'inline-block', color: '#3b82f6', fontWeight: 600 }}>
          View All Posts &rarr;
        </Link>
      </section>

      {/* Support Groups */}
      <section style={{ marginTop: 40, width: '100%', maxWidth: '1400px' }}>
        <h2 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: 6, color: '#1e3a8a' }}>Your Support Groups</h2>
        {loadingGroups ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 ? (
          <p>You haven’t joined any groups yet. <Link to="/support-groups" style={{ color: '#3b82f6' }}>Browse groups</Link></p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
            gap: 20,
            marginTop: 16
          }}>
            {groups.map(group => (
              <div key={group._id} style={{
                backgroundColor: '#bfdbfe',
                padding: 16,
                borderRadius: 12,
                boxShadow: '0 1px 8px rgba(41,121,255,0.25)',
                minHeight: 130
              }}>
                <h4 style={{ marginTop: 0, color: '#1e40af' }}>{group.name}</h4>
                <p style={{ color: '#374151' }}>{group.description.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}
        <Link to="/support-groups" style={{ marginTop: 12, display: 'inline-block', color: '#3b82f6', fontWeight: 600 }}>
          Browse More Groups &rarr;
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;
