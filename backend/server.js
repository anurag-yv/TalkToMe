const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api'); // Add new routes file

require('dotenv').config();

// ✅ Add fetch import for Node.js < 18
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const Post = require('./models/Post');
const Group = require('./models/Group');
const User = require('./models/User');
const Vibe = require('./models/Vibe'); // Add Vibe model

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes); // Mount new API routes

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed', err));

// HTTP + Socket.IO setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // React app
    methods: ['GET', 'POST']
  }
});

// Function to fetch Bitcoin answers from Gemini API
async function getBitcoinAnswerFromAPI(userMessage) {
  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `You are BitcoinBot. Answer only about Bitcoin prices, trends, and crypto facts.\n\n${userMessage}` }]
            }
          ]
        }),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`Gemini API Error ${apiRes.status}: ${errText}`);
    }

    const data = await apiRes.json();
    console.log("Gemini API Response:", data);

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn’t find the answer.";
  } catch (err) {
    console.error("API fetch error:", err.message);
    throw err;
  }
}

// Stats update helper
async function emitUpdatedStats() {
  try {
    const postCount = await Post.countDocuments();
    const groupCount = await Group.countDocuments();
    const memberCount = await User.countDocuments();
    const activeTodayCount = await User.countDocuments({
      lastActive: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const vibeCount = await Vibe.countDocuments(); // Add vibe count

    io.emit('statsUpdate', {
      posts: postCount,
      groups: groupCount,
      members: memberCount,
      activeToday: activeTodayCount,
      vibes: vibeCount, // Include vibes in stats
    });
  } catch (err) {
    console.error('Error emitting stats:', err);
  }
}

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle join event for username
  socket.on('join', (username) => {
    socket.username = username; // Store username on socket
    io.emit('userList', Array.from(io.sockets.sockets.values()).map(s => s.username).filter(Boolean));
  });

  // Handle chat messages
  socket.on('chatMessage', async (msg) => {
    let userMessage = typeof msg === "string" ? msg : msg.message;
    if (!userMessage || typeof userMessage !== "string") return;

    // Broadcast user message
    io.emit('chatMessage', {
      id: socket.id,
      username: msg.username || "Unknown",
      message: userMessage.trim(),
      timestamp: new Date().toISOString(),
    });

    // Get AI reply
    try {
      const apiReply = await getBitcoinAnswerFromAPI(userMessage);
      io.emit('chatMessage', {
        id: 'bot',
        username: 'BitcoinBot',
        message: apiReply,
        timestamp: new Date().toISOString(),
      });
    } catch {
      io.emit('chatMessage', {
        id: 'bot',
        username: 'BitcoinBot',
        message: "Sorry, I couldn’t fetch the data right now.",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle new vibe
  socket.on('newVibe', async (vibe) => {
    try {
      const newVibe = new Vibe({
        user: vibe.user,
        content: vibe.content,
      });
      await newVibe.save();
      io.emit('newVibe', {
        id: newVibe._id,
        user: vibe.user,
        content: vibe.content,
        createdAt: newVibe.createdAt,
      });
      emitUpdatedStats(); // Update stats after new vibe
    } catch (err) {
      console.error('Error saving vibe:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    io.emit('userList', Array.from(io.sockets.sockets.values()).map(s => s.username).filter(Boolean));
  });
});

// Emit stats periodically
setInterval(emitUpdatedStats, 10000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));