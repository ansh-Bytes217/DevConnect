// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    default: 'Full-time'
  },
  description: { type: String, required: true },
  skillsRequired: [{ type: String }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    email: { type: String },
    phone: { type: String },
    portfolio: { type: String },
    resumeName: { type: String },
    matchScore: { type: Number },
    status: { type: String, enum: ['Pending', 'Shortlisted', 'Rejected'], default: 'Pending' }
  }]
}, { timestamps: true });

const MongooseJob = mongoose.model('Job', jobSchema);
const mockDb = require('./mockDb');

const JobProxy = new Proxy(function() {}, {
  get(target, prop) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseJob : mockDb.getModel('Job', jobSchema);
    const value = actualModel[prop];
    if (typeof value === 'function') {
      return value.bind(actualModel);
    }
    return value;
  },
  construct(target, args) {
    const isConnected = mongoose.connection.readyState === 1;
    const actualModel = isConnected ? MongooseJob : mockDb.getModel('Job', jobSchema);
    return new actualModel(...args);
  }
});

module.exports = JobProxy;
