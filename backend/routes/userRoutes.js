// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUserSignup, validateUserSignin } = require('../validation');
const auth = require('../middleware/auth');
const router = express.Router();

// User Registration (Sign Up)
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const { errors, isValid } = validateUserSignup({ username, email, password });
    if (!isValid) return res.status(400).json(errors);

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login (Sign In)
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { errors, isValid } = validateUserSignin({ email, password });
    if (!isValid) return res.status(400).json(errors);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile (Authenticated)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('connections', 'username email profilePicture badge');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Specific User Profile by ID (Authenticated)
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('connections', 'username email profilePicture badge')
      .populate('skills.endorsedBy', 'username');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile (Authenticated)
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, profilePicture, githubUsername, skills, experience, education, badge } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          bio: bio || "",
          profilePicture: profilePicture || "",
          githubUsername: githubUsername || "",
          skills: skills || [],
          experience: experience || [],
          education: education || [],
          badge: badge || 'none'
        }
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endorse a Skill (Authenticated)
router.post('/endorse', auth, async (req, res) => {
  try {
    const { targetUserId, skillName } = req.body;
    const endorserId = req.user.userId;

    if (targetUserId === endorserId) {
      return res.status(400).json({ msg: 'You cannot endorse your own skills' });
    }

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const skill = user.skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
    if (!skill) return res.status(400).json({ msg: 'Skill not found on this profile' });

    const alreadyEndorsed = skill.endorsedBy.includes(endorserId);

    if (alreadyEndorsed) {
      // Remove endorsement (toggle)
      skill.endorsedBy = skill.endorsedBy.filter(id => id.toString() !== endorserId);
    } else {
      // Add endorsement
      skill.endorsedBy.push(endorserId);
    }

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search Developers (Authenticated)
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await User.find({
      _id: { $ne: req.user.userId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { 'skills.name': { $regex: query, $options: 'i' } }
      ]
    }).select('username email profilePicture bio skills badge');

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recommend Connections (Authenticated)
router.get('/recommendations', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) return res.status(404).json({ msg: 'User not found' });

    // Exclude current user and current connections
    const excludeIds = [currentUser._id, ...currentUser.connections];

    // Find users who are not already connected
    const recommendations = await User.find({
      _id: { $nin: excludeIds }
    })
    .limit(5)
    .select('username email profilePicture bio skills badge');

    res.status(200).json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
