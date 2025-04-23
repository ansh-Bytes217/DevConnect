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
  const { username, email, password } = req.body;

  const { errors, isValid } = validateUserSignup({ username, email, password });
  if (!isValid) return res.status(400).json(errors);

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ token });
});

// User Login (Sign In)
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const { errors, isValid } = validateUserSignin({ email, password });
  if (!isValid) return res.status(400).json(errors);

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
});

// Get User Profile (Authenticated)
router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ msg: 'User not found' });

  res.status(200).json(user);
});

module.exports = router;
