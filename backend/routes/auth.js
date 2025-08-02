const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(400).json({ message: 'Email already in use' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
