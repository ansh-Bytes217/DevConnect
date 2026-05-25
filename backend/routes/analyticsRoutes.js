// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bigDataHelper = require('../utils/bigDataHelper');

// Get all Big Data metrics (Kafka, Spark logs, HDFS blocks)
router.get('/metrics', auth, (req, res) => {
  try {
    const data = bigDataHelper.getMetrics();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run a MapReduce job simulation on an HDFS file path
router.post('/mapreduce', auth, (req, res) => {
  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ msg: 'filePath is required' });
    }
    const result = bigDataHelper.runMapReduceJob(filePath);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to post a mock event (Kafka Storm Simulation)
router.post('/mock-event', auth, (req, res) => {
  try {
    const { type, payload } = req.body;
    if (!type) {
      return res.status(400).json({ msg: 'Event type is required' });
    }
    const event = bigDataHelper.logEvent(type, payload || {});
    res.status(201).json({ msg: 'Mock event logged to Kafka topic', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
