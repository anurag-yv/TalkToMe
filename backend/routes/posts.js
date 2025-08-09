const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // Make sure token signed with { userId: ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Helper function to emit updated stats
async function emitUpdatedStats(io) {
  try {
    const postCount = await Post.countDocuments();
    const groupCount = await Group.countDocuments();
    const memberCount = await User.countDocuments();
    const activeTodayCount = await User.countDocuments({
      lastActive: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    console.log("Emitting statsUpdate", { posts: postCount, groups: groupCount, members: memberCount, activeToday: activeTodayCount });
    io.emit("statsUpdate", {
      posts: postCount,
      groups: groupCount,
      members: memberCount,
      activeToday: activeTodayCount
    });
  } catch (err) {
    console.error("Error emitting updated stats:", err);
  }
}

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a new post (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const newPost = new Post({
      title,
      content,
      author: req.userId,
    });
    await newPost.save();

    // Emit live stats update after creation
    if (req.io) await emitUpdatedStats(req.io);

    res.status(201).json(await newPost.populate('author', 'username'));
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE a post (protected)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    res.json(await post.populate('author', 'username'));
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a post (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });

    // Emit live stats update after deletion
    if (req.io) await emitUpdatedStats(req.io);

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
