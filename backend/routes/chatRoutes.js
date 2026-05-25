// routes/chatRoutes.js
const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Retrieve message logs between the logged-in user and a connection
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const user1 = req.user.userId;
    const user2 = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 }); // Sorted chronologically

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
