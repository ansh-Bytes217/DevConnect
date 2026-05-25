import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Send, Image, ThumbsUp, Lightbulb, PartyPopper, Brain, MessageSquare, 
  UserPlus, Check, Award, Briefcase, HelpCircle, Eye, BarChart3, Flame, 
  Cpu, Code2, ShieldAlert, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock developer posts
const MOCK_POSTS = [
  {
    _id: 'mock_post_1',
    content: "🚀 Just launched an open-source lightweight alternative to Kafka in Go! It uses standard WebSockets for streaming and achieves sub-millisecond latencies. Let me know what you think of the architecture!",
    imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    userId: {
      _id: 'mock_user_dan',
      username: 'Dan_The_Coder',
      profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan',
      badge: 'hiring'
    },
    reactions: [
      { userId: 'mock_user_alice', type: 'like' },
      { userId: 'mock_user_bob', type: 'insightful' }
    ],
    comments: [
      { _id: 'c1', username: 'Alex_GoDev', content: 'Looks clean! How are you handling backpressure?', createdAt: new Date() }
    ]
  },
  {
    _id: 'mock_post_2',
    content: "Building custom shaders in WebGL this weekend. The math is complex but the performance compared to pure canvas drawing is completely worth it! 🎮🎨",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    userId: {
      _id: 'mock_user_sarah',
      username: 'Sarah_ShaderArt',
      profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
      badge: 'open-to-work'
    },
    reactions: [
      { userId: 'mock_user_dan', type: 'celebrate' }
    ],
    comments: []
  }
];

const MOCK_RECS = [
  {
    _id: 'mock_user_dan',
    username: 'Dan_The_Coder',
    profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan',
    bio: 'Tech Lead @ Vercel | Building Next.js',
    badge: 'hiring',
    skills: [{ name: 'React' }, { name: 'Node.js' }]
  },
  {
    _id: 'mock_user_sarah',
    username: 'Sarah_ShaderArt',
    profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
    bio: 'Creative Frontend Engineer | Three.js enthusiast',
    badge: 'open-to-work',
    skills: [{ name: 'WebGL' }, { name: 'JavaScript' }]
  }
];

const Home = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [sentRequests, setSentRequests] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Streak tracker blocks: 7 days representing commits (dark green = active)
  const streakBlocks = [
    { day: 'Mon', active: true, count: 4 },
    { day: 'Tue', active: true, count: 1 },
    { day: 'Wed', active: false, count: 0 },
    { day: 'Thu', active: true, count: 7 },
    { day: 'Fri', active: true, count: 3 },
    { day: 'Sat', active: true, count: 5 },
    { day: 'Sun', active: true, count: 2 },
  ];

  useEffect(() => {
    fetchPosts();
    fetchRecommendations();
    fetchPendingRequests();
  }, []);

  const fetchPosts = async () => {
    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedPosts = localStorage.getItem('mock_posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        localStorage.setItem('mock_posts', JSON.stringify(MOCK_POSTS));
        setPosts(MOCK_POSTS);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/posts');
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts, using mock fallback:', err.message);
      setPosts(MOCK_POSTS);
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (localStorage.getItem('token') === 'mock-guest-token') {
      setRecommendations(MOCK_RECS);
      return;
    }

    try {
      const res = await axios.get('/users/recommendations');
      setRecommendations(res.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err.message);
      setRecommendations(MOCK_RECS);
    }
  };

  const fetchPendingRequests = async () => {
    if (localStorage.getItem('token') === 'mock-guest-token') return;
    try {
      const res = await axios.get('/connections/pending');
      const outgoingIds = res.data.outgoing.map(req => req.userId2._id);
      setSentRequests(new Set(outgoingIds));
    } catch (err) {
      console.error('Error fetching pending requests:', err.message);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    if (localStorage.getItem('token') === 'mock-guest-token') {
      const newPost = {
        _id: `mock_post_${Math.random()}`,
        content,
        imageUrl,
        createdAt: new Date().toISOString(),
        userId: {
          _id: user?._id || 'mock_guest_9999',
          username: user?.username || 'GuestDev',
          profilePicture: user?.profilePicture,
          badge: user?.badge || 'none'
        },
        reactions: [],
        comments: []
      };
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('mock_posts', JSON.stringify(updatedPosts));
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      addToast('Post published successfully (cached locally)', 'success');
      return;
    }

    try {
      const res = await axios.post('/posts', { content, imageUrl });
      setPosts([res.data, ...posts]);
      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      addToast('Post published successfully', 'success');
    } catch (err) {
      console.error('Error creating post:', err.message);
    }
  };

  const handleReaction = async (postId, reactionType) => {
    if (localStorage.getItem('token') === 'mock-guest-token') {
      const myId = user?._id || 'mock_guest_9999';
      const updated = posts.map(p => {
        if (p._id === postId) {
          const reactions = p.reactions || [];
          const existingIndex = reactions.findIndex(r => r.userId === myId);
          let newReactions = [...reactions];
          if (existingIndex > -1) {
            if (newReactions[existingIndex].type === reactionType) {
              newReactions.splice(existingIndex, 1);
            } else {
              newReactions[existingIndex].type = reactionType;
            }
          } else {
            newReactions.push({ userId: myId, type: reactionType });
          }
          return { ...p, reactions: newReactions };
        }
        return p;
      });
      setPosts(updated);
      localStorage.setItem('mock_posts', JSON.stringify(updated));
      return;
    }

    try {
      const res = await axios.post(`/posts/${postId}/react`, { type: reactionType });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
    } catch (err) {
      console.error('Error reacting to post:', err.message);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    if (localStorage.getItem('token') === 'mock-guest-token') {
      const myId = user?._id || 'mock_guest_9999';
      const myUsername = user?.username || 'GuestDev';
      const updated = posts.map(p => {
        if (p._id === postId) {
          const comments = p.comments || [];
          const newComment = {
            _id: `c_${Math.random()}`,
            userId: myId,
            username: myUsername,
            content: text.trim(),
            createdAt: new Date().toISOString()
          };
          return { ...p, comments: [...comments, newComment] };
        }
        return p;
      });
      setPosts(updated);
      localStorage.setItem('mock_posts', JSON.stringify(updated));
      setCommentText({ ...commentText, [postId]: '' });
      addToast('Comment added', 'success');
      return;
    }

    try {
      const res = await axios.post(`/posts/${postId}/comment`, { content: text });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setCommentText({ ...commentText, [postId]: '' });
      addToast('Comment added', 'success');
    } catch (err) {
      console.error('Error adding comment:', err.message);
    }
  };

  const handleConnect = async (targetUserId) => {
    if (localStorage.getItem('token') === 'mock-guest-token') {
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

  const getReactionCount = (post, type) => {
    return post.reactions?.filter(r => r.type === type).length || 0;
  };

  const hasUserReacted = (post, type) => {
    return post.reactions?.some(r => r.userId === user?._id && r.type === type);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
      
      {/* COLUMN 1: LEFT SIDEBAR PROFILE & STATS */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Profile Card */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/5 relative">
          <div className="h-20 bg-gradient-to-r from-indigo-700 to-indigo-500"></div>
          <div className="px-6 pb-6 text-center -mt-10">
            <img
              src={user?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
              alt={user?.username}
              className="w-20 h-20 rounded-full mx-auto border-4 border-[#0b0f19] object-cover bg-slate-700 shadow-xl"
            />
            <h3 className="mt-3 text-sm font-bold text-white flex items-center justify-center space-x-1.5">
              <span>{user?.username}</span>
            </h3>
            
            {user?.badge && user.badge !== 'none' && (
              <span className={`inline-block mt-1 text-[8px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                user.badge === 'open-to-work' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
              }`}>
                {user.badge.replace('-', ' ')}
              </span>
            )}

            <p className="mt-2.5 text-[11px] text-slate-450 line-clamp-2">
              {user?.bio || "No professional tagline added yet."}
            </p>
          </div>
        </div>

        {/* Analytics Widget (LinkedIn Premium Style) */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <BarChart3 size={14} className="text-indigo-400" />
            <span>Developer Analytics</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900/35 border border-white/5 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 block">Profile Views</span>
              <span className="text-sm font-extrabold text-indigo-400 mt-1 block">142</span>
            </div>
            <div className="bg-slate-900/35 border border-white/5 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 block">Post Likes</span>
              <span className="text-sm font-extrabold text-cyan-400 mt-1 block">89</span>
            </div>
            <div className="bg-slate-900/35 border border-white/5 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-500 block">Job Views</span>
              <span className="text-sm font-extrabold text-purple-400 mt-1 block">12</span>
            </div>
            <div className="bg-slate-900/35 border border-white/5 p-3 rounded-2xl flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-500 block">Streak</span>
              <span className="text-sm font-extrabold text-amber-500 mt-1 flex items-center space-x-0.5">
                <Flame size={12} fill="rgba(245, 158, 11, 0.2)" />
                <span>18d</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: MIDDLE FEED */}
      <div className="lg:col-span-6 space-y-6">
        
        {/* Productivity Commits Streak Grid Widget */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-xl space-y-3 bg-slate-900/10">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200 flex items-center space-x-1.5">
              <Flame className="text-amber-500 w-4 h-4" fill="rgba(245, 158, 11, 0.1)" />
              <span>Weekly Coding Commit Streak</span>
            </span>
            <span className="text-[10px] text-slate-500">18 consecutive days</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950/45 p-3 rounded-2xl border border-white/5">
            {streakBlocks.map((block, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-1">
                <span className="text-[8px] text-slate-500 font-bold">{block.day}</span>
                <div 
                  className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold ${
                    block.active 
                      ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' 
                      : 'bg-slate-900 border-white/5 text-slate-650'
                  }`}
                  title={`${block.count} commits`}
                >
                  {block.count > 0 ? `+${block.count}` : '0'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post Creation Form */}
        <div className="glass-panel p-5 rounded-3xl shadow-lg border border-white/5 space-y-4">
          <div className="flex space-x-4">
            <img
              src={user?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full bg-slate-700 object-cover"
            />
            <textarea
              placeholder="What tech project are you working on today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="flex-1 w-full glass-input rounded-2xl p-3 text-sm text-slate-200 resize-none border border-white/5"
            />
          </div>

          {showImageInput && (
            <input
              type="text"
              placeholder="Paste a code screenshot or project image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-200 border border-white/5"
            />
          )}

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <button
              onClick={() => setShowImageInput(!showImageInput)}
              className="flex items-center space-x-2 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Image size={16} />
              <span>{showImageInput ? 'Hide URL' : 'Add Image URL'}</span>
            </button>

            <button
              onClick={handleCreatePost}
              className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold py-2 px-5 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/10"
            >
              <span>Post Activity</span>
              <Send size={12} />
            </button>
          </div>
        </div>

        {/* Shimmer Skeleton Loaders if loading */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map(n => (
              <div key={n} className="glass-panel p-6 rounded-3xl space-y-4 border border-white/5 animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-800 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Feed Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              className="glass-panel p-6 rounded-3xl shadow-md border border-white/5 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Post Header */}
              <div className="flex justify-between items-start">
                <div className="flex space-x-3">
                  <img
                    src={post.userId?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.userId?.username}`}
                    alt="Poster"
                    className="w-10 h-10 rounded-full bg-slate-700 object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-sm text-slate-100">{post.userId?.username}</span>
                      {post.userId?.badge && post.userId.badge !== 'none' && (
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                          post.userId.badge === 'open-to-work' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                        }`}>
                          {post.userId.badge.split('-')[0]}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(post.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-slate-350 text-xs whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>

              {/* Image Attach */}
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/5 max-h-96">
                  <img
                    src={post.imageUrl}
                    alt="Post Attach"
                    className="w-full h-auto object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Reaction counts summary bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
                <div className="flex space-x-3">
                  {getReactionCount(post, 'like') > 0 && <span className="flex items-center space-x-0.5">👍 {getReactionCount(post, 'like')}</span>}
                  {getReactionCount(post, 'insightful') > 0 && <span className="flex items-center space-x-0.5">💡 {getReactionCount(post, 'insightful')}</span>}
                  {getReactionCount(post, 'celebrate') > 0 && <span className="flex items-center space-x-0.5">🚀 {getReactionCount(post, 'celebrate')}</span>}
                  {getReactionCount(post, 'curious') > 0 && <span className="flex items-center space-x-0.5">🧠 {getReactionCount(post, 'curious')}</span>}
                </div>
                <span>{post.comments?.length || 0} comments</span>
              </div>

              {/* Actions toggler */}
              <div className="flex justify-between border-t border-b border-white/5 py-1.5">
                <div className="flex space-x-1.5 sm:space-x-4">
                  <button
                    onClick={() => handleReaction(post._id, 'like')}
                    className={`flex items-center space-x-1 p-1.5 rounded-lg text-xs transition-colors ${
                      hasUserReacted(post, 'like') ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp size={14} />
                    <span className="hidden sm:inline">Like</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post._id, 'insightful')}
                    className={`flex items-center space-x-1 p-1.5 rounded-lg text-xs transition-colors ${
                      hasUserReacted(post, 'insightful') ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lightbulb size={14} />
                    <span className="hidden sm:inline">Insightful</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post._id, 'celebrate')}
                    className={`flex items-center space-x-1 p-1.5 rounded-lg text-xs transition-colors ${
                      hasUserReacted(post, 'celebrate') ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PartyPopper size={14} />
                    <span className="hidden sm:inline">Celebrate</span>
                  </button>

                  <button
                    onClick={() => handleReaction(post._id, 'curious')}
                    className={`flex items-center space-x-1 p-1.5 rounded-lg text-xs transition-colors ${
                      hasUserReacted(post, 'curious') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Brain size={14} />
                    <span className="hidden sm:inline">Curious</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                  className={`flex items-center space-x-1 p-1.5 rounded-lg text-xs transition-colors ${
                    activeCommentPost === post._id ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span>Comments</span>
                </button>
              </div>

              {/* Comments list drawer */}
              <AnimatePresence>
                {activeCommentPost === post._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-2 overflow-hidden"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={user?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full bg-slate-700 object-cover"
                      />
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          placeholder="Write a professional comment..."
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                          className="flex-1 glass-input rounded-xl px-3.5 py-1.5 text-xs text-slate-200 border border-white/5"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white p-2 rounded-xl transition-all"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pl-3 max-h-52 overflow-y-auto pr-1">
                      {post.comments?.map((comment) => (
                        <div key={comment._id} className="flex space-x-2 bg-slate-900/30 p-2.5 rounded-xl border border-white/5 text-xs">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${comment.username}`}
                            alt="Commenter"
                            className="w-6 h-6 rounded-full bg-slate-700"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-semibold text-slate-200">{comment.username}</span>
                              <span className="text-[9px] text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-400 mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          ))}
        </div>

      </div>

      {/* COLUMN 3: RIGHT SIDEBAR RECOMMENDATIONS & COMMUNITIES */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Recs widget */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Award className="text-indigo-400 w-4 h-4" />
            <span>Suggested Developers</span>
          </h4>

          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec._id} className="flex items-start justify-between space-x-2 bg-slate-900/35 p-3 rounded-2xl border border-white/5">
                <div className="flex space-x-2.5">
                  <img
                    src={rec.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${rec.username}`}
                    alt="Rec"
                    className="w-8 h-8 rounded-full bg-slate-700 object-cover mt-0.5"
                  />
                  <div className="text-[10px]">
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-slate-200">{rec.username}</span>
                      {rec.badge && rec.badge !== 'none' && (
                        <span className={`text-[7px] font-extrabold uppercase px-1 rounded-full ${
                          rec.badge === 'open-to-work' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                        }`}>
                          {rec.badge.split('-')[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-450 line-clamp-1 mt-0.5">{rec.bio}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(rec._id)}
                  disabled={sentRequests.has(rec._id)}
                  className={`p-1.5 rounded-xl transition-all ${
                    sentRequests.has(rec._id)
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'bg-indigo-600 hover:bg-indigo-750 text-white'
                  }`}
                >
                  {sentRequests.has(rec._id) ? <Check size={12} /> : <UserPlus size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Communities widget */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Code2 className="text-indigo-400 w-4 h-4" />
            <span>Tech Hubs</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-900/35 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-slate-900/60 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-slate-200 block">AI / Machine Learning</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">4.2k active developers</span>
              </div>
            </div>
            <div className="p-3 bg-slate-900/35 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-slate-900/60 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-slate-200 block">Web Development Hub</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">8.9k active developers</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Home;
