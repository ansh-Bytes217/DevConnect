// routes/connectionRoutes.js
const express = require('express');
const Connection = require('../models/Connection');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bigDataHelper = require('../utils/bigDataHelper');
const router = express.Router();

// Add/Send a new connection request
router.post('/add', auth, async (req, res) => {
  try {
    const { userId2 } = req.body;
    
    if (req.user.userId === userId2) {
      return res.status(400).json({ msg: 'You cannot connect with yourself' });
    }

    // Verify target user exists
    const targetUser = await User.findById(userId2);
    if (!targetUser) {
      return res.status(404).json({ msg: 'Target user not found' });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { userId1: req.user.userId, userId2 },
        { userId1: userId2, userId2: req.user.userId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ msg: 'Connection request already exists or you are already connected' });
    }

    const newConnection = new Connection({
      userId1: req.user.userId,
      userId2,
      status: 'pending'
    });

    await newConnection.save();
    
    // Log connection request event in Kafka
    bigDataHelper.logEvent('CONNECTION_REQUEST', {
      senderId: req.user.userId,
      recipientId: userId2
    });

    res.status(201).json(newConnection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a connection request
router.post('/accept', auth, async (req, res) => {
  try {
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ msg: 'Connection request not found' });

    if (connection.userId2.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'You can only accept connections sent to you' });
    }

    connection.status = 'accepted';
    await connection.save();

    // Add to each other's user connections arrays
    await User.findByIdAndUpdate(connection.userId1, { $addToSet: { connections: connection.userId2 } });
    await User.findByIdAndUpdate(connection.userId2, { $addToSet: { connections: connection.userId1 } });

    // Log connection acceptance in Kafka
    bigDataHelper.logEvent('CONNECTION_ACCEPTED', {
      user1: connection.userId1,
      user2: connection.userId2
    });

    res.status(200).json(connection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decline/Cancel a connection request
router.post('/decline', auth, async (req, res) => {
  try {
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);
    if (!connection) return res.status(404).json({ msg: 'Connection request not found' });

    // Verify requesting user is part of the connection
    if (connection.userId1.toString() !== req.user.userId && connection.userId2.toString() !== req.user.userId) {
      return res.status(403).json({ msg: 'Unauthorized action' });
    }

    // If already accepted, remove from connections arrays first
    if (connection.status === 'accepted') {
      await User.findByIdAndUpdate(connection.userId1, { $pull: { connections: connection.userId2 } });
      await User.findByIdAndUpdate(connection.userId2, { $pull: { connections: connection.userId1 } });
    }

    // Delete the connection document
    await Connection.findByIdAndDelete(connectionId);

    res.status(200).json({ msg: 'Connection request declined/removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get accepted connections list for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const connections = await Connection.find({
      status: 'accepted',
      $or: [{ userId1: req.user.userId }, { userId2: req.user.userId }]
    }).populate('userId1 userId2', 'username email profilePicture bio skills badge');
    
    res.status(200).json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending connection requests (both incoming and outgoing)
router.get('/pending', auth, async (req, res) => {
  try {
    const incoming = await Connection.find({
      userId2: req.user.userId,
      status: 'pending'
    }).populate('userId1', 'username email profilePicture bio skills badge');

    const outgoing = await Connection.find({
      userId1: req.user.userId,
      status: 'pending'
    }).populate('userId2', 'username email profilePicture bio skills badge');

    res.status(200).json({ incoming, outgoing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
