import React, { useEffect, useState } from 'react';

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading posts...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Community Feed</h2>
      {posts.length === 0 ? (
        <p>No posts available yet.</p>
      ) : (
        posts.map(post => (
          <div key={post._id} style={{ border: '1px solid #ccc', marginBottom: 15, padding: 15, borderRadius: 8 }}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>By: {post.author?.username || 'Unknown'}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default HomeFeed;
