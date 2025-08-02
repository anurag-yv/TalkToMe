import React, { useState } from 'react';

const CreatePost = ({ token }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        alert('Post created!');
        setTitle('');
        setContent('');
      } else {
        alert('Failed to create post');
      }
    } catch {
      alert('Error creating post');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Create Post</h2>
      <input value={title} placeholder="Title" onChange={e => setTitle(e.target.value)} required />
      <textarea value={content} placeholder="Content" onChange={e => setContent(e.target.value)} required />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreatePost;
