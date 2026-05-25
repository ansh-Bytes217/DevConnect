// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
  githubUsername: { type: String, default: "" },
  skills: [{
    name: { type: String, required: true },
    endorsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  experience: [{
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, default: "" }
  }],
  education: [{
    school: { type: String, required: true },
    degree: { type: String, required: true },
    duration: { type: String, required: true }
  }],
  badge: { type: String, enum: ['none', 'open-to-work', 'hiring'], default: 'none' },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const MongooseUser = mongoose.model('User', userSchema);
const mockDb = require('./mockDb');

const UserProxy = new Proxy(function() {}, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseUser : mockDb.getModel('User', userSchema);
    const value = actualModel[prop];
    if (typeof value === 'function') {
      return value.bind(actualModel);
    }
    return value;
  },
  construct(target, args) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseUser : mockDb.getModel('User', userSchema);
    return new actualModel(...args);
  }
});

module.exports = UserProxy;
