// routes/postRoutes.js
const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bigDataHelper = require('../utils/bigDataHelper');
const router = express.Router();

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;

    const newPost = new Post({
      content,
      imageUrl,
      userId: req.user.userId
    });

    await newPost.save();
    const populatedPost = await Post.findById(newPost._id).populate('userId', 'username profilePicture badge');
    
    // Publish event to Big Data Kafka pipeline
    bigDataHelper.logEvent('POST_CREATED', {
      postId: populatedPost._id,
      content: populatedPost.content,
      username: populatedPost.userId ? populatedPost.userId.username : 'Guest'
    });

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'username profilePicture badge')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React to a post (Toggle Reaction)
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'like', 'insightful', 'celebrate', 'curious'
    const userId = req.user.userId;

    if (!['like', 'insightful', 'celebrate', 'curious'].includes(type)) {
      return res.status(400).json({ msg: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // Check if user has already reacted
    const existingIndex = post.reactions.findIndex(r => r.userId.toString() === userId);

    if (existingIndex > -1) {
      if (post.reactions[existingIndex].type === type) {
        // Toggle off if same reaction
        post.reactions.splice(existingIndex, 1);
      } else {
        // Update reaction type if different
        post.reactions[existingIndex].type = type;
      }
    } else {
      // Add new reaction
      post.reactions.push({ userId, type });
    }

    await post.save();
    
    // Publish event to Big Data Kafka pipeline
    bigDataHelper.logEvent('POST_REACTED', {
      postId: post._id,
      type: type,
      userId: userId
    });

    const updatedPost = await Post.findById(post._id).populate('userId', 'username profilePicture badge');
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ msg: 'Comment content is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.comments.push({
      userId: req.user.userId,
      username: user.username,
      content: content.trim()
    });

    await post.save();

    // Publish event to Big Data Kafka pipeline
    bigDataHelper.logEvent('POST_COMMENT', {
      postId: post._id,
      commentLength: content.trim().length,
      username: user.username
    });

    const updatedPost = await Post.findById(post._id).populate('userId', 'username profilePicture badge');
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
