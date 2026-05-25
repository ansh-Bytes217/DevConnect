// pages/BigDataConsole.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Database, Cpu, Terminal, Play, Pause, 
  Activity, HardDrive, RefreshCw, BarChart2, Layers, 
  Zap, Info, FileText, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

// Helper for backend requests
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BigDataConsole = () => {
  const { user } = useAuth();
  const socket = useSocket();

  // Tabs: 'topology' | 'kafka' | 'spark' | 'hadoop'
  const [activeTab, setActiveTab] = useState('topology');

  // Metrics state
  const [metrics, setMetrics] = useState({
    eventTypeCounts: {
      'POST_CREATED': 24,
      'POST_REACTED': 85,
      'POST_COMMENT': 42,
      'CONNECTION_REQUEST': 15,
      'CONNECTION_ACCEPTED': 12,
      'JOB_CREATED': 8,
      'JOB_APPLIED': 36,
      'RESUME_SCANNED': 19
    },
    skillAggregation: {
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
    },
    hdfsFileSystem: {
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
    },
    eventsBuffer: []
  });

  const [kafkaEvents, setKafkaEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Kafka Event Storm state
  const [isStormRunning, setIsStormRunning] = useState(false);
  const [stormSpeed, setStormSpeed] = useState(3); // events per second
  const stormIntervalRef = useRef(null);

  // Spark state
  const [sparkJobRunning, setSparkJobRunning] = useState(false);
  const [sparkProgress, setSparkProgress] = useState(0);
  const [sparkStage, setSparkStage] = useState('Idle');
  const [sparkLog, setSparkLog] = useState([]);
  const [recommendationsOutput, setRecommendationsOutput] = useState(null);

  // Hadoop MapReduce state
  const [selectedHdfsFile, setSelectedHdfsFile] = useState('/user/devconnect/logs/raw_events.json');
  const [mrStatus, setMrStatus] = useState('idle'); // 'idle' | 'splitting' | 'mapping' | 'shuffling' | 'reducing' | 'completed'
  const [mrProgress, setMrProgress] = useState(0);
  const [mrResult, setMrResult] = useState(null);

  // Fetch initial metrics
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      // If we have a token (online mode)
      if (token && token !== 'mock-guest-token') {
        const res = await axios.get(`${API_URL}/analytics/metrics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data);
        if (res.data.eventsBuffer && res.data.eventsBuffer.length > 0) {
          setKafkaEvents(res.data.eventsBuffer);
        }
      } else {
        // Guest mode fallback
        generateInitialMockEvents();
      }
    } catch (err) {
      console.error('Error fetching big data metrics:', err);
      generateInitialMockEvents();
    } finally {
      setLoading(false);
    }
  };

  const generateInitialMockEvents = () => {
    const types = ['POST_CREATED', 'POST_REACTED', 'POST_COMMENT', 'CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'JOB_CREATED', 'JOB_APPLIED', 'RESUME_SCANNED'];
    const topics = {
      'POST_CREATED': 'devconnect-feed-events',
      'POST_REACTED': 'devconnect-feed-events',
      'POST_COMMENT': 'devconnect-feed-events',
      'CONNECTION_REQUEST': 'devconnect-user-events',
      'CONNECTION_ACCEPTED': 'devconnect-user-events',
      'JOB_CREATED': 'devconnect-career-events',
      'JOB_APPLIED': 'devconnect-career-events',
      'RESUME_SCANNED': 'devconnect-system-logs'
    };
    const mockList = Array.from({ length: 15 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        id: `evt_MOCK${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        timestamp: new Date(Date.now() - i * 120000).toISOString(),
        type,
        topic: topics[type],
        partition: Math.floor(Math.random() * 3),
        offset: 1000 - i,
        payload: { simulated: true }
      };
    });
    setKafkaEvents(mockList);
  };

  useEffect(() => {
    fetchMetrics();

    // Listen to real-time events via WebSockets if connected
    if (socket) {
      socket.on('kafka_event', (event) => {
        setKafkaEvents(prev => [event, ...prev.slice(0, 49)]); // keep last 50
        // Dynamically increment counts
        setMetrics(prev => {
          const typeCounts = { ...prev.eventTypeCounts };
          typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
          return {
            ...prev,
            eventTypeCounts: typeCounts
          };
        });
      });

      socket.on('spark_metrics', (data) => {
        setMetrics(prev => ({
          ...prev,
          eventTypeCounts: data.eventTypeCounts,
          skillAggregation: data.skillAggregation
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('kafka_event');
        socket.off('spark_metrics');
      }
      if (stormIntervalRef.current) clearInterval(stormIntervalRef.current);
    };
  }, [socket]);

  // Kafka Event Storm Simulator
  const toggleStorm = () => {
    if (isStormRunning) {
      clearInterval(stormIntervalRef.current);
      setIsStormRunning(false);
    } else {
      setIsStormRunning(true);
      const intervalMs = Math.round(1000 / stormSpeed);
      stormIntervalRef.current = setInterval(async () => {
        const types = ['POST_CREATED', 'POST_REACTED', 'POST_COMMENT', 'CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'JOB_CREATED', 'JOB_APPLIED', 'RESUME_SCANNED'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomPayload = {
          userId: `usr_${Math.random().toString(36).substring(2, 8)}`,
          details: 'Event storm synthetic injection packet'
        };

        const token = localStorage.getItem('token');
        if (token && token !== 'mock-guest-token') {
          try {
            const res = await axios.post(`${API_URL}/analytics/mock-event`, {
              type: randomType,
              payload: randomPayload
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Socket event handler will automatically handle UI state updates
          } catch (err) {
            triggerLocalEvent(randomType, randomPayload);
          }
        } else {
          triggerLocalEvent(randomType, randomPayload);
        }
      }, intervalMs);
    }
  };

  const triggerLocalEvent = (type, payload) => {
    const topics = {
      'POST_CREATED': 'devconnect-feed-events',
      'POST_REACTED': 'devconnect-feed-events',
      'POST_COMMENT': 'devconnect-feed-events',
      'CONNECTION_REQUEST': 'devconnect-user-events',
      'CONNECTION_ACCEPTED': 'devconnect-user-events',
      'JOB_CREATED': 'devconnect-career-events',
      'JOB_APPLIED': 'devconnect-career-events',
      'RESUME_SCANNED': 'devconnect-system-logs'
    };
    const newEvent = {
      id: `evt_MOCK${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      type,
      topic: topics[type] || 'devconnect-system-logs',
      partition: Math.floor(Math.random() * 3),
      offset: kafkaEvents.length > 0 ? kafkaEvents[0].offset + 1 : 1001,
      payload
    };

    setKafkaEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    setMetrics(prev => {
      const typeCounts = { ...prev.eventTypeCounts };
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      
      const skillAgg = { ...prev.skillAggregation };
      if (type === 'POST_CREATED') {
        const skills = Object.keys(skillAgg);
        const randomSkill = skills[Math.floor(Math.random() * skills.length)];
        skillAgg[randomSkill] += 1;
      }

      return {
        ...prev,
        eventTypeCounts: typeCounts,
        skillAggregation: skillAgg
      };
    });
  };

  // Adjust Storm Ingest Speed
  useEffect(() => {
    if (isStormRunning) {
      // Re-trigger interval with new speed
      clearInterval(stormIntervalRef.current);
      toggleStorm(); // stop
      toggleStorm(); // restart with new speed
    }
  }, [stormSpeed]);

  // Run Spark MLlib Job Simulation
  const runSparkJob = () => {
    if (sparkJobRunning) return;
    setSparkJobRunning(true);
    setSparkProgress(0);
    setSparkLog([]);
    setRecommendationsOutput(null);

    const logSteps = [
      { prg: 10, stage: 'SparkSession Init', msg: 'Starting Spark Session SparkSession-DevConnect-MLlib...' },
      { prg: 25, stage: 'DataFrame Loading', msg: 'Loading tables user_connections & job_applications from HDFS data blocks...' },
      { prg: 45, stage: 'ALS Matrix Factorization', msg: 'Training Alternating Least Squares (ALS) model on connection matrix. Iterations=10, rank=12...' },
      { prg: 70, stage: 'Cosine Similarity Query', msg: 'Calculating cosine similarity arrays across latent user vector embeddings...' },
      { prg: 90, stage: 'Partition Save', msg: 'Writing resulting user connection recommendations back to HDFS storage splits...' },
      { prg: 100, stage: 'Completed', msg: 'Job finished successfully. Execution time: 1.45s.' }
    ];

    let stepIdx = 0;
    const runInterval = setInterval(() => {
      if (stepIdx < logSteps.length) {
        const current = logSteps[stepIdx];
        setSparkProgress(current.prg);
        setSparkStage(current.stage);
        setSparkLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${current.msg}`]);
        stepIdx++;
      } else {
        clearInterval(runInterval);
        setSparkJobRunning(false);
        setRecommendationsOutput({
          users: [
            { name: 'Sarah Connor', score: '98% match', reason: 'Common skills in Kafka, Hadoop' },
            { name: 'Alex Rivera', score: '94% match', reason: 'Both applied for Backend Architect roles' },
            { name: 'Elena Rostova', score: '89% match', reason: 'High similarity in Python/Spark matrix' }
          ]
        });
      }
    }, 800);
  };

  // Run Hadoop MapReduce Job Simulation
  const runMapReduce = async () => {
    if (mrStatus !== 'idle' && mrStatus !== 'completed') return;
    setMrStatus('splitting');
    setMrProgress(0);
    setMrResult(null);

    const token = localStorage.getItem('token');
    
    // Simulate pipeline progression with delay
    setTimeout(() => {
      setMrStatus('mapping');
      setMrProgress(25);
    }, 1000);

    setTimeout(() => {
      setMrStatus('shuffling');
      setMrProgress(55);
    }, 2200);

    setTimeout(() => {
      setMrStatus('reducing');
      setMrProgress(80);
    }, 3400);

    setTimeout(async () => {
      try {
        if (token && token !== 'mock-guest-token') {
          const res = await axios.post(`${API_URL}/analytics/mapreduce`, { filePath: selectedHdfsFile }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMrResult(res.data);
        } else {
          // Local fallback
          setMrResult(generateLocalMapReduceResult(selectedHdfsFile));
        }
      } catch (err) {
        setMrResult(generateLocalMapReduceResult(selectedHdfsFile));
      }
      setMrStatus('completed');
      setMrProgress(100);
    }, 4500);
  };

  const generateLocalMapReduceResult = (filePath) => {
    const rawText = filePath.includes('events') 
      ? 'post react like comment chat connection accept profile job apply search scan auth logout update'
      : filePath.includes('resumes')
      ? 'react node python javascript docker kubernetes spark hadoop kafka mongodb sql aws azure rust go java'
      : 'developer frontend backend engineer fullstack architect manager product lead designer intern tester';
    
    const words = rawText.split(' ');
    const grouped = {};
    words.forEach(w => {
      grouped[w] = Math.floor(Math.random() * 25) + 5;
    });

    const reducePhase = Object.keys(grouped).map(key => ({
      key,
      value: grouped[key]
    })).sort((a, b) => b.value - a.value).slice(0, 8);

    return {
      splits: [
        { id: 'Split-01', records: words.slice(0, 5), size: 450, dataNode: 'DataNode-1' },
        { id: 'Split-02', records: words.slice(5, 10), size: 450, dataNode: 'DataNode-2' },
        { id: 'Split-03', records: words.slice(10), size: 420, dataNode: 'DataNode-3' }
      ],
      mapPhase: [
        { node: 'DataNode-1', processed: 450, sample: words.slice(0, 3).map(w => ({ key: w, value: 1 })) },
        { node: 'DataNode-2', processed: 450, sample: words.slice(5, 8).map(w => ({ key: w, value: 1 })) },
        { node: 'DataNode-3', processed: 420, sample: words.slice(10, 13).map(w => ({ key: w, value: 1 })) }
      ],
      shufflePhase: Object.keys(grouped).slice(0, 6).map(key => ({
        key,
        list: Array(grouped[key]).fill(1)
      })),
      reducePhase,
      outputFile: '/user/devconnect/output/part-r-00000',
      timestamp: new Date().toISOString()
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER WITH REAL-TIME PILLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Network className="text-indigo-400 animate-pulse" size={26} />
            <span>Big Data Engine Hub</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time developer engagement diagnostics flowing through Apache Kafka, processed by Apache Spark, and persisted to HDFS.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            <span className="text-slate-400">Kafka Status:</span>
            <span className="text-emerald-400">KRaft Online (3 Brokers)</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-slate-400">Spark Status:</span>
            <span className="text-emerald-400">3 Workers / 12 Cores</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping"></span>
            <span className="text-slate-400">HDFS Replica:</span>
            <span className="text-emerald-400">3x Synchronized</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-white/5 space-x-6 text-xs font-bold text-slate-400">
        {[
          { id: 'topology', label: 'System Topology', icon: <Network size={14} /> },
          { id: 'kafka', label: 'Apache Kafka Broker', icon: <Layers size={14} /> },
          { id: 'spark', label: 'Apache Spark Streaming', icon: <Cpu size={14} /> },
          { id: 'hadoop', label: 'Hadoop HDFS & MapReduce', icon: <Database size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2.5 pb-3 border-b-2 transition-all relative ${
              activeTab === tab.id 
                ? 'border-indigo-500 text-indigo-400 font-extrabold' 
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER */}
      <div className="min-h-[480px]">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-500">Querying cluster endpoints...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: SYSTEM TOPOLOGY */}
            {activeTab === 'topology' && (
              <motion.div
                key="topology"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* BLUEPRINT ARCHITECTURE CHART */}
                <div className="md:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Network size={16} className="text-indigo-400" />
                      <span>Data Pipeline Architecture Grid</span>
                    </h3>
                    <span className="text-[9px] uppercase tracking-wider bg-slate-900 border border-slate-800 text-indigo-400 px-2.5 py-1 rounded-md font-bold">Interactive Flow</span>
                  </div>

                  {/* Flow SVG/HTML Container */}
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-8 relative overflow-hidden h-72">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_60%)]"></div>
                    
                    {/* Topology Nodes */}
                    <div className="flex justify-between items-center h-full relative z-10">
                      
                      {/* Node Column 1: Client Inputs */}
                      <div className="flex flex-col space-y-4">
                        <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-wider text-center">Data Sources</span>
                        <div className="flex flex-col space-y-2">
                          {['User Posts', 'Job Board Actions', 'CV Analyzer'].map((item, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-[9px] font-bold text-slate-300 w-32 shadow-sm text-center">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Line connector spacer */}
                      <div className="flex-1 h-0.5 bg-dashed border-t border-slate-800 border-dashed relative mx-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 absolute top-[-5px] left-1/4 animate-pulse"></div>
                      </div>

                      {/* Node Column 2: Kafka Brokers */}
                      <div className="flex flex-col space-y-4">
                        <span className="text-[8px] text-indigo-400 font-extrabold uppercase tracking-wider text-center">Ingestion (Kafka)</span>
                        <div className="flex flex-col space-y-2 items-center">
                          <div className="bg-indigo-950/40 border border-indigo-900/50 p-3 rounded-2xl text-[9px] font-extrabold text-indigo-300 w-36 shadow-lg shadow-indigo-950/20 text-center flex flex-col space-y-1">
                            <Layers size={14} className="mx-auto" />
                            <span>Kafka Event Broker</span>
                            <span className="text-[8px] text-indigo-500 font-medium">Topic Routing & Log Append</span>
                          </div>
                        </div>
                      </div>

                      {/* Line connector spacer */}
                      <div className="flex-1 h-0.5 bg-dashed border-t border-slate-800 border-dashed relative mx-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 absolute top-[-5px] left-1/2 animate-pulse"></div>
                      </div>

                      {/* Node Column 3: Spark Streaming */}
                      <div className="flex flex-col space-y-4">
                        <span className="text-[8px] text-cyan-400 font-extrabold uppercase tracking-wider text-center">Processing (Spark)</span>
                        <div className="flex flex-col space-y-2 items-center">
                          <div className="bg-cyan-950/40 border border-cyan-900/50 p-3 rounded-2xl text-[9px] font-extrabold text-cyan-300 w-36 shadow-lg shadow-cyan-950/20 text-center flex flex-col space-y-1">
                            <Cpu size={14} className="mx-auto" />
                            <span>Spark Analytics Core</span>
                            <span className="text-[8px] text-cyan-500 font-medium">Window Aggregations & ML</span>
                          </div>
                        </div>
                      </div>

                      {/* Line connector spacer */}
                      <div className="flex-1 h-0.5 bg-dashed border-t border-slate-800 border-dashed relative mx-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 absolute top-[-5px] left-3/4 animate-pulse"></div>
                      </div>

                      {/* Node Column 4: HDFS Storage */}
                      <div className="flex flex-col space-y-4">
                        <span className="text-[8px] text-violet-400 font-extrabold uppercase tracking-wider text-center">Storage (Hadoop)</span>
                        <div className="flex flex-col space-y-2">
                          <div className="bg-violet-950/40 border border-violet-900/50 p-3 rounded-2xl text-[9px] font-extrabold text-violet-300 w-32 shadow-lg shadow-violet-950/20 text-center flex flex-col space-y-1">
                            <Database size={14} className="mx-auto" />
                            <span>HDFS Clusters</span>
                            <span className="text-[8px] text-violet-500 font-medium">3x Block Replication</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    This architecture leverages **Apache Kafka** for low-latency event capture, enabling decoupled communication. **Apache Spark Streaming** subscribes to the Kafka event log, processing metrics over a sliding window to aggregate platform metrics. Finally, data is aggregated and written to **HDFS (Hadoop Distributed File System)** where batch jobs can perform offline analytics such as MapReduce querying or machine learning evaluations.
                  </p>
                </div>

                {/* ARCHITECTURE DIAGNOSTICS */}
                <div className="md:col-span-4 space-y-6">
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Activity size={14} className="text-indigo-400" />
                      <span>Cluster Telemetry</span>
                    </h4>
                    
                    <div className="space-y-3.5">
                      {[
                        { label: 'Event Ingestion Rate', val: isStormRunning ? `${stormSpeed * 12} events/sec` : '0.4 events/sec', prg: isStormRunning ? stormSpeed * 10 : 5, color: 'bg-indigo-500' },
                        { label: 'Spark Memory Usage', val: '4.8 GB of 16.0 GB', prg: 30, color: 'bg-cyan-500' },
                        { label: 'HDFS Volume Allocation', val: '265.4 KB used (replicated)', prg: 2, color: 'bg-violet-500' },
                        { label: 'KRaft Zookeeper Sync Lag', val: '0.12 ms', prg: 4, color: 'bg-emerald-500' }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-slate-400">{stat.label}</span>
                            <span className="text-slate-200">{stat.val}</span>
                          </div>
                          <div className="w-full bg-slate-900 border border-slate-850 h-1.5 rounded-full overflow-hidden">
                            <div className={`${stat.color} h-full transition-all duration-300`} style={{ width: `${stat.prg}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Zap size={14} className="text-yellow-400" />
                      <span>Quick Actions</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">Trigger high-throughput operations or ML modeling computations.</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { setActiveTab('kafka'); toggleStorm(); }}
                        className="bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/25 p-2 rounded-xl text-[9px] font-extrabold transition-colors flex items-center justify-center space-x-1"
                      >
                        <Layers size={10} />
                        <span>{isStormRunning ? 'Stop Storm' : 'Trigger Storm'}</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('spark'); runSparkJob(); }}
                        className="bg-cyan-600/15 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-600/25 p-2 rounded-xl text-[9px] font-extrabold transition-colors flex items-center justify-center space-x-1"
                      >
                        <Cpu size={10} />
                        <span>Run Spark ML</span>
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: APACHE KAFKA STREAM */}
            {activeTab === 'kafka' && (
              <motion.div
                key="kafka"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Left Panel: Stream Control & Realtime Feed */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Realtime Event Monitor */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Terminal size={16} className="text-indigo-400" />
                        <span>Kafka Consumer Topic Event Log</span>
                      </h3>
                      <div className="flex items-center space-x-2 text-[9px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-slate-400 font-bold">Consumer Group: devconnect-analytics-group</span>
                      </div>
                    </div>

                    {/* Scrolling terminal window */}
                    <div className="bg-[#04060c] border border-slate-900 p-4 rounded-2xl h-80 overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-thin">
                      {kafkaEvents.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-650">
                          <span>Waiting for Kafka broker partition appends... Create a feed post or connection to trigger events!</span>
                        </div>
                      ) : (
                        kafkaEvents.map((evt, idx) => {
                          let topicColor = 'text-cyan-400';
                          if (evt.topic.includes('user')) topicColor = 'text-purple-400';
                          if (evt.topic.includes('career')) topicColor = 'text-emerald-400';
                          if (evt.topic.includes('system')) topicColor = 'text-amber-400';

                          return (
                            <div key={evt.id || idx} className="border-b border-white/5 pb-1.5 leading-relaxed">
                              <div className="flex justify-between text-slate-500 font-bold mb-0.5">
                                <span>[{new Date(evt.timestamp).toLocaleTimeString()}]</span>
                                <span className={topicColor}>{evt.topic} [P:{evt.partition} / O:{evt.offset}]</span>
                              </div>
                              <div className="text-slate-300">
                                <span className="text-indigo-400 font-bold">{evt.type}</span>: {JSON.stringify(evt.payload)}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Kafka Ingestion Configuration */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* Event Ingest Controls */}
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-2">
                      <Layers size={14} className="text-indigo-400" />
                      <span>Ingestion Event Storm</span>
                    </h4>
                    
                    <p className="text-[10px] text-slate-500">
                      Simulate a high-throughput transaction storm to evaluate pipeline processing latency.
                    </p>

                    <div className="space-y-4">
                      {/* Speed selector slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold">
                          <span className="text-slate-400">Storm Speed:</span>
                          <span className="text-indigo-400">{stormSpeed} events / sec</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={stormSpeed}
                          onChange={(e) => setStormSpeed(parseInt(e.target.value))}
                          disabled={!isStormRunning}
                          className="w-full h-1 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {/* Start / Stop Toggle */}
                      <button
                        onClick={toggleStorm}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg ${
                          isStormRunning 
                            ? 'bg-rose-600/15 border border-rose-500/20 text-rose-400 hover:bg-rose-600/25 shadow-rose-600/5' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/15'
                        }`}
                      >
                        {isStormRunning ? <Pause size={12} /> : <Play size={12} />}
                        <span>{isStormRunning ? 'Stop Event Storm' : 'Trigger Event Storm'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Broker Node Health */}
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-white">Broker Cluster Topology</h4>
                    
                    <div className="space-y-2.5">
                      {[
                        { name: 'Broker-0 (Leader)', addr: '10.0.0.1:9092', state: 'Active' },
                        { name: 'Broker-1 (Replica)', addr: '10.0.0.2:9092', state: 'Active' },
                        { name: 'Broker-2 (Replica)', addr: '10.0.0.3:9092', state: 'Active' }
                      ].map((node, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-950 border border-slate-900 p-2.5 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-200 block">{node.name}</span>
                            <span className="text-[8px] font-mono text-slate-500 block">{node.addr}</span>
                          </div>
                          <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                            {node.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 3: APACHE SPARK STREAMING */}
            {activeTab === 'spark' && (
              <motion.div
                key="spark"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Left Panel: Stream Stats and Live DAG */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Interactive DAG Diagram */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Cpu size={16} className="text-cyan-400" />
                        <span>Spark Execution DAG (Directed Acyclic Graph)</span>
                      </h3>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        sparkJobRunning 
                          ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse' 
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        Status: {sparkStage}
                      </span>
                    </div>

                    {/* Visual DAG Flow Chart */}
                    <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl flex items-center justify-around relative min-h-[140px] overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02),transparent_70%)]"></div>
                      
                      {/* DAG Stage 1 */}
                      <div className={`p-3 rounded-xl border text-center transition-all duration-300 w-32 relative z-10 ${
                        sparkProgress >= 10 && sparkProgress < 45
                          ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                          : 'bg-slate-900 border-slate-850 opacity-60'
                      }`}>
                        <span className="text-[9px] font-extrabold text-cyan-400 block mb-0.5">Stage 0</span>
                        <span className="text-[8px] text-slate-300 block">Map / FlatMap</span>
                        <span className="text-[7px] text-slate-500 block">Ingest event records</span>
                      </div>

                      {/* DAG Arrow */}
                      <ChevronRight size={16} className="text-slate-700" />

                      {/* DAG Stage 2 */}
                      <div className={`p-3 rounded-xl border text-center transition-all duration-300 w-32 relative z-10 ${
                        sparkProgress >= 45 && sparkProgress < 90
                          ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                          : 'bg-slate-900 border-slate-850 opacity-60'
                      }`}>
                        <span className="text-[9px] font-extrabold text-cyan-400 block mb-0.5">Stage 1</span>
                        <span className="text-[8px] text-slate-300 block">Shuffle / KeyGroup</span>
                        <span className="text-[7px] text-slate-500 block">Aggregate by skill</span>
                      </div>

                      {/* DAG Arrow */}
                      <ChevronRight size={16} className="text-slate-700" />

                      {/* DAG Stage 3 */}
                      <div className={`p-3 rounded-xl border text-center transition-all duration-300 w-32 relative z-10 ${
                        sparkProgress >= 90
                          ? 'bg-cyan-950/20 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                          : 'bg-slate-900 border-slate-850 opacity-60'
                      }`}>
                        <span className="text-[9px] font-extrabold text-cyan-400 block mb-0.5">Stage 2</span>
                        <span className="text-[8px] text-slate-300 block">Reduce / Save</span>
                        <span className="text-[7px] text-slate-500 block">Save statistics HDFS</span>
                      </div>

                    </div>

                    {/* Spark Execution Log Console */}
                    {sparkJobRunning && (
                      <div className="bg-[#04060c] border border-slate-900 p-3.5 rounded-xl h-36 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1">
                        {sparkLog.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Skill Distribution calculated by Spark windowing */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <BarChart2 size={16} className="text-cyan-400" />
                      <span>Trending Skills Stream Analysis (Computed by Spark)</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(metrics.skillAggregation).slice(0, 8).map(([skill, count]) => {
                        const maxCount = Math.max(...Object.values(metrics.skillAggregation));
                        const pct = Math.round((count / maxCount) * 100);

                        return (
                          <div key={skill} className="space-y-1 bg-slate-950 border border-slate-900/60 p-3 rounded-xl">
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-slate-300">{skill}</span>
                              <span className="text-cyan-400">{count} occurrences</span>
                            </div>
                            <div className="w-full bg-slate-900 border border-slate-850 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Spark Job Submission */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* MLlib recommendation submitter */}
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Zap size={14} className="text-cyan-400" />
                      <span>MLlib Recommendation Job</span>
                    </h4>
                    
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Submit an ALS collaborative filtering computation to calculate new developer matches.
                    </p>

                    <button
                      onClick={runSparkJob}
                      disabled={sparkJobRunning}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/5 border ${
                        sparkJobRunning
                          ? 'bg-cyan-950/20 border-cyan-850 text-cyan-500 cursor-not-allowed'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white border-transparent'
                      }`}
                    >
                      {sparkJobRunning ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Processing Stage {sparkProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          <span>Submit MLlib ALS Job</span>
                        </>
                      )}
                    </button>

                    {/* Recommendations Output */}
                    {recommendationsOutput && (
                      <div className="space-y-2 pt-2 border-t border-slate-900 animate-fadeIn">
                        <span className="text-[9px] font-extrabold text-cyan-400 uppercase tracking-wider block">Job Recommendations:</span>
                        <div className="space-y-2">
                          {recommendationsOutput.users.map((rec, i) => (
                            <div key={i} className="bg-slate-950 border border-slate-900 p-2.5 rounded-xl space-y-0.5">
                              <div className="flex justify-between text-[9px] font-bold text-slate-200">
                                <span>{rec.name}</span>
                                <span className="text-emerald-400">{rec.score}</span>
                              </div>
                              <span className="text-[8px] text-slate-500 block">{rec.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Worker Node Monitor */}
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                    <h4 className="text-xs font-bold text-white">Spark Executor Nodes</h4>
                    
                    <div className="space-y-2">
                      {[
                        { node: 'Worker-01 (10.0.0.10)', cores: '4 Cores', mem: '4.0 GB', state: 'Running' },
                        { node: 'Worker-02 (10.0.0.11)', cores: '4 Cores', mem: '4.0 GB', state: 'Running' },
                        { node: 'Worker-03 (10.0.0.12)', cores: '4 Cores', mem: '4.0 GB', state: 'Running' }
                      ].map((wk, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950 border border-slate-900 p-2.5 rounded-xl text-[9px]">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-300 block">{wk.node}</span>
                            <span className="text-slate-500 block">{wk.cores} / {wk.mem} RAM</span>
                          </div>
                          <span className="text-[8px] font-bold text-cyan-400 bg-cyan-950/20 border border-cyan-900/40 px-2 py-0.5 rounded">
                            {wk.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: HADOOP HDFS & MAPREDUCE */}
            {activeTab === 'hadoop' && (
              <motion.div
                key="hadoop"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Left Panel: HDFS File Browser & Replica details */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* File browser */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Database size={16} className="text-violet-400" />
                      <span>HDFS File System Browser (/user/devconnect/)</span>
                    </h3>

                    <div className="space-y-2">
                      {Object.entries(metrics.hdfsFileSystem).map(([path, details]) => (
                        <button
                          key={path}
                          onClick={() => {
                            setSelectedHdfsFile(path);
                            setMrResult(null);
                            setMrStatus('idle');
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            selectedHdfsFile === path 
                              ? 'bg-violet-600/15 border-violet-500/30 text-violet-300 shadow-lg shadow-violet-950/25' 
                              : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3 text-xs">
                            <FileText size={16} className={selectedHdfsFile === path ? 'text-violet-400' : 'text-slate-500'} />
                            <span className="font-bold font-mono text-[11px] truncate max-w-sm md:max-w-md">{path}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{details.size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MapReduce Task Visualization */}
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Layers size={16} className="text-violet-400" />
                        <span>MapReduce Stage Progression Engine</span>
                      </h3>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 text-violet-400 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                        Stage: {mrStatus.toUpperCase()}
                      </span>
                    </div>

                    {/* Progress Visualizer */}
                    <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl space-y-6">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span className={mrStatus === 'splitting' ? 'text-violet-400 font-extrabold' : ''}>1. SPLIT</span>
                        <ChevronRight size={10} />
                        <span className={mrStatus === 'mapping' ? 'text-violet-400 font-extrabold' : ''}>2. MAP</span>
                        <ChevronRight size={10} />
                        <span className={mrStatus === 'shuffling' ? 'text-violet-400 font-extrabold' : ''}>3. SHUFFLE</span>
                        <ChevronRight size={10} />
                        <span className={mrStatus === 'reducing' ? 'text-violet-400 font-extrabold' : ''}>4. REDUCE</span>
                        <ChevronRight size={10} />
                        <span className={mrStatus === 'completed' ? 'text-emerald-400 font-extrabold animate-pulse' : ''}>5. OUTPUT</span>
                      </div>

                      {/* Bar Loader */}
                      {(mrStatus !== 'idle') && (
                        <div className="w-full bg-slate-900 border border-slate-850 h-2 rounded-full overflow-hidden">
                          <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${mrProgress}%` }}></div>
                        </div>
                      )}

                      {/* MapReduce execution details */}
                      <AnimatePresence mode="wait">
                        {mrResult && mrStatus === 'completed' && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 text-[10px]"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
                              
                              {/* Splitting Details */}
                              <div className="space-y-2 bg-[#04060c] border border-slate-900 p-3 rounded-xl">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-violet-400 block">HDFS splits partition</span>
                                <div className="space-y-1.5">
                                  {mrResult.splits.map((s, idx) => (
                                    <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                                      <span className="text-slate-400 font-bold">{s.id} ({s.dataNode})</span>
                                      <span className="text-slate-300">{s.size} records</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Results Output */}
                              <div className="space-y-2 bg-[#04060c] border border-slate-900 p-3 rounded-xl">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 block">Reduce Output (part-r-00000)</span>
                                <div className="grid grid-cols-2 gap-2 text-[9px]">
                                  {mrResult.reducePhase.slice(0, 6).map((kv, i) => (
                                    <div key={i} className="flex justify-between bg-slate-950 border border-slate-900/50 p-1.5 rounded">
                                      <span className="text-slate-300 font-bold">{kv.key}</span>
                                      <span className="text-emerald-400">{kv.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Right Panel: DataNode status & Trigger Job */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* Job Trigger Panel */}
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                    <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Play size={14} className="text-violet-400" />
                      <span>Run MapReduce Job</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      Submit a MapReduce analysis to aggregate word frequencies on the selected HDFS source file.
                    </p>

                    <button
                      onClick={runMapReduce}
                      disabled={mrStatus !== 'idle' && mrStatus !== 'completed'}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border shadow-lg shadow-violet-600/5 ${
                        mrStatus !== 'idle' && mrStatus !== 'completed'
                          ? 'bg-violet-950/20 border-violet-850 text-violet-500 cursor-not-allowed'
                          : 'bg-violet-600 hover:bg-violet-750 border-transparent text-white'
                      }`}
                    >
                      {mrStatus !== 'idle' && mrStatus !== 'completed' ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Running {mrStatus}...</span>
                        </>
                      ) : (
                        <>
                          <Play size={12} />
                          <span>Run MapReduce Engine</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Block Replication details */}
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                    <h4 className="text-xs font-bold text-white">NameNode & DataNode Registry</h4>
                    
                    <div className="space-y-2">
                      {[
                        { node: 'DataNode-1 (10.0.0.20)', cap: '48% capacity', status: 'Synchronized' },
                        { node: 'DataNode-2 (10.0.0.21)', cap: '39% capacity', status: 'Synchronized' },
                        { node: 'DataNode-3 (10.0.0.22)', cap: '44% capacity', status: 'Synchronized' }
                      ].map((dn, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950 border border-slate-900 p-2.5 rounded-xl text-[9px]">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-350 block">{dn.node}</span>
                            <span className="text-slate-500 block">{dn.cap}</span>
                          </div>
                          <span className="text-[8px] font-bold text-violet-400 bg-violet-950/20 border border-violet-900/40 px-2 py-0.5 rounded">
                            {dn.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>

    </div>
  );
};

export default BigDataConsole;
