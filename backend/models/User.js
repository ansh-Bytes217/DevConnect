// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  bio: { type: String, default: "" },
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

const User = mongoose.model('User', userSchema);

module.exports = User;
