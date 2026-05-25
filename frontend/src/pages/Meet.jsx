import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Video, Key, Users, Check, X, ShieldAlert, Play, LogOut, Monitor, Mic, 
  MicOff, VideoOff, LayoutGrid, Calendar, Plus, ExternalLink, Code2, Sparkles,
  Volume2, VolumeX, MessageSquare, Send, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Meet = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('conference'); // 'conference' | 'schedule'
  const [code, setCode] = useState('');
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [connections, setConnections] = useState([]);
  const [invited, setInvited] = useState(false);

  // Simulated conferencing states
  const [callMode, setCallMode] = useState('simulated'); // 'simulated' | 'jitsi'
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Scheduled meetings
  const [scheduledMeets, setScheduledMeets] = useState([
    { id: 'm_sc_1', title: 'Supabase Architecture Walkthrough', date: '2026-05-28', time: '14:00', type: 'Code Review', code: '284019' },
    { id: 'm_sc_2', title: 'Mock Technical System Design', date: '2026-05-30', time: '10:00', type: 'Interview', code: '891043' }
  ]);

  // Schedule meet form
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState('Code Review');

  // Chat/Logs in Meet
  const [meetLogs, setMeetLogs] = useState([
    { user: 'Dan_The_Coder', text: 'Hey guys! Just set up the code review repo.' },
    { user: 'Sarah_ShaderArt', text: 'Perfect, loading my local visualizer.' }
  ]);
  const [meetInput, setMeetInput] = useState('');

  // Check if room query parameter exists (e.g. clicked join from notification)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.length === 6) {
      setCode(roomParam);
      setMeetingStarted(true);
    }
    fetchConnections();
  }, [location]);

  const fetchConnections = async () => {
    try {
      const res = await axios.get('/connections');
      const connectionList = res.data.map(conn => 
        conn.userId1._id === user?._id ? conn.userId2 : conn.userId1
      );
      setConnections(connectionList);
    } catch (err) {
      console.error('Error fetching connections:', err.message);
    }
  };

  const generateCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setCode(randomCode);
    setMeetingStarted(true);
    setInvited(false);
  };

  const handleJoin = () => {
    if (code.length === 6 && /^\d+$/.test(code)) {
      setMeetingStarted(true);
    } else {
      alert('Please enter a valid 6-digit numeric room code.');
    }
  };

  const handleInviteConnections = () => {
    if (!socket || connections.length === 0 || !meetingStarted) return;

    const connectionIds = connections.map(c => c._id);
    
    // Broadcast invite via WebSockets
    socket.emit('share_meet', {
      senderUsername: user.username,
      roomCode: code,
      connectionsList: connectionIds
    });

    setInvited(true);
  };

  const handleLeaveMeet = () => {
    setMeetingStarted(false);
    setCode('');
    setInvited(false);
  };

  const handleScheduleMeet = (e) => {
    e.preventDefault();
    if (!newTitle || !newDate || !newTime) return;

    const newObj = {
      id: `meet_sched_${Math.random()}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      type: newType,
      code: Math.floor(100000 + Math.random() * 900000).toString()
    };

    setScheduledMeets([...scheduledMeets, newObj]);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
  };

  const handleSendMeetMsg = (e) => {
    e.preventDefault();
    if (!meetInput.trim()) return;
    setMeetLogs([...meetLogs, { user: user.username, text: meetInput.trim() }]);
    setMeetInput('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* HEADER NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Video className="text-indigo-400 w-6 h-6" />
            <span>Developer Conference Meet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Host pair programming sessions, conduct developer meetings, and review branches live.</p>
        </div>

        <div className="flex space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-900">
          <button
            onClick={() => setActiveTab('conference')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'conference'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Video size={13} />
            <span>Active Meet</span>
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            <Calendar size={13} />
            <span>Schedule Workspace</span>
          </button>
        </div>
      </div>

      {activeTab === 'conference' ? (
        <>
          {!meetingStarted ? (
            <motion.div 
              className="max-w-xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-center">
                <div className="p-4 bg-indigo-600/10 rounded-3xl text-indigo-400 border border-indigo-500/15 relative group">
                  <div className="absolute inset-0 bg-indigo-550/15 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Video className="w-12 h-12 stroke-[2] relative z-10" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">DevConnect Virtual Meet Lobby</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Launch instant video conferencing rooms to pair program, conduct mock interviews, or catch up with connection developers.
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={generateCode}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-3.5 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
                >
                  <Play size={13} fill="white" />
                  <span>Create Instant Meet Chamber</span>
                </button>

                <div className="flex items-center justify-center space-x-4 my-2 text-slate-650 text-xs font-bold">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span>OR</span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit room code..."
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full glass-input rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white text-center font-mono tracking-widest font-bold"
                    />
                    <Key className="absolute left-3.5 top-4.5 text-slate-500 w-4 h-4" />
                  </div>
                  <button
                    onClick={handleJoin}
                    className="bg-slate-905 hover:bg-indigo-600/10 text-slate-200 hover:text-indigo-400 border border-slate-800 hover:border-indigo-500/20 font-bold py-3.5 px-6 rounded-2xl text-xs transition-all"
                  >
                    Join Chamber
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              
              {/* Call Controls panel */}
              <div className="glass-panel p-4 rounded-2xl border border-slate-850 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
                  <p className="text-xs text-slate-300 flex items-center space-x-1.5">
                    <span>Active Session:</span>
                    <span className="font-mono font-bold bg-slate-900 border border-slate-800 text-indigo-400 px-2.5 py-1 rounded-lg">
                      {code}
                    </span>
                  </p>
                  <div className="h-4 w-px bg-slate-800"></div>
                  <div className="flex space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-900">
                    <button
                      onClick={() => setCallMode('simulated')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        callMode === 'simulated' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Dev Dashboard
                    </button>
                    <button
                      onClick={() => setCallMode('jitsi')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                        callMode === 'jitsi' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Live Jitsi WebRTC
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {connections.length > 0 && (
                    <button
                      onClick={handleInviteConnections}
                      disabled={invited}
                      className={`font-semibold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 transition-all ${
                        invited
                          ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
                      }`}
                    >
                      <Users size={12} />
                      <span>{invited ? 'Invites Dispatched' : 'Invite Network'}</span>
                    </button>
                  )}
                  <button
                    onClick={handleLeaveMeet}
                    className="bg-slate-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 font-semibold py-2 px-4 rounded-xl text-xs transition-colors flex items-center space-x-1.5"
                  >
                    <LogOut size={12} />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Conference view container */}
              {callMode === 'jitsi' ? (
                <div className="rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-950 h-[70vh]">
                  <iframe
                    src={`https://meet.jit.si/DevConnectRoom-${code}#config.prejoinPageEnabled=false&userInfo.displayName="${user.username}"`}
                    allow="camera; microphone; fullscreen; display-capture"
                    style={{ width: '100%', height: '100%', border: '0px' }}
                    title={`DevConnect Meet - ${code}`}
                  ></iframe>
                </div>
              ) : (
                /* HIGH FIDELITY SIMULATED DEVELOPMENT CONFERENCE ROOM */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[70vh]">
                  
                  {/* Left Side: Video Squares Grid */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-4 h-full">
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      
                      {/* Grid 1: Local User */}
                      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 relative bg-slate-950/45 flex items-center justify-center">
                        {isCamOff ? (
                          <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center text-slate-500 text-lg font-bold">
                              {user.username.substring(0,2).toUpperCase()}
                            </div>
                            <span className="text-[10px] text-slate-500 block font-bold">CAMERA INACTIVE</span>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            {/* Simulated Camera Video Stream view */}
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                              <img 
                                src={user.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                                alt="Your profile stream"
                                className="w-24 h-24 rounded-full border border-indigo-500/20 bg-slate-950"
                              />
                            </div>
                            {/* Speaking visualizer waves */}
                            {!isMuted && (
                              <div className="absolute bottom-12 left-4 flex items-end space-x-0.5">
                                <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce"></span>
                                <span className="w-1 h-5 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-white/5 py-1 px-2.5 rounded-lg text-[9px] font-bold flex items-center space-x-1.5">
                          <span>{user.username} (You)</span>
                          {isMuted && <MicOff size={10} className="text-rose-400" />}
                        </div>
                      </div>

                      {/* Grid 2: Dan Coder sharing code */}
                      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 relative bg-slate-950/45 flex flex-col">
                        <div className="flex-1 bg-slate-950 p-3 font-mono text-[9px] text-slate-300 overflow-hidden relative">
                          <div className="absolute inset-0 bg-indigo-950/5 pointer-events-none"></div>
                          <div className="flex items-center space-x-1 text-slate-500 pb-1.5 mb-1.5 border-b border-slate-900">
                            <Code2 size={10} className="text-cyan-400" />
                            <span>dan_coder / index.js (Screen Share)</span>
                          </div>
                          <p className="text-indigo-400 font-bold">import React, &#123; useState &#125; from 'react';</p>
                          <p className="text-slate-400">const DevChannel = () =&gt; &#123;</p>
                          <p className="text-slate-400">&nbsp;&nbsp;const [online, setOnline] = useState(true);</p>
                          <p className="text-slate-500">&nbsp;&nbsp;// testing state variables</p>
                          <p className="text-emerald-400">&nbsp;&nbsp;return &lt;div className="presence"&gt;⚡ Online&lt;/div&gt;;</p>
                          <p className="text-slate-400">&#125;;</p>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-white/5 py-1 px-2.5 rounded-lg text-[9px] font-bold flex items-center space-x-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                          <span>Dan_The_Coder (Screen)</span>
                        </div>
                      </div>

                      {/* Grid 3: Sarah ShaderArt */}
                      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 relative bg-slate-950/45 flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <img 
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=Sarah"
                            alt="Sarah stream"
                            className="w-16 h-16 rounded-full border border-indigo-500/20 bg-slate-900 mx-auto"
                          />
                          <div className="flex items-center justify-center space-x-0.5">
                            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-white/5 py-1 px-2.5 rounded-lg text-[9px] font-bold flex items-center space-x-1.5">
                          <span>Sarah_ShaderArt</span>
                        </div>
                      </div>

                      {/* Grid 4: Alex GoDev */}
                      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-850 relative bg-slate-950/45 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <img 
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=Alex"
                            alt="Alex stream"
                            className="w-16 h-16 rounded-full border border-slate-800 bg-slate-900 mx-auto grayscale"
                          />
                          <span className="text-[8px] font-bold text-slate-500 px-1 bg-slate-900 border border-slate-850 rounded">CAM OFF</span>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-white/5 py-1 px-2.5 rounded-lg text-[9px] font-bold flex items-center space-x-1.5">
                          <span>Alex_GoDev</span>
                          <MicOff size={10} className="text-slate-500" />
                        </div>
                      </div>

                    </div>

                    {/* Bottom Toolbar Controller */}
                    <div className="glass-panel p-3 rounded-2xl border border-slate-850 flex items-center justify-center space-x-4 bg-slate-950/40">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isMuted 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : 'bg-slate-900 hover:bg-slate-850 border-white/5 text-slate-300'
                        }`}
                        title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                      >
                        {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
                      </button>

                      <button 
                        onClick={() => setIsCamOff(!isCamOff)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isCamOff 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : 'bg-slate-900 hover:bg-slate-850 border-white/5 text-slate-300'
                        }`}
                        title={isCamOff ? 'Turn Cam On' : 'Turn Cam Off'}
                      >
                        {isCamOff ? <VideoOff size={15} /> : <Video size={15} />}
                      </button>

                      <button 
                        onClick={() => setIsSharing(!isSharing)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isSharing 
                            ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' 
                            : 'bg-slate-900 hover:bg-slate-850 border-white/5 text-slate-300'
                        }`}
                        title={isSharing ? 'Stop Screen Share' : 'Share My Screen'}
                      >
                        <Monitor size={15} />
                      </button>

                      <button 
                        onClick={() => alert('Simulating workspace Recording stream.')}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-white/5 text-slate-300"
                        title="Record Video Conference"
                      >
                        <Radio size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Right Side: Meet Sidebar (Participants + Meet Chat logs) */}
                  <div className="md:col-span-4 flex flex-col justify-between border border-slate-850 rounded-2xl h-full bg-[#0a0d18] overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-850 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                        <Users size={12} className="text-indigo-400" />
                        <span>Chamber Panel</span>
                      </h4>
                      <span className="bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded text-[8px] font-bold text-indigo-400">
                        4 Active
                      </span>
                    </div>

                    {/* Participants List section */}
                    <div className="p-3 border-b border-slate-900 space-y-2 max-h-48 overflow-y-auto">
                      <p className="text-[8px] font-extrabold uppercase text-slate-500 pl-1 tracking-wider">Speakers</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-900/40 rounded-lg">
                          <span className="text-indigo-300 font-bold">{user.username} (You)</span>
                          <span className="text-[8px] text-slate-500">Muted: {isMuted ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-900/40 rounded-lg">
                          <span className="text-slate-300">Dan_The_Coder</span>
                          <span className="text-[8px] text-cyan-400 font-bold">Sharing Screen</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-900/40 rounded-lg">
                          <span className="text-slate-300">Sarah_ShaderArt</span>
                          <span className="text-[8px] text-emerald-400 font-bold">Speaking</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] p-1.5 hover:bg-slate-900/40 rounded-lg">
                          <span className="text-slate-300">Alex_GoDev</span>
                          <span className="text-[8px] text-slate-500">Muted</span>
                        </div>
                      </div>
                    </div>

                    {/* Meet Live text log */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                      <p className="text-[8px] font-extrabold uppercase text-slate-500 pl-1 tracking-wider mb-1">Meet Log Chat</p>
                      <div className="space-y-2.5">
                        {meetLogs.map((log, idx) => (
                          <div key={idx} className="text-[10px] bg-slate-950/40 border border-slate-900 p-2 rounded-xl">
                            <span className="font-bold text-indigo-400 block">{log.user}</span>
                            <p className="text-slate-300 mt-0.5 leading-normal">{log.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat send input */}
                    <form onSubmit={handleSendMeetMsg} className="p-3 border-t border-slate-855 bg-slate-950/20">
                      <div className="flex items-center bg-slate-900/60 rounded-xl border border-slate-850 p-1 pr-2">
                        <input
                          type="text"
                          placeholder="Type message in meet..."
                          value={meetInput}
                          onChange={(e) => setMeetInput(e.target.value)}
                          className="flex-1 bg-transparent text-[10px] text-slate-300 focus:outline-none border-none py-1.5 px-2"
                        />
                        <button
                          type="submit"
                          className="bg-indigo-650 hover:bg-indigo-700 text-white p-1.5 rounded-lg"
                        >
                          <Send size={10} />
                        </button>
                      </div>
                    </form>

                  </div>

                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* SCHEDULE TAB VIEW */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Create new schedule form */}
          <div className="md:col-span-5">
            <form onSubmit={handleScheduleMeet} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center space-x-1.5">
                <Plus size={16} className="text-indigo-400" />
                <span>Schedule New Session</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-450 mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Codebase Review v2.0"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-455 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-455 mb-1">Time</label>
                    <input
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-455 mb-1">Session Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                  >
                    <option value="Code Review">Code Review & Review</option>
                    <option value="Interview">Technical Interview</option>
                    <option value="Casual Pairing">Casual Pair Coding</option>
                    <option value="System Design">System Architecture Design</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-705 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10"
              >
                Schedule Session Instance
              </button>
            </form>
          </div>

          {/* Scheduled Meetings list */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-bold text-xs text-slate-350 uppercase tracking-wider pl-1">Scheduled Chambers</h3>

            <div className="space-y-3.5">
              {scheduledMeets.map((meet) => (
                <div 
                  key={meet.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-850 hover:border-indigo-500/15 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        meet.type === 'Interview' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15'
                      }`}>
                        {meet.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {meet.code}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-100">{meet.title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">{meet.date} at {meet.time}</p>
                  </div>

                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setCode(meet.code);
                        setMeetingStarted(true);
                        setActiveTab('conference');
                      }}
                      className="bg-indigo-600/10 hover:bg-indigo-650 text-indigo-400 hover:text-white border border-indigo-500/20 font-bold py-2 px-4 rounded-xl text-[10px] transition-colors flex-1 sm:flex-initial text-center flex items-center justify-center space-x-1"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Start Chamber</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meet.code);
                        alert(`Meeting passcode ${meet.code} saved to clipboard.`);
                      }}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2 px-3 rounded-xl text-[10px] transition-colors"
                    >
                      Invite Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Meet;
