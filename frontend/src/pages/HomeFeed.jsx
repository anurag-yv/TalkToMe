import React, { useEffect, useState } from 'react';

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Failed to fetch posts', err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', padding: '2vw' }}>
      <h2>Community Feed</h2>
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map(post => (
        <div key={post._id} style={{ border: '1px solid gray', padding: 10, marginBottom: 10 }}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>By {post.author?.username || 'Unknown'}</small>
        </div>
      ))}
    </div>
  );
};

export default HomeFeed;
