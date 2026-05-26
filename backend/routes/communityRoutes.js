// routes/communityRoutes.js
const express = require('express');
const CommunityMessage = require('../models/CommunityMessage');
const auth = require('../middleware/auth');
const router = express.Router();

// Get channel messages history
router.get('/messages/:serverId/:channel', auth, async (req, res) => {
  try {
    const { serverId, channel } = req.params;
    const messages = await CommunityMessage.find({
      serverId,
      channel: '#' + channel
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a new channel message
router.post('/messages', auth, async (req, res) => {
  try {
    const { serverId, channel, text } = req.body;
    if (!serverId || !channel || !text) {
      return res.status(400).json({ msg: 'Please provide all fields' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    const senderUsername = user ? user.username : 'Developer';

    const newMsg = new CommunityMessage({
      serverId,
      channel,
      sender: req.user.userId,
      username: senderUsername,
      text
    });

    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
