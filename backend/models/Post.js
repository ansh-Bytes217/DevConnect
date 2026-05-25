// models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'insightful', 'celebrate', 'curious'], default: 'like' }
  }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
