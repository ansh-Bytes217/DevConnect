// pages/Connections.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Users, UserPlus, UserCheck, UserMinus, Search, MessageSquare, 
  Clock, Check, X, Filter, MapPin, Code, Hash, Bookmark, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const token = localStorage.getItem('token');
    
    try {
      if (token && token !== 'mock-guest-token') {
        if (activeTab === 'network') {
          const res = await axios.get(`${API_URL}/connections`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setConnections(res.data);
        } else if (activeTab === 'pending') {
          const res = await axios.get(`${API_URL}/connections/pending`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPendingIncoming(res.data.incoming);
          setPendingOutgoing(res.data.outgoing);
        } else if (activeTab === 'discover') {
          const res = await axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Filter out existing connections
          const existingConnIds = new Set(currentUser?.connections || []);
          let filtered = res.data.filter(u => u._id !== currentUser?._id && !existingConnIds.has(u._id));
          
          if (searchQuery.trim()) {
            filtered = filtered.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.bio?.toLowerCase().includes(searchQuery.toLowerCase()));
          }
          if (filterLocation !== 'All') {
            filtered = filtered.filter(u => u.bio?.toLowerCase().includes(filterLocation.toLowerCase()));
          }
          if (filterSkill !== 'All') {
            filtered = filtered.filter(u => u.skills?.some(s => s.name.toLowerCase() === filterSkill.toLowerCase()));
          }

          setDiscoverUsers(filtered);

          const pendingRes = await axios.get(`${API_URL}/connections/pending`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const outgoingIds = pendingRes.data.outgoing.map(req => req.userId2._id);
          setSentRequests(new Set(outgoingIds));
        }
      } else {
        loadMockData();
      }
    } catch (err) {
      console.error('Error fetching network, falling back to mock lists:', err.message);
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
        userId1: { _id: 'mock_user_sarah', username: 'Sarah_ShaderArt', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah', bio: 'WebGL Shader Engineer | Berlin', skills: [{ name: 'WebGL' }, { name: 'JavaScript' }], badge: 'open-to-work' },
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
      { _id: 'mock_user_alex', username: 'Alex_GoDev', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex', bio: 'Golang Architect | London', skills: [{ name: 'Go' }, { name: 'Docker' }], badge: 'none' },
      { _id: 'mock_user_emma', username: 'Emma_RustAce', profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma', bio: 'Systems Engineer | Rust Enthusiast | Berlin', skills: [{ name: 'Rust' }, { name: 'Go' }], badge: 'open-to-work' }
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
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-guest-token') {
      setSentRequests(new Set([...sentRequests, targetUserId]));
      addToast('Connection invitation sent (Guest mode)', 'success');
      return;
    }

    try {
      await axios.post(`${API_URL}/connections/add`, { userId2: targetUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(new Set([...sentRequests, targetUserId]));
      addToast('Connection invitation sent', 'success');
    } catch (err) {
      console.error('Error sending connection request:', err.message);
    }
  };

  const handleAcceptRequest = async (connectionId) => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-guest-token') {
      const storedIncoming = localStorage.getItem('mock_pending_incoming');
      const incoming = storedIncoming ? JSON.parse(storedIncoming) : [];
      const targetReq = incoming.find(req => req._id === connectionId);
      if (targetReq) {
        const storedConns = localStorage.getItem('mock_connections');
        const currentConns = storedConns ? JSON.parse(storedConns) : [];
        const newConn = {
          _id: `conn_${Math.random()}`,
          status: 'accepted',
          userId1: targetReq.userId1,
          userId2: currentUser
        };
        localStorage.setItem('mock_connections', JSON.stringify([...currentConns, newConn]));
        localStorage.setItem('mock_pending_incoming', JSON.stringify(incoming.filter(req => req._id !== connectionId)));
        addToast('Connection accepted (cached locally)', 'success');
      }
      fetchNetworkData();
      return;
    }

    try {
      await axios.post(`${API_URL}/connections/accept`, { connectionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Connection accepted', 'success');
      fetchNetworkData();
    } catch (err) {
      console.error('Error accepting connection request:', err.message);
    }
  };

  const handleDeclineRequest = async (connectionId) => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-guest-token') {
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
      await axios.post(`${API_URL}/connections/decline`, { connectionId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Connection declined', 'info');
      fetchNetworkData();
    } catch (err) {
      console.error('Error declining connection:', err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
      
      {/* LEFT COLUMN: MANAGE NETWORK SHORTCUTS MENU */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/5 p-4 space-y-4">
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider pl-2 border-b border-white/5 pb-2">
            Manage My Network
          </h3>
          
          <div className="flex flex-col space-y-1">
            {[
              { id: 'network', label: 'Connections', icon: <Users size={16} />, badge: connections.length },
              { id: 'pending', label: 'Pending Requests', icon: <Clock size={16} />, badge: pendingIncoming.length },
              { id: 'discover', label: 'Discover Developers', icon: <UserPlus size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/10' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/15 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Extra networking items like LinkedIn (Events, Groups) */}
        <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-xl space-y-3.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Shortcuts</span>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
              <Hash size={14} className="text-indigo-400" />
              <span>Hashtags</span>
            </div>
            <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
              <Bookmark size={14} className="text-indigo-400" />
              <span>Saved Articles</span>
            </div>
            <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
              <Award size={14} className="text-indigo-400" />
              <span>Skill Certifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: TAB ACTIONS */}
      <div className="lg:col-span-9">
        <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl min-h-[480px] space-y-6">
          
          {/* TAB 1: CONNECTIONS LIST */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="text-indigo-400" size={16} />
                <span>Connected Developers ({connections.length})</span>
              </h3>

              {connections.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-550 space-y-2">
                  <Users size={32} className="stroke-[1.2]" />
                  <span className="text-xs">No active connections. Visit 'Discover' to add developers!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((conn) => {
                    const targetUser = conn.userId1?._id === currentUser?._id ? conn.userId2 : conn.userId1;
                    if (!targetUser) return null;
                    return (
                      <motion.div
                        key={conn._id}
                        className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all"
                        whileHover={{ scale: 1.005 }}
                      >
                        <div className="flex space-x-3.5 items-center min-w-0">
                          <Link to={`/profile/${targetUser._id}`}>
                            <img
                              src={targetUser.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser.username}`}
                              alt={targetUser.username}
                              className="w-11 h-11 rounded-full bg-slate-700 border border-slate-700 object-cover flex-shrink-0"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/profile/${targetUser._id}`} className="font-bold text-xs text-slate-200 hover:text-indigo-400 transition-colors block truncate">
                              {targetUser.username}
                            </Link>
                            <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">{targetUser.bio || 'Developer member'}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2 flex-shrink-0 pl-2">
                          <Link
                            to={`/chat?userId=${targetUser._id}`}
                            className="p-2 bg-slate-900 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 rounded-xl transition-colors border border-white/5"
                            title="Message"
                          >
                            <MessageSquare size={13} />
                          </Link>
                          <button
                            onClick={() => handleDeclineRequest(conn._id)}
                            className="p-2 bg-slate-900 hover:bg-rose-500/15 text-slate-500 hover:text-rose-450 rounded-xl transition-colors border border-white/5"
                            title="Disconnect"
                          >
                            <UserMinus size={13} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS (INCOMING & OUTGOING) */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              
              {/* Incoming requests */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2 flex justify-between items-center">
                  <span>Incoming Requests</span>
                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15">{pendingIncoming.length}</span>
                </h4>

                {pendingIncoming.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-2">No pending invitations received.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingIncoming.map((req) => (
                      <div key={req._id} className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl">
                        <div className="flex space-x-3 items-center min-w-0">
                          <Link to={`/profile/${req.userId1?._id}`}>
                            <img
                              src={req.userId1?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.userId1?.username}`}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full bg-slate-700 object-cover flex-shrink-0"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link to={`/profile/${req.userId1?._id}`} className="font-semibold text-xs text-slate-200 hover:text-indigo-400 block truncate">
                              {req.userId1?.username}
                            </Link>
                            <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">{req.userId1?.bio}</p>
                          </div>
                        </div>

                        <div className="flex space-x-1.5 pl-2">
                          <button
                            onClick={() => handleAcceptRequest(req._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors border border-transparent"
                            title="Accept Invitation"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req._id)}
                            className="bg-slate-900 hover:bg-rose-500/20 text-slate-450 hover:text-rose-400 p-2 rounded-xl transition-colors border border-white/5"
                            title="Ignore"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              {pendingOutgoing.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-900">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-white/5 pb-2">
                    Sent Requests ({pendingOutgoing.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOutgoing.map((req) => (
                      <div key={req._id} className="flex items-center justify-between p-3 bg-slate-950/20 border border-slate-900/60 rounded-xl">
                        <div className="flex space-x-3 items-center min-w-0">
                          <img
                            src={req.userId2?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.userId2?.username}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full bg-slate-700 object-cover flex-shrink-0"
                          />
                          <span className="font-semibold text-xs text-slate-400 truncate">{req.userId2?.username}</span>
                        </div>
                        <span className="text-[9px] text-slate-600 bg-slate-900/50 border border-white/5 px-2 py-0.5 rounded-full font-bold">Pending Approval</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISCOVER DEVELOPERS WITH FILTER PANEL */}
          {activeTab === 'discover' && (
            <div className="space-y-6">
              
              {/* Search bar and filters toggle */}
              <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center justify-between bg-slate-950/45 p-4 border border-slate-900 rounded-2xl">
                <div className="flex flex-1 max-w-md space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search developers by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none transition-all"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-500 w-3.5 h-3.5" />
                  </div>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-4 rounded-xl text-xs transition-colors">Search</button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    showFilters ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter size={12} />
                  <span>Filter Options</span>
                </button>
              </form>

              {/* Filter Panel details */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Location Filter</label>
                      <select
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="All">All Locations</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="Berlin">Berlin</option>
                        <option value="London">London</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Demanded Skill</label>
                      <select
                        value={filterSkill}
                        onChange={(e) => setFilterSkill(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="All">All Skills</option>
                        <option value="React">React</option>
                        <option value="WebGL">WebGL</option>
                        <option value="Go">Go</option>
                        <option value="Rust">Rust</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Suggestions Grid */}
              {discoverUsers.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-8">No developer suggestions match the active filters.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoverUsers.map((dev) => (
                    <div key={dev._id} className="flex items-center justify-between p-4 bg-slate-950/45 border border-slate-900 rounded-2xl">
                      <div className="flex space-x-3.5 items-center min-w-0">
                        <Link to={`/profile/${dev._id}`}>
                          <img
                            src={dev.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${dev.username}`}
                            alt="Avatar"
                            className="w-11 h-11 rounded-full bg-slate-700 border border-slate-700 object-cover flex-shrink-0"
                          />
                        </Link>
                        <div className="min-w-0">
                          <Link to={`/profile/${dev._id}`} className="font-bold text-xs text-slate-200 hover:text-indigo-400 block truncate">
                            {dev.username}
                          </Link>
                          <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">{dev.bio || 'Developer member'}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendRequest(dev._id)}
                        disabled={sentRequests.has(dev._id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border flex-shrink-0 pl-2 ${
                          sentRequests.has(dev._id)
                            ? 'bg-slate-900 text-slate-500 border-slate-800'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-md shadow-indigo-600/5'
                        }`}
                      >
                        {sentRequests.has(dev._id) ? 'Pending' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Connections;
