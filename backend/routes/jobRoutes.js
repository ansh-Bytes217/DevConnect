// routes/jobRoutes.js
const express = require('express');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const bigDataHelper = require('../utils/bigDataHelper');
const router = express.Router();

// Get all jobs (with optional search filter)
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    const jobs = await Job.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } },
        { skillsRequired: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('postedBy', 'username email profilePicture')
    .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Post a job listing
router.post('/', auth, async (req, res) => {
  try {
    const { title, company, location, jobType, description, skillsRequired } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({ msg: 'Please enter all required fields' });
    }

    const newJob = new Job({
      title,
      company,
      location,
      jobType,
      description,
      skillsRequired: skillsRequired || [],
      postedBy: req.user.userId
    });

    await newJob.save();
    const populatedJob = await Job.findById(newJob._id).populate('postedBy', 'username email profilePicture');
    
    // Log job created event
    bigDataHelper.logEvent('JOB_CREATED', {
      jobId: populatedJob._id,
      title: populatedJob.title,
      company: populatedJob.company
    });

    res.status(201).json(populatedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply to a job listing
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job listing not found' });

    // Check if user already applied
    if (job.applicants.includes(req.user.userId)) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    job.applicants.push(req.user.userId);
    await job.save();

    // Log job applied event
    bigDataHelper.logEvent('JOB_APPLIED', {
      jobId: job._id,
      userId: req.user.userId,
      title: job.title,
      company: job.company
    });

    res.status(200).json({ msg: 'Application submitted successfully', job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a job listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job listing not found' });

    // Ensure user is the creator
    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(401).json({ msg: 'User not authorized to delete this listing' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: 'Job listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
