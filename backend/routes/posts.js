const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

// Middleware for authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a post (protected route)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const newPost = new Post({
      title,
      content,
      author: req.userId,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
