const express = require('express');
const router = express.Router();
const Group = require('../models/Group');

// Get all support groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new group (optional, you could protect this route)
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const newGroup = new Group({ name, description });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
