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

const MongoosePost = mongoose.model('Post', postSchema);
const mockDb = require('./mockDb');

const PostProxy = new Proxy(function() {}, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongoosePost : mockDb.getModel('Post', postSchema);
    const value = actualModel[prop];
    if (typeof value === 'function') {
      return value.bind(actualModel);
    }
    return value;
  },
  construct(target, args) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongoosePost : mockDb.getModel('Post', postSchema);
    return new actualModel(...args);
  }
});

module.exports = PostProxy;
