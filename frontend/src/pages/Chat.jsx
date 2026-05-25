import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Send, MessageSquare, Award, CornerDownLeft, Loader2, Phone, Video, 
  Paperclip, Smile, X, File, FileText, Image, Download, ShieldAlert,
  Volume2, VolumeX, Mic, MicOff, PhoneOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Lists
  const [connections, setConnections] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingNetwork, setLoadingNetwork] = useState(true);

  // Premium Features state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [callingState, setCallingState] = useState(null); // 'ringing' | 'connected' | null
  const [callType, setCallType] = useState('voice'); // 'voice' | 'video'
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef(null);

  const developerEmojis = ['💻', '🚀', '🔥', '👍', '👾', '✅', '⚠️', '❤️', '👀', '💯', '✨', '☕'];
  const mockFiles = [
    { name: 'App.jsx', type: 'code', size: '2.4 KB' },
    { name: 'architecture_diagram.png', type: 'image', size: '1.2 MB' },
    { name: 'resume_ats_aligned.pdf', type: 'pdf', size: '420 KB' }
  ];

  useEffect(() => {
    fetchConnections();
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  const fetchConnections = async () => {
    try {
      const token = localStorage.getItem('token');
      let connectionList = [];

      if (token && token !== 'mock-guest-token') {
        const res = await axios.get('/connections');
        connectionList = res.data.map(conn => {
          const partner = conn.userId1._id === currentUser?._id ? conn.userId2 : conn.userId1;
          const statuses = ['online', 'away', 'coding', 'in-meeting'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...partner, status: randomStatus };
        });
      } else {
        // Load mock connections
        const mockConns = [
          { _id: 'mock_user_dan', username: 'Dan_The_Coder', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan', bio: 'Tech Lead @ Vercel | Building Next.js', status: 'coding', badge: 'hiring' },
          { _id: 'mock_user_sarah', username: 'Sarah_ShaderArt', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'WebGL Shader Engineer | Berlin', status: 'online', badge: 'open-to-work' },
          { _id: 'mock_user_alex', username: 'Alex_GoDev', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Systems developer | Docker / Kubernetes', status: 'away', badge: 'none' }
        ];
        connectionList = mockConns;
      }

      setConnections(connectionList);
      setLoadingNetwork(false);

      // Check if redirect query exists
      const params = new URLSearchParams(location.search);
      const redirectUserId = params.get('userId');
      if (redirectUserId) {
        const found = connectionList.find(u => u._id === redirectUserId);
        if (found) {
          selectUser(found);
        } else {
          if (!token || token === 'mock-guest-token') {
            const mockDiscover = [
              { _id: 'mock_user_dan', username: 'Dan_The_Coder', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan', bio: 'Tech Lead @ Vercel | San Francisco', status: 'online', badge: 'hiring' },
              { _id: 'mock_user_sarah', username: 'Sarah_ShaderArt', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'WebGL Shader Engineer | Berlin', status: 'online', badge: 'open-to-work' },
              { _id: 'mock_user_alex', username: 'Alex_GoDev', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Architect | London', status: 'online', badge: 'none' },
              { _id: 'mock_user_emma', username: 'Emma_RustAce', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma', bio: 'Systems Engineer | Rust Enthusiast | Berlin', status: 'online', badge: 'open-to-work' }
            ];
            const mockUserFound = mockDiscover.find(u => u._id === redirectUserId);
            if (mockUserFound) {
              selectUser(mockUserFound);
            }
          } else {
            const userRes = await axios.get(`/users/profile/${redirectUserId}`);
            const fetchedUser = { ...userRes.data, status: 'online' };
            selectUser(fetchedUser);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching connections:', err.message);
      setLoadingNetwork(false);
    }
  };

  const selectUser = (user) => {
    setActiveUser(user);
    setMessages([]);
    fetchChatHistory(user._id);

    const token = localStorage.getItem('token');
    if (socket && token && token !== 'mock-guest-token') {
      socket.emit('join_chat', { senderId: currentUser._id, receiverId: user._id });
    }
  };

  const fetchChatHistory = async (targetUserId) => {
    setLoadingHistory(true);
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-guest-token') {
      const mockHistories = {
        'mock_user_dan': [
          { _id: 'm_hist_1', sender: 'mock_user_dan', receiver: currentUser?._id, text: 'Hi! Saw your application. Have you worked with event brokers like Kafka before?', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { _id: 'm_hist_2', sender: currentUser?._id, receiver: 'mock_user_dan', text: 'Yes! I have integrated Socket.io and simulated event streams in React, and am familiar with the Kafka clustering concepts.', createdAt: new Date(Date.now() - 1800000).toISOString() }
        ],
        'mock_user_sarah': [
          { _id: 'm_hist_3', sender: 'mock_user_sarah', receiver: currentUser?._id, text: 'Hey there, your profile summary generated by AI looks very neat!', createdAt: new Date(Date.now() - 7200000).toISOString() }
        ]
      };
      
      const storedLogsKey = `guest_chat_${targetUserId}`;
      const storedLogs = localStorage.getItem(storedLogsKey);
      if (storedLogs) {
        setMessages(JSON.parse(storedLogs));
      } else {
        const defaultHistory = mockHistories[targetUserId] || [];
        localStorage.setItem(storedLogsKey, JSON.stringify(defaultHistory));
        setMessages(defaultHistory);
      }
      setLoadingHistory(false);
      scrollToBottom();
      return;
    }

    try {
      const res = await axios.get(`/chats/history/${targetUserId}`);
      setMessages(res.data);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching chat history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Setup live socket receiver
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (socket && activeUser && token && token !== 'mock-guest-token') {
      const handleIncomingMessage = (message) => {
        const isFromActive = message.sender === activeUser._id || message.receiver === activeUser._id;
        if (isFromActive) {
          setMessages((prev) => [...prev, message]);
        }
      };

      socket.on('receive_message', handleIncomingMessage);

      return () => {
        socket.off('receive_message', handleIncomingMessage);
      };
    }
  }, [socket, activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSimulatedReply = (username, msg) => {
    const text = msg.toLowerCase();
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      return `Hey there! 🚀 Thanks for reaching out. I'm ${username}. I'm currently working on some systems scale-out problems. What kind of stack are you working on?`;
    }
    if (text.includes('kafka') || text.includes('spark') || text.includes('hadoop') || text.includes('big data')) {
      return `Oh, big data! Yes, I love streaming systems. We use Apache Kafka for the core message ingestion broker here. Have you checked out the Big Data Console page? It's really cool to see Spark stream calculations in real-time!`;
    }
    if (text.includes('job') || text.includes('hiring') || text.includes('apply') || text.includes('resume')) {
      return `Absolutely! If you're looking for developer jobs, you should check our Recruiter Pipeline in the Jobs page. Make sure to run your resume through the AI ATS Resume Analyzer tab first to get your match score above 80%!`;
    }
    if (text.includes('react') || text.includes('tailwind') || text.includes('web') || text.includes('frontend')) {
      return `Nice! Frontend design is super important. We restructured our layout to a premium centered grid. If you go to your Profile page, you can even sync your real repositories from GitHub!`;
    }
    if (text.includes('meet') || text.includes('meeting') || text.includes('call') || text.includes('video')) {
      return `Cool, let's hop on a call! We can use Jitsi WebRTC for instant screen share in the Meet chamber tab. Just let me know the code and I'll jump in!`;
    }
    return `That sounds really interesting! DevConnect is a great space to pair program and share tech updates. Let me know if you want to collaborate on a GitHub repository or test some Kafka streams!`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    let finalMsgText = inputText.trim();
    if (attachedFile) {
      finalMsgText = `[File Attachment: ${attachedFile.name} (${attachedFile.size})]` + (finalMsgText ? `\n${finalMsgText}` : '');
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'mock-guest-token' && socket && activeUser) {
      socket.emit('send_message', {
        senderId: currentUser._id,
        receiverId: activeUser._id,
        text: finalMsgText
      });
    } else if (activeUser) {
      const offlineMsg = {
        _id: `guest_msg_${Math.random()}`,
        sender: currentUser._id,
        receiver: activeUser._id,
        text: finalMsgText,
        createdAt: new Date().toISOString()
      };

      const updated = [...messages, offlineMsg];
      setMessages(updated);
      localStorage.setItem(`guest_chat_${activeUser._id}`, JSON.stringify(updated));

      if (activeUser._id.startsWith('mock_user_')) {
        setTimeout(() => {
          const replyText = getSimulatedReply(activeUser.username, finalMsgText);
          const replyMsg = {
            _id: `guest_msg_reply_${Math.random()}`,
            sender: activeUser._id,
            receiver: currentUser._id,
            text: replyText,
            createdAt: new Date().toISOString()
          };
          setMessages(prev => {
            const next = [...prev, replyMsg];
            localStorage.setItem(`guest_chat_${activeUser._id}`, JSON.stringify(next));
            return next;
          });
        }, 1500);
      }
    }

    setInputText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  const handleAttachMockFile = (file) => {
    setAttachedFile(file);
  };

  const insertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  // Simulated peer calls
  const startCall = (type) => {
    setCallType(type);
    setCallingState('ringing');
    setCallDuration(0);
    
    // Simulate connection after 2 seconds
    setTimeout(() => {
      setCallingState('connected');
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }, 2000);
  };

  const endCall = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallingState(null);
    setCallDuration(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'coding': return 'bg-indigo-500';
      case 'in-meeting': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 relative">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-12 h-[80vh]">
        
        {/* LEFT COLUMN: CONNECTIONS LIST */}
        <div className="md:col-span-4 border-r border-slate-850 flex flex-col h-full bg-slate-950/20">
          <div className="p-4 border-b border-slate-850">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare size={14} className="text-indigo-400" />
              <span>Dev Chat Rooms</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-900/40 p-2 space-y-1">
            {loadingNetwork ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading rooms...</p>
            ) : connections.length === 0 ? (
              <p className="text-xs text-slate-500 py-10 text-center">Connect with developers on the Home feed to begin chatting.</p>
            ) : (
              connections.map((conn) => (
                <button
                  key={conn._id}
                  onClick={() => selectUser(conn)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl text-left transition-all ${
                    activeUser?._id === conn._id
                      ? 'bg-indigo-600/15 border border-indigo-500/20'
                      : 'hover:bg-slate-900/30 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conn.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${conn.username}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-slate-700"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0b0f19] ${getStatusColor(conn.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-100 block truncate">{conn.username}</span>
                      {conn.badge && conn.badge !== 'none' && (
                        <span className={`text-[7px] font-extrabold uppercase px-1 rounded ${
                          conn.badge === 'open-to-work' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                        }`}>
                          {conn.badge.split('-')[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{conn.bio || 'Developer member'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: MESSENGER TERMINAL */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#0a0d18] relative">
          {activeUser ? (
            <>
              {/* Terminal Header */}
              <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-950/20">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={activeUser.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser.username}`}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full bg-slate-800 object-cover border border-slate-700"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0b0f19] ${getStatusColor(activeUser.status)}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-slate-100">{activeUser.username}</span>
                      <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded-full font-bold">
                        {activeUser.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-[280px]">{activeUser.bio || 'Wired connection'}</p>
                  </div>
                </div>

                {/* Call & Conference Tools */}
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => startCall('voice')}
                    className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white transition-colors"
                    title="Start Voice Call"
                  >
                    <Phone size={14} />
                  </button>
                  <button 
                    onClick={() => startCall('video')}
                    className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 text-slate-300 hover:text-white transition-colors"
                    title="Start Video Call"
                  >
                    <Video size={14} />
                  </button>
                </div>
              </div>

              {/* Message History logs */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {loadingHistory ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-400 w-8 h-8" />
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.sender === currentUser._id;
                    const isAttachment = msg.text.startsWith('[File Attachment:');
                    
                    let cleanText = msg.text;
                    let attachmentDetails = null;

                    if (isAttachment) {
                      const regex = /^\[File Attachment:\s*([^)]+)\]\n?([\s\S]*)$/;
                      const match = msg.text.match(regex);
                      if (match) {
                        attachmentDetails = match[1];
                        cleanText = match[2];
                      }
                    }

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isSelf
                              ? 'bg-indigo-650 text-white rounded-tr-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {/* Render Attachment Pill if active */}
                          {attachmentDetails && (
                            <div className="mb-2 p-2 bg-slate-950/60 rounded-xl border border-white/5 flex items-center justify-between space-x-3 text-[10px]">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                {attachmentDetails.includes('.png') ? (
                                  <Image size={14} className="text-cyan-400 flex-shrink-0" />
                                ) : (
                                  <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                                )}
                                <span className="font-semibold truncate text-slate-200">{attachmentDetails}</span>
                              </div>
                              <button 
                                onClick={() => alert('Simulating secure sandbox file transmission.')}
                                className="text-slate-400 hover:text-white"
                                title="Download Attachment"
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          )}

                          {cleanText && <p className="whitespace-pre-wrap">{cleanText}</p>}
                          
                          <span className="block text-[8px] text-white/50 text-right mt-1.5">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attached file pre-previewer */}
              {attachedFile && (
                <div className="mx-4 p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px]">
                    <File size={14} className="text-indigo-400" />
                    <span className="font-bold text-slate-200">{attachedFile.name}</span>
                    <span className="text-slate-500">({attachedFile.size})</span>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-500 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 bg-slate-950/20 relative">
                
                {/* Emoji Picker Popover */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-16 right-4 p-3 bg-slate-950 border border-slate-850 rounded-2xl grid grid-cols-6 gap-2 shadow-2xl z-40"
                    >
                      {developerEmojis.map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => insertEmoji(emo)}
                          className="w-8 h-8 hover:bg-slate-900 rounded-xl flex items-center justify-center text-sm transition-colors"
                        >
                          {emo}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center space-x-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-1.5 pl-3">
                  
                  {/* File Attachment Dropdown */}
                  <div className="relative group">
                    <button
                      type="button"
                      className="text-slate-450 hover:text-slate-200 p-1.5"
                      title="Attach File"
                    >
                      <Paperclip size={14} />
                    </button>
                    {/* Hover Attachment Selector */}
                    <div className="absolute bottom-10 left-0 hidden group-hover:block bg-slate-950 border border-slate-850 p-2 rounded-xl space-y-1 shadow-xl z-40 w-44">
                      <p className="text-[8px] font-bold text-slate-500 px-1 uppercase tracking-wider">Dev Templates</p>
                      {mockFiles.map((f, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAttachMockFile(f)}
                          className="w-full text-left text-[10px] text-slate-350 hover:text-white p-1 hover:bg-slate-900 rounded-lg flex items-center justify-between"
                        >
                          <span>{f.name}</span>
                          <span className="text-[8px] text-slate-500">{f.size}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={`Type message to ${activeUser.username}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none border-none py-2"
                  />

                  {/* Emoji Toggle button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-slate-450 hover:text-slate-200 p-1.5"
                  >
                    <Smile size={14} />
                  </button>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10"
                    title="Send Message"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="p-4 bg-indigo-600/5 rounded-full border border-indigo-500/10 text-indigo-400 animate-pulse">
                <MessageSquare size={36} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Select a Chat Room</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Choose a developer connection from the left panel to engage in real-time professional workspace chat.
                </p>
              </div>
            </div>
          )}

          {/* CALLING INTERACTIVE WINDOW OVERLAY */}
          <AnimatePresence>
            {callingState && (
              <motion.div 
                className="absolute inset-0 bg-[#070911]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center space-y-3">
                  <div className="relative inline-block">
                    <img 
                      src={activeUser?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeUser?.username}`}
                      alt="Call User avatar"
                      className={`w-24 h-24 rounded-full bg-slate-800 border-4 border-indigo-500 object-cover ${
                        callingState === 'ringing' ? 'animate-bounce' : ''
                      }`}
                    />
                    <span className="absolute -bottom-1 -right-1 bg-indigo-600 p-2 rounded-full text-white border-2 border-slate-900">
                      {callType === 'video' ? <Video size={16} /> : <Phone size={16} />}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">{activeUser?.username}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                      {callingState === 'ringing' ? 'Ringing Secure Node...' : 'Secure Connection Est.'}
                    </p>
                  </div>
                </div>

                {callingState === 'connected' && (
                  <div className="text-center space-y-2">
                    <p className="text-xl font-mono text-white font-bold">{formatDuration(callDuration)}</p>
                    <div className="flex justify-center space-x-2 text-[10px] bg-slate-900 border border-slate-850 px-4 py-1.5 rounded-full text-slate-400">
                      <Mic className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                      <span>Audio Transmitting Frame</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-center items-center space-x-4">
                  {callingState === 'connected' && (
                    <button
                      onClick={() => navigate(`/meet?room=${Math.floor(100000 + Math.random() * 900000)}`)}
                      className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors flex items-center justify-center shadow-lg shadow-emerald-600/20"
                      title="Promote to Meet conference room"
                    >
                      <Video size={20} />
                    </button>
                  )}
                  <button
                    onClick={endCall}
                    className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors flex items-center justify-center shadow-lg shadow-rose-600/20"
                    title="Disconnect Session"
                  >
                    <PhoneOff size={20} />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
};

export default Chat;
