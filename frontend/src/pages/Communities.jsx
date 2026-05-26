import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { 
  Terminal, Hash, Send, Users, Cpu, ShieldAlert, 
  Code, MessageCircle, Gamepad2, Sparkles, MessageSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Communities = () => {
  const { user: currentUser } = useAuth();
  
  // Servers list
  const servers = [
    { id: 'srv_ai', name: 'AI/ML Community', icon: <Cpu size={20} className="text-cyan-400" /> },
    { id: 'srv_web', name: 'Web Dev Hub', icon: <Code size={20} className="text-indigo-400" /> },
    { id: 'srv_os', name: 'Open Source Lounge', icon: <Sparkles size={20} className="text-emerald-400" /> },
    { id: 'srv_game', name: 'Game Dev Suite', icon: <Gamepad2 size={20} className="text-rose-400" /> }
  ];

  const [activeServer, setActiveServer] = useState(servers[0]);
  const [activeChannel, setActiveChannel] = useState('#general');
  const [inputText, setInputText] = useState('');
  
  // Channels for servers
  const channels = ['#general', '#showcase', '#code-review', '#jobs-talk'];

  // Member presence mock list
  const members = [
    { id: 'm1', username: 'Dan_The_Coder', status: 'coding', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan', bio: 'Tech Lead @ Vercel' },
    { id: 'm2', username: 'Sarah_ShaderArt', status: 'online', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'Three.js Engineer' },
    { id: 'm3', username: 'Alex_GoDev', status: 'away', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Engineer' },
    { id: 'm4', username: 'Recruiter_OpenAI', status: 'in-meeting', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Recruiter', bio: 'Hiring for AI Systems', badge: 'hiring' },
  ];

  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);

  // Default fallback chat logs for guest mode
  const defaultChatLogs = {
    'srv_ai_#general': [
      { _id: 'msg_1', username: 'Dan_The_Coder', text: 'Has anyone checked out the new model release parameters? The token weights look incredibly optimized.', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { _id: 'msg_2', username: 'Recruiter_OpenAI', text: 'Hey Dan, we are actually looking for developers experienced with weight optimizations. Feel free to peek at our job listings! 🚀', createdAt: new Date(Date.now() - 1800000).toISOString() },
    ],
    'srv_web_#general': [
      { _id: 'msg_3', username: 'Sarah_ShaderArt', text: 'Just updated three.js shader layers. WebGL drawing calls dropped by 40%!', createdAt: new Date(Date.now() - 7200000).toISOString() }
    ]
  };

  const getActiveChatKey = () => `${activeServer.id}_${activeChannel}`;

  // Fetch message history and join websocket channel room
  useEffect(() => {
    const token = localStorage.getItem('token');
    const chatKey = getActiveChatKey();

    if (token && token !== 'mock-guest-token') {
      // Fetch channel messages from backend database
      axios.get(`/communities/messages/${activeServer.id}/${activeChannel.replace('#', '')}`)
        .then(res => {
          setMessages(res.data);
        })
        .catch(err => {
          console.warn('Failed to load community message history:', err.message);
          setMessages([]);
        });

      // Join socket room
      if (socket) {
        socket.emit('join_channel', { serverId: activeServer.id, channel: activeChannel });
      }
    } else {
      // Load from local storage or default cached messages
      const stored = localStorage.getItem(`guest_comm_${chatKey}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const fallback = defaultChatLogs[chatKey] || [];
        localStorage.setItem(`guest_comm_${chatKey}`, JSON.stringify(fallback));
        setMessages(fallback);
      }
    }
  }, [activeServer, activeChannel, socket]);

  // Setup socket listener for incoming channel messages
  useEffect(() => {
    if (socket) {
      const handleIncomingChannelMessage = (message) => {
        // Confirm message belongs to active server/channel room
        const activeChanClean = activeChannel;
        if (message.serverId === activeServer.id && message.channel === activeChanClean) {
          setMessages((prev) => [...prev, message]);
        }
      };

      socket.on('receive_channel_message', handleIncomingChannelMessage);

      return () => {
        socket.off('receive_channel_message', handleIncomingChannelMessage);
      };
    }
  }, [socket, activeServer, activeChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const chatKey = getActiveChatKey();
    const token = localStorage.getItem('token');

    if (token && token !== 'mock-guest-token' && socket) {
      socket.emit('send_channel_message', {
        serverId: activeServer.id,
        channel: activeChannel,
        senderId: currentUser._id,
        text: inputText.trim()
      });
    } else {
      // Guest mode: save locally
      const guestMsg = {
        _id: `guest_comm_msg_${Math.random()}`,
        username: currentUser?.username || 'GuestDev',
        text: inputText.trim(),
        createdAt: new Date().toISOString()
      };

      const updated = [...messages, guestMsg];
      setMessages(updated);
      localStorage.setItem(`guest_comm_${chatKey}`, JSON.stringify(updated));
    }

    setInputText('');
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'online': return 'online';
      case 'away': return 'away';
      case 'coding': return 'coding ⚡';
      case 'in-meeting': return 'in meeting 🎥';
      default: return 'offline';
    }
  };

  const activeMessages = chatLogs[getActiveChatKey()] || [];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-12 h-[80vh]">
        
        {/* COLUMN 1: SERVERS COLUMN BAR (Discord Icon List) */}
        <div className="hidden sm:flex md:col-span-1 bg-slate-950/60 border-r border-slate-900 flex-col items-center py-4 space-y-4">
          {servers.map((srv) => (
            <button
              key={srv.id}
              onClick={() => setActiveServer(srv)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                activeServer.id === srv.id
                  ? 'bg-indigo-600 border border-indigo-500 shadow-lg shadow-indigo-600/20 rounded-xl'
                  : 'bg-slate-900/80 border border-white/5 hover:bg-slate-850 hover:rounded-xl'
              }`}
              title={srv.name}
            >
              {srv.icon}
            </button>
          ))}
        </div>

        {/* COLUMN 2: SERVER CHANNELS DIRECTORY */}
        <div className="md:col-span-3 border-r border-slate-900 bg-slate-950/20 flex flex-col h-full">
          <div className="p-4 border-b border-slate-900/60">
            <h3 className="font-bold text-xs text-white truncate uppercase tracking-wider">{activeServer.name}</h3>
          </div>

          <div className="flex-1 p-3.5 space-y-1">
            {channels.map((chan) => (
              <button
                key={chan}
                onClick={() => setActiveChannel(chan)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                  activeChannel === chan
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Hash size={14} className="text-slate-500" />
                <span>{chan.replace('#', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 3: MIDDLE FEED CHAT PANEL */}
        <div className="md:col-span-5 flex flex-col h-full bg-[#0a0d18] border-r border-slate-900">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-900/60 flex items-center space-x-2">
            <Hash size={16} className="text-indigo-400" />
            <span className="font-bold text-sm text-slate-100">{activeChannel.replace('#', '')}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg._id || msg.id} className="flex space-x-3.5 items-start">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.username}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full bg-slate-700 mt-0.5 object-cover"
                />
                <div className="text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200">{msg.username}</span>
                    <span className="text-[9px] text-slate-500">{msg.time || (msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</span>
                  </div>
                  <p className="text-slate-400 mt-1.5 leading-relaxed bg-slate-900/40 border border-slate-900 p-2.5 rounded-xl">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-700 animate-pulse" />
                <p className="text-xs text-slate-500 font-semibold">Welcome to the beginning of the #{activeChannel.replace('#', '')} channel!</p>
              </div>
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950/25">
            <div className="flex items-center space-x-2 bg-slate-900/60 rounded-2xl border border-slate-800 p-1 pl-3.5">
              <input
                type="text"
                placeholder={`Message in ${activeChannel}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none border-none py-2"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-770 text-white p-2 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>

        {/* COLUMN 4: RIGHT MEMBERS PRESENCE LIST */}
        <div className="md:col-span-3 bg-slate-950/20 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-900/60">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Users size={14} className="text-indigo-400" />
              <span>Members ({members.length})</span>
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-start space-x-2.5 bg-slate-900/25 p-2 rounded-xl border border-slate-850">
                <div className="relative flex-shrink-0">
                  <img
                    src={member.avatar}
                    alt="Member"
                    className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 object-cover"
                  />
                  {/* Status Indicator circle */}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0b0f19] flex items-center justify-center ${getStatusColor(member.status)}`} />
                </div>

                <div className="text-[10px] min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-slate-200 block truncate">{member.username}</span>
                    {member.badge === 'hiring' && (
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-extrabold uppercase px-1 rounded text-[7px]">
                        Recruiter
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-500 block uppercase font-bold mt-0.5">{getStatusLabel(member.status)}</span>
                  <p className="text-[9px] text-slate-400 truncate mt-0.5">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Communities;
