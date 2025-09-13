const express = require('express');
const router = express.Router();
const Vibe = require('../models/Vibe');
const Progress = require('../models/Progress');
const TimeSpent = require('../models/TimeSpent');
const Resource = require('../models/Resource');

// GET /api/vibes - Fetch all vibes
router.get('/vibes', async (req, res) => {
  try {
    const vibes = await Vibe.find({}).sort({ createdAt: -1 });
    res.json(vibes);
  } catch (err) {
    console.error('Error fetching vibes:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/progress - Save or update user progress
router.post('/progress', async (req, res) => {
  try {
    const { username, progress } = req.body;
    if (!username || !progress) {
      return res.status(400).json({ success: false, error: 'Username and progress are required' });
    }
    await Progress.findOneAndUpdate(
      { username },
      { progress, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/progress - Fetch progress for all users
router.get('/progress', async (req, res) => {
  try {
    const progress = await Progress.find({});
    res.json(progress);
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/time - Save or update time spent
router.post('/time', async (req, res) => {
  try {
    const { username, timeSpent } = req.body;
    if (!username || typeof timeSpent !== 'number') {
      return res.status(400).json({ success: false, error: 'Username and timeSpent are required' });
    }
    const existing = await TimeSpent.findOne({ username });
    const newTime = (existing?.timeSpent || 0) + timeSpent;
    await TimeSpent.findOneAndUpdate(
      { username },
      { timeSpent: newTime, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving time:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/time - Fetch time spent for all users
router.get('/time', async (req, res) => {
  try {
    const timeData = await TimeSpent.find({});
    res.json(timeData);
  } catch (err) {
    console.error('Error fetching time:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/resources - Fetch dynamic resources
router.get('/resources', async (req, res) => {
  try {
    // Fetch from MongoDB or fallback to static
    let resources = await Resource.find({}).limit(5);
    if (resources.length === 0) {
      resources = [
        { title: "Mindful Breathing Exercise", url: "https://www.youtube.com/watch?v=some-video", description: "A quick 5-min guide to calm your mind." },
        { title: "Daily Journal Prompt", url: "https://example.com/journal", description: "Reflect on your growth today." },
        { title: "Learn JavaScript Basics", url: "https://www.freecodecamp.org/learn/javascript", description: "Boost your coding skills!" },
      ];
    }
    res.json(resources);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;