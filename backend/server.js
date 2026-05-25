// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const chatRoutes = require('./routes/chatRoutes');
const jobRoutes = require('./routes/jobRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const Message = require('./models/Message');
const bigDataHelper = require('./utils/bigDataHelper');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow any development client connection
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize Big Data simulation engine
bigDataHelper.init(io);

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  // User joins a private chat room with another user
  socket.on('join_chat', ({ senderId, receiverId }) => {
    const chatRoomId = [senderId, receiverId].sort().join('_');
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined private room: ${chatRoomId}`);
  });

  // User sends a message
  socket.on('send_message', async ({ senderId, receiverId, text }) => {
    try {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        text
      });
      await message.save();

      const chatRoomId = [senderId, receiverId].sort().join('_');
      // Broadcast the message back to the active room users
      io.to(chatRoomId).emit('receive_message', message);
    } catch (err) {
      console.error('Socket send_message error:', err.message);
    }
  });

  // User broadcasts active meet call code invite
  socket.on('share_meet', ({ senderUsername, roomCode, connectionsList }) => {
    // Notify all connections of the meet call room
    socket.broadcast.emit('meet_invite', { senderUsername, roomCode, connectionsList });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket:', socket.id);
  });
});

// Connecting to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
