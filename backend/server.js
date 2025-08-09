const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Post = require('./models/Post');
const Group = require('./models/Group');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection failed', err));

// HTTP + Socket.IO setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Attach io to every request to use in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/groups', require('./routes/groups'));

app.get('/', (req, res) => res.send('API running.'));

// Debug socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

// Emit stats every 10 seconds as fallback periodic update
setInterval(async () => {
  try {
    const postCount = await Post.countDocuments();
    const groupCount = await Group.countDocuments();
    const memberCount = await User.countDocuments();
    const activeTodayCount = await User.countDocuments({
      lastActive: { $gte: new Date().setHours(0,0,0,0) }
    });

    io.emit("statsUpdate", {
      posts: postCount,
      groups: groupCount,
      members: memberCount,
      activeToday: activeTodayCount
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}, 10000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
