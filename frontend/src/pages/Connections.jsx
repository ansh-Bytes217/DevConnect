import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, UserPlus, UserCheck, UserMinus, Search, MessageSquare, 
  Clock, Check, X, Filter, MapPin, Code 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Connections = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('network'); // 'network', 'pending', 'discover'

  // Data states
  const [connections, setConnections] = useState([]);
  const [pendingIncoming, setPendingIncoming] = useState([]);
  const [pendingOutgoing, setPendingOutgoing] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterSkill, setFilterSkill] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    fetchNetworkData();
  }, [activeTab]);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'network') {
        const res = await axios.get('/connections');
        setConnections(res.data);
      } else if (activeTab === 'pending') {
        const res = await axios.get('/connections/pending');
        setPendingIncoming(res.data.incoming);
        setPendingOutgoing(res.data.outgoing);
      } else if (activeTab === 'discover') {
        const res = await axios.get(`/users/search?q=${searchQuery}`);
        // Filter out existing connections
        const existingConnIds = new Set(currentUser?.connections || []);
        let filtered = res.data.filter(u => !existingConnIds.has(u._id));
        
        // Apply Location/Skills Filter client-side
        if (filterLocation !== 'All') {
          filtered = filtered.filter(u => u.bio?.toLowerCase().includes(filterLocation.toLowerCase()));
        }
        if (filterSkill !== 'All') {
          filtered = filtered.filter(u => u.skills?.some(s => s.name.toLowerCase() === filterSkill.toLowerCase()));
        }

        setDiscoverUsers(filtered);

        // Fetch outgoing pending requests to match status
        const pendingRes = await axios.get('/connections/pending');
        const outgoingIds = pendingRes.data.outgoing.map(req => req.userId2._id);
        setSentRequests(new Set(outgoingIds));
      }
    } catch (err) {
      console.error('Error fetching network logs, falling back to mock lists:', err.message);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockConns = [
      {
        _id: 'conn_1',
        status: 'accepted',
        userId1: currentUser,
        userId2: { _id: 'mock_user_dan', username: 'Dan_The_Coder', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan', bio: 'Tech Lead @ Vercel | Building Next.js', skills: [{ name: 'React' }, { name: 'Node.js' }], badge: 'hiring' }
      },
      {
        _id: 'conn_2',
        status: 'accepted',
        userId1: { _id: 'mock_user_sarah', username: 'Sarah_ShaderArt', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'Creative Frontend Engineer | Three.js enthusiast', skills: [{ name: 'WebGL' }, { name: 'JavaScript' }], badge: 'open-to-work' },
        userId2: currentUser
      }
    ];

    const mockIncoming = [
      {
        _id: 'conn_pending_1',
        status: 'pending',
        userId1: { _id: 'mock_user_alex', username: 'Alex_GoDev', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Systems developer | Docker / Kubernetes', skills: [{ name: 'Go' }, { name: 'Docker' }], badge: 'none' },
        userId2: currentUser
      }
    ];

    const mockDiscover = [
      { _id: 'mock_user_dan', username: 'Dan_The_Coder', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan', bio: 'Tech Lead @ Vercel | San Francisco', skills: [{ name: 'React' }, { name: 'Node.js' }], badge: 'hiring' },
      { _id: 'mock_user_sarah', username: 'Sarah_ShaderArt', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'WebGL Shader Engineer | Berlin', skills: [{ name: 'WebGL' }, { name: 'JavaScript' }], badge: 'open-to-work' },
      { _id: 'mock_user_alex', username: 'Alex_GoDev', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Architect | London', skills: [{ name: 'Go' }, { name: 'Docker' }], badge: 'none' }
    ];

    if (activeTab === 'network') {
      const storedConns = localStorage.getItem('mock_connections');
      setConnections(storedConns ? JSON.parse(storedConns) : mockConns);
    } else if (activeTab === 'pending') {
      const storedIncoming = localStorage.getItem('mock_pending_incoming');
      setPendingIncoming(storedIncoming ? JSON.parse(storedIncoming) : mockIncoming);
      setPendingOutgoing([]);
    } else if (activeTab === 'discover') {
      let filtered = mockDiscover.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      if (filterLocation !== 'All') {
        filtered = filtered.filter(u => u.bio.toLowerCase().includes(filterLocation.toLowerCase()));
      }
      if (filterSkill !== 'All') {
        filtered = filtered.filter(u => u.skills?.some(s => s.name.toLowerCase() === filterSkill.toLowerCase()));
      }
      setDiscoverUsers(filtered);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNetworkData();
  };

  const handleSendRequest = async (targetUserId) => {
    if (localStorage.getItem('token') === 'mock-guest-token' || !currentUser?.connections) {
      setSentRequests(new Set([...sentRequests, targetUserId]));
      addToast('Connection invitation sent', 'success');
      return;
    }

    try {
      await axios.post('/connections/add', { userId2: targetUserId });
      setSentRequests(new Set([...sentRequests, targetUserId]));
      addToast('Connection invitation sent', 'success');
    } catch (err) {
      console.error('Error sending connection request:', err.message);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedIncoming = localStorage.getItem('mock_pending_incoming');
      const incoming = storedIncoming ? JSON.parse(storedIncoming) : [
        {
          _id: 'conn_pending_1',
          status: 'pending',
          userId1: { _id: 'mock_user_alex', username: 'Alex_GoDev', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Engineer', skills: [{ name: 'Go' }, { name: 'Docker' }], badge: 'none' },
          userId2: currentUser
        }
      ];
      const targetReq = incoming.find(req => req._id === connectionId);
      if (targetReq) {
        const storedConns = localStorage.getItem('mock_connections');
        const currentConns = storedConns ? JSON.parse(storedConns) : [
          {
            _id: 'conn_1',
            status: 'accepted',
            userId1: currentUser,
            userId2: { _id: 'mock_user_dan', username: 'Dan_The_Coder', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan', bio: 'Tech Lead @ Vercel | Building Next.js', skills: [{ name: 'React' }, { name: 'Node.js' }], badge: 'hiring' }
          },
          {
            _id: 'conn_2',
            status: 'accepted',
            userId1: { _id: 'mock_user_sarah', username: 'Sarah_ShaderArt', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'Creative Frontend Engineer | Three.js enthusiast', skills: [{ name: 'WebGL' }, { name: 'JavaScript' }], badge: 'open-to-work' },
            userId2: currentUser
          }
        ];
        const newConn = {
          _id: `conn_${Math.random()}`,
          status: 'accepted',
          userId1: targetReq.userId1,
          userId2: currentUser
        };
        localStorage.setItem('mock_connections', JSON.stringify([...currentConns, newConn]));
        localStorage.setItem('mock_pending_incoming', JSON.stringify(incoming.filter(req => req._id !== connectionId)));
        addToast('Connection accepted', 'success');
      }
      fetchNetworkData();
      return;
    }

    try {
      await axios.post('/connections/accept', { connectionId });
      addToast('Connection accepted', 'success');
      fetchNetworkData();
    } catch (err) {
      console.error('Error accepting connection request:', err.message);
    }
  };

  const handleDeclineRequest = async (connectionId) => {
    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedConns = localStorage.getItem('mock_connections');
      if (storedConns) {
        const conns = JSON.parse(storedConns).filter(c => c._id !== connectionId);
        localStorage.setItem('mock_connections', JSON.stringify(conns));
      }
      const storedIncoming = localStorage.getItem('mock_pending_incoming');
      if (storedIncoming) {
        const incoming = JSON.parse(storedIncoming).filter(req => req._id !== connectionId);
        localStorage.setItem('mock_pending_incoming', JSON.stringify(incoming));
      }
      addToast('Connection declined', 'info');
      fetchNetworkData();
      return;
    }

    try {
      await axios.post('/connections/decline', { connectionId });
      addToast('Connection declined', 'info');
      fetchNetworkData();
    } catch (err) {
      console.error('Error declining connection:', err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      
      {/* TABS HEADERS */}
      <div className="flex space-x-1 p-1 bg-slate-900/50 rounded-2xl border border-white/5 max-w-md">
        <button
          onClick={() => setActiveTab('network')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'network' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={14} />
          <span>My Network</span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock size={14} />
          <span>Requests</span>
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'discover' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus size={14} />
          <span>Discover</span>
        </button>
      </div>

      {/* TABS BODY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl min-h-[50vh]">
        
        {/* TAB 1: MY NETWORK */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="text-indigo-400" size={20} />
              <span>Connected Developers ({connections.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn) => {
                const targetUser = conn.userId1?._id === currentUser?._id ? conn.userId2 : conn.userId1;
                if (!targetUser) return null;
                return (
                  <motion.div
                    key={conn._id}
                    className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 hover:border-slate-800 rounded-2xl transition-all"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex space-x-3.5 items-center">
                      <Link to={`/profile/${targetUser._id}`}>
                        <img
                          src={targetUser.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.username}`}
                          alt={targetUser.username}
                          className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 object-cover"
                        />
                      </Link>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <Link to={`/profile/${targetUser._id}`} className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition-colors">
                            {targetUser.username}
                          </Link>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{targetUser.bio || 'Developer member'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        to={`/chat?userId=${targetUser._id}`}
                        className="p-2 bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 rounded-xl transition-colors border border-white/5"
                        title="Message"
                      >
                        <MessageSquare size={14} />
                      </Link>
                      <button
                        onClick={() => handleDeclineRequest(conn._id)}
                        className="p-2 bg-slate-800 hover:bg-rose-500/15 text-slate-450 hover:text-rose-450 rounded-xl transition-colors border border-white/5"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS */}
        {activeTab === 'pending' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">
                Incoming Requests ({pendingIncoming.length})
              </h4>
              {pendingIncoming.map((req) => (
                <div key={req._id} className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-white/5 rounded-2xl">
                  <div className="flex space-x-3">
                    <Link to={`/profile/${req.userId1?._id}`}>
                      <img
                        src={req.userId1?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.userId1?.username}`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full bg-slate-700 object-cover"
                      />
                    </Link>
                    <div>
                      <Link to={`/profile/${req.userId1?._id}`} className="font-semibold text-xs text-slate-200 hover:text-indigo-400">
                        {req.userId1?.username}
                      </Link>
                      <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">{req.userId1?.bio}</p>
                    </div>
                  </div>

                  <div className="flex space-x-1.5">
                    <button
                      onClick={() => handleAcceptRequest(req._id)}
                      className="bg-indigo-600 hover:bg-indigo-750 text-white p-2 rounded-xl transition-colors"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(req._id)}
                      className="bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-450 p-2 rounded-xl transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISCOVER DEVELOPERS WITH FILTER SIDEBAR */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            
            {/* Search and Filters Toggle row */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-1 max-w-md space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search developers by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 border border-white/5"
                  />
                  <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-5 rounded-2xl text-xs">Search</button>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  showFilters ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Filter size={14} />
                <span>Filters</span>
              </button>
            </form>

            {/* Filter Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-550 uppercase block tracking-wider">Location / City</label>
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-white/5"
                    >
                      <option value="All">All Locations</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="Berlin">Berlin</option>
                      <option value="London">London</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-550 uppercase block tracking-wider">Demanded Competency</label>
                    <select
                      value={filterSkill}
                      onChange={(e) => setFilterSkill(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-white/5"
                    >
                      <option value="All">All Skills</option>
                      <option value="React">React</option>
                      <option value="WebGL">WebGL</option>
                      <option value="Go">Go</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoverUsers.map((dev) => (
                <div key={dev._id} className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl">
                  <div className="flex space-x-3.5 items-center">
                    <Link to={`/profile/${dev._id}`}>
                      <img
                        src={dev.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full bg-slate-700 border border-slate-650 object-cover"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <Link to={`/profile/${dev._id}`} className="font-bold text-sm text-slate-100 hover:text-indigo-400">
                          {dev.username}
                        </Link>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{dev.bio || 'Developer member'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendRequest(dev._id)}
                    disabled={sentRequests.has(dev._id)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                      sentRequests.has(dev._id)
                        ? 'bg-slate-800 text-slate-500 border-slate-750'
                        : 'bg-indigo-600 hover:bg-indigo-755 text-white border-transparent shadow-md'
                    }`}
                  >
                    {sentRequests.has(dev._id) ? 'Pending' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default Connections;
