// routes/connectionRoutes.js
const express = require('express');
const Connection = require('../models/Connection');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Add a new connection
router.post('/add', auth, async (req, res) => {
  const { userId2 } = req.body;
  
  if (req.user.userId === userId2) {
    return res.status(400).json({ msg: 'You cannot connect with yourself' });
  }

  const existingConnection = await Connection.findOne({
    $or: [
      { userId1: req.user.userId, userId2 },
      { userId1: userId2, userId2: req.user.userId }
    ]
  });

  if (existingConnection) {
    return res.status(400).json({ msg: 'Connection request already exists' });
  }

  const newConnection = new Connection({
    userId1: req.user.userId,
    userId2,
    status: 'pending'
  });

  await newConnection.save();
  res.status(201).json(newConnection);
});

// Accept a connection
router.post('/accept', auth, async (req, res) => {
  const { connectionId } = req.body;

  const connection = await Connection.findById(connectionId);
  if (!connection) return res.status(404).json({ msg: 'Connection not found' });

  if (connection.userId2.toString() !== req.user.userId) {
    return res.status(403).json({ msg: 'You can only accept connections sent to you' });
  }

  connection.status = 'accepted';
  await connection.save();

  res.status(200).json(connection);
});

// Get connections for the logged-in user
router.get('/', auth, async (req, res) => {
  const connections = await Connection.find({
    $or: [{ userId1: req.user.userId }, { userId2: req.user.userId }]
  }).populate('userId1 userId2');
  res.status(200).json(connections);
});

module.exports = router;
