// utils/bigDataHelper.js
const fs = require('fs');
const path = require('path');

// Simulated Kafka states
let currentOffset = 1000;
let eventsBuffer = [];
const MAX_BUFFER_SIZE = 100;
let socketIoInstance = null;

// Mock HDFS directory tree
const hdfsFileSystem = {
  '/user/devconnect/logs/raw_events.json': {
    size: '142 KB',
    blocks: [
      { id: 'BLK-0982', size: '48 KB', node: 'DataNode-1', status: 'Healthy', replicaNodes: ['DataNode-2', 'DataNode-3'] },
      { id: 'BLK-0983', size: '48 KB', node: 'DataNode-2', status: 'Healthy', replicaNodes: ['DataNode-1', 'DataNode-3'] },
      { id: 'BLK-0984', size: '46 KB', node: 'DataNode-3', status: 'Healthy', replicaNodes: ['DataNode-1', 'DataNode-2'] }
    ]
  },
  '/user/devconnect/resumes/scanned_profiles.json': {
    size: '89 KB',
    blocks: [
      { id: 'BLK-0561', size: '45 KB', node: 'DataNode-1', status: 'Healthy', replicaNodes: ['DataNode-2', 'DataNode-3'] },
      { id: 'BLK-0562', size: '44 KB', node: 'DataNode-3', status: 'Healthy', replicaNodes: ['DataNode-1', 'DataNode-2'] }
    ]
  },
  '/user/devconnect/jobs/listings.json': {
    size: '34 KB',
    blocks: [
      { id: 'BLK-0331', size: '34 KB', node: 'DataNode-2', status: 'Healthy', replicaNodes: ['DataNode-1', 'DataNode-3'] }
    ]
  }
};

// Simulated Spark stats
let skillAggregation = {
  'React': 45,
  'NodeJS': 38,
  'Kafka': 29,
  'Spark': 24,
  'Hadoop': 18,
  'Python': 35,
  'Docker': 31,
  'Kubernetes': 22,
  'MongoDB': 40,
  'TailwindCSS': 27
};

let eventTypeCounts = {
  'POST_CREATED': 24,
  'POST_REACTED': 85,
  'POST_COMMENT': 42,
  'CONNECTION_REQUEST': 15,
  'CONNECTION_ACCEPTED': 12,
  'JOB_CREATED': 8,
  'JOB_APPLIED': 36,
  'RESUME_SCANNED': 19
};

// Determine Kafka topic based on event type
function getTopicForEvent(type) {
  if (['POST_CREATED', 'POST_REACTED', 'POST_COMMENT'].includes(type)) {
    return 'devconnect-feed-events';
  }
  if (['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED'].includes(type)) {
    return 'devconnect-user-events';
  }
  if (['JOB_CREATED', 'JOB_APPLIED'].includes(type)) {
    return 'devconnect-career-events';
  }
  return 'devconnect-system-logs';
}

/**
 * Initialize Big Data simulation engine
 * @param {object} io Socket.io instance
 */
function init(io) {
  socketIoInstance = io;
  console.log('[BigDataEngine] Initialized big data pipeline simulation.');
  
  // Real Apache Kafka Client Hook Stub:
  // If you decide to spin up a local/cloud Kafka broker, install 'kafkajs' and configure here:
  /*
  const { Kafka } = require('kafkajs');
  if (process.env.KAFKA_BROKERS) {
    const kafka = new Kafka({
      clientId: 'devconnect-app',
      brokers: process.env.KAFKA_BROKERS.split(',')
    });
    const producer = kafka.producer();
    producer.connect().then(() => console.log('[Kafka] Producer Connected'));
  }
  */
}

/**
 * Log event and dispatch to Kafka/Spark/Hadoop simulated pipeline
 */
function logEvent(type, payload) {
  const topic = getTopicForEvent(type);
  const partition = Math.floor(Math.random() * 3); // 3 partitions (0, 1, 2)
  const offset = currentOffset++;
  
  const event = {
    id: `evt_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    type,
    topic,
    partition,
    offset,
    payload
  };

  // Keep buffer size limited
  eventsBuffer.unshift(event);
  if (eventsBuffer.length > MAX_BUFFER_SIZE) {
    eventsBuffer.pop();
  }

  // Update Spark Aggregations
  eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
  
  // If post contains content, scan it for skill keywords
  if (type === 'POST_CREATED' && payload && payload.content) {
    const text = payload.content.toLowerCase();
    Object.keys(skillAggregation).forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        skillAggregation[skill] += 1;
      }
    });
  }

  // Notify active Socket.io clients (real-time stream feed)
  if (socketIoInstance) {
    socketIoInstance.emit('kafka_event', event);
    socketIoInstance.emit('spark_metrics', { eventTypeCounts, skillAggregation });
  }

  // Hook for real Kafka production:
  /*
  if (realKafkaProducer) {
    realKafkaProducer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }]
    });
  }
  */

  return event;
}

/**
 * Return current metrics for Spark & HDFS
 */
function getMetrics() {
  return {
    eventTypeCounts,
    skillAggregation,
    hdfsFileSystem,
    eventsBuffer: eventsBuffer.slice(0, 30) // last 30 events
  };
}

/**
 * Run simulated MapReduce word count on logs
 */
function runMapReduceJob(filePath) {
  if (!hdfsFileSystem[filePath]) {
    throw new Error('File not found in HDFS');
  }

  // Sample data text content depending on file type
  let rawText = '';
  if (filePath.includes('events')) {
    rawText = 'post react like comment chat connection accept profile job apply search scan auth logout update';
  } else if (filePath.includes('resumes')) {
    rawText = 'react node python javascript docker kubernetes spark hadoop kafka mongodb sql aws azure rust go java';
  } else {
    rawText = 'developer frontend backend engineer fullstack architect manager product lead designer intern tester';
  }

  // Generate word stream
  const words = [];
  const r = 200; // duplicate count to create substantial processing bulk
  for(let i=0; i<r; i++) {
    words.push(...rawText.split(' '));
  }

  // 1. SPLITTING: Divide words into 3 splits (simulating blocks)
  const chunkSize = Math.ceil(words.length / 3);
  const split1 = words.slice(0, chunkSize);
  const split2 = words.slice(chunkSize, chunkSize * 2);
  const split3 = words.slice(chunkSize * 2);

  // 2. MAPPING: Map phase generates key-value pairs (word, 1)
  const mapNode1 = split1.map(w => ({ key: w, value: 1 }));
  const mapNode2 = split2.map(w => ({ key: w, value: 1 }));
  const mapNode3 = split3.map(w => ({ key: w, value: 1 }));

  // 3. SHUFFLING: Sort and group keys
  const shuffleData = {};
  [...mapNode1, ...mapNode2, ...mapNode3].forEach(kv => {
    if (!shuffleData[kv.key]) {
      shuffleData[kv.key] = [];
    }
    shuffleData[kv.key].push(1);
  });

  // 4. REDUCING: Sum up values
  const reduceOutput = [];
  Object.keys(shuffleData).forEach(key => {
    reduceOutput.push({
      key,
      value: shuffleData[key].length
    });
  });

  // Sort by count descending
  reduceOutput.sort((a, b) => b.value - a.value);

  // Simulate MapReduce task DAG output
  return {
    splits: [
      { id: 'Split-01', records: split1.slice(0, 15), size: split1.length, dataNode: 'DataNode-1' },
      { id: 'Split-02', records: split2.slice(0, 15), size: split2.length, dataNode: 'DataNode-2' },
      { id: 'Split-03', records: split3.slice(0, 15), size: split3.length, dataNode: 'DataNode-3' }
    ],
    mapPhase: [
      { node: 'DataNode-1', processed: mapNode1.length, sample: mapNode1.slice(0, 5) },
      { node: 'DataNode-2', processed: mapNode2.length, sample: mapNode2.slice(0, 5) },
      { node: 'DataNode-3', processed: mapNode3.length, sample: mapNode3.slice(0, 5) }
    ],
    shufflePhase: Object.keys(shuffleData).slice(0, 12).map(key => ({
      key,
      list: shuffleData[key]
    })),
    reducePhase: reduceOutput.slice(0, 10), // Top 10 results
    outputFile: '/user/devconnect/output/part-r-00000',
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  init,
  logEvent,
  getMetrics,
  runMapReduceJob
};
