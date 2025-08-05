import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const moods = ['😊', '😌', '😢', '🥳', '🤗', '😴', '😇'];
  const dailyMood = useMemo(() => moods[Math.floor(Math.random() * moods.length)], []);

  useEffect(() => {
    async function fetchData() {
      try {
        const postsRes = await fetch('/api/posts');
        const postsData = await postsRes.json();
        setPosts(postsData.slice(0, 3));
        setLoadingPosts(false);

        const groupsRes = await fetch('/api/groups');
        const groupsData = await groupsRes.json();
        setGroups(groupsData.slice(0, 4));
        setLoadingGroups(false);
      } catch {
        setLoadingPosts(false);
        setLoadingGroups(false);
      }
    }
    fetchData();
  }, []);

  const containerStyle = {
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#1e293b',
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '26px',
    width: '100%',
  };

  const cardStyle = {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    padding: '20px',
    borderRadius: '20px',
    boxShadow: '0 8px 16px rgba(250, 204, 21, 0.3)',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const titleStyle = {
    color: '#b45309',
    marginBottom: '12px',
    fontSize: '1.4rem',
    fontWeight: 700,
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #fed7aa 0%, #fb923c 100%)',
    padding: '12px 32px',
    borderRadius: '30px',
    color: '#92400e',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 15px 2px rgba(251, 146, 60, 0.12)',
    userSelect: 'none',
    border: 'none',
    fontSize: '1rem',
    margin: '4px 0',
    display: 'inline-block',
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        minHeight: '100vh',
        paddingTop: '30px',
        paddingBottom: '30px',
        width: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <div style={containerStyle}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: 8, textAlign: 'center', color: '#b45309' }}>
          Welcome back, {user}! {dailyMood}
        </h1>
        <p style={{ textAlign: 'center', marginBottom: 36, fontSize: '1.19rem', color: '#8b5cf6', fontWeight: 500 }}>
          Feel the warmth of community and growth as you navigate your journey.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: 35 }}>
          {[['Create Post', '/create'], ['Join Group', '/support-groups'], ['Chat Now', '/chat'], ['Resources', '/resources']].map(([label, to]) => (
            <Link key={label} to={to} style={buttonStyle}>
              {label}
            </Link>
          ))}
        </div>

        <div style={gridStyle}>
          {/* Posts Card */}
          <section style={cardStyle}>
            <div>
              <h2 style={titleStyle}>Recent Posts</h2>
              {loadingPosts ? (
                <p>Loading posts...</p>
              ) : posts.length === 0 ? (
                <p>
                  No posts yet. <Link to="/create">Create your first post</Link>
                </p>
              ) : (
                posts.map(post => (
                  <div
                    key={post._id}
                    style={{
                      marginBottom: 20,
                      padding: 12,
                      background: '#fffbee',
                      borderRadius: 16,
                      boxShadow: '0 4px 8px rgba(202,138,4,0.15)',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', color: '#b45309' }}>{post.title}</h3>
                    <p style={{ color: '#92400e', marginBottom: 2 }}>{post.content.slice(0, 120)}...</p>
                    <small style={{ color: '#92400e' }}>By {post.author?.username || 'Unknown'}</small>
                  </div>
                ))
              )}
            </div>
            <Link to="/feed" style={{ color: '#b45309', fontWeight: '600', textDecoration: 'underline', alignSelf: 'flex-end' }}>
              View All Posts →
            </Link>
          </section>

          {/* Groups Card */}
          <section style={cardStyle}>
            <div>
              <h2 style={titleStyle}>Support Groups</h2>
              {loadingGroups ? (
                <p>Loading groups...</p>
              ) : groups.length === 0 ? (
                <p>
                  No groups yet. <Link to="/support-groups">Browse groups</Link>
                </p>
              ) : (
                groups.map(group => (
                  <div
                    key={group._id}
                    style={{
                      marginBottom: 20,
                      padding: 12,
                      background: '#fffbee',
                      borderRadius: 16,
                      boxShadow: '0 4px 8px rgba(202,138,4,0.11)',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', color: '#b45309' }}>{group.name}</h3>
                    <p style={{ color: '#92400e', marginBottom: 2 }}>{group.description.slice(0, 100)}...</p>
                  </div>
                ))
              )}
            </div>
            <Link to="/support-groups" style={{ color: '#b45309', fontWeight: '600', textDecoration: 'underline', alignSelf: 'flex-end' }}>
              Browse More Groups →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
