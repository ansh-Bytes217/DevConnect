
// routes/postRoutes.js
const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// Create a new post
router.post('/', auth, async (req, res) => {
  const { content, imageUrl } = req.body;

  const newPost = new Post({
    content,
    imageUrl,
    userId: req.user.userId
  });

  await newPost.save();
  res.status(201).json(newPost);
});

// Get all posts
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('userId');
  res.status(200).json(posts);
});

module.exports = router;
