// pages/Landing.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Terminal, Search, MapPin, ArrowRight, ChevronDown, ChevronUp, 
  Briefcase, Users2, Database, ShieldCheck, Flame, Cpu 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Landing = () => {
  const { loginAsGuest } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Search input state
  const [roleQuery, setRoleQuery] = useState('');
  const [locQuery, setLocQuery] = useState('');

  // Dropdown state
  const [isTrendingOpen, setIsTrendingOpen] = useState(false);

  const handleGuestAccess = () => {
    loginAsGuest();
    addToast('Logged in as Guest Dev (Sandbox Mode)', 'success');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Redirect guest or notify user
    loginAsGuest();
    addToast(`Searching for "${roleQuery}" in "${locQuery}" (Guest Mode)`, 'info');
    navigate(`/jobs?q=${roleQuery}`);
  };

  const jobCategories = [
    { title: 'Frontend Developer', desc: 'React, Tailwind CSS, Vite', count: '1,240 open roles' },
    { title: 'Backend Architect', desc: 'Node.js, Express, MongoDB', count: '890 open roles' },
    { title: 'Data Engineer', desc: 'Kafka, Spark, Hadoop', count: '450 open roles' },
    { title: 'DevOps Systems', desc: 'Docker, Kubernetes, AWS', count: '310 open roles' },
    { title: 'Machine Learning', desc: 'Python, PyTorch, ALS', count: '520 open roles' },
    { title: 'Security Consultant', desc: 'Auth, JWT, Cryptography', count: '180 open roles' }
  ];

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-6 max-w-6xl mx-auto px-4 space-y-12">
      
      {/* MAIN CONTAINER (Centered Indeed Layout) */}
      <div className="flex-1 flex flex-col justify-center space-y-10 py-6">
        
        {/* 1. DUAL DOCK SEARCH BAR (Indeed Style) */}
        <form 
          onSubmit={handleSearchSubmit}
          className="flex flex-col md:flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl md:rounded-full p-2 w-full max-w-3xl mx-auto shadow-2xl space-y-2.5 md:space-y-0"
        >
          {/* Input 1: Role/Skill */}
          <div className="relative flex-1 w-full flex items-center px-2">
            <Search className="text-slate-500 w-4 h-4 ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or skills"
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-xs text-slate-200 outline-none placeholder-slate-500"
            />
          </div>

          {/* Desktop divider */}
          <div className="hidden md:block w-px h-6 bg-slate-800"></div>

          {/* Input 2: Location */}
          <div className="relative flex-1 w-full flex items-center px-2">
            <MapPin className="text-slate-500 w-4 h-4 ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="City, state, zip code, or 'remote'"
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-xs text-slate-200 outline-none placeholder-slate-500"
            />
          </div>

          {/* Submit Action Button */}
          <button 
            type="submit" 
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl md:rounded-full text-xs transition-all shadow-md shadow-indigo-600/10 whitespace-nowrap flex-shrink-0"
          >
            Find Jobs
          </button>
        </form>

        {/* 2. LOGO AND TAGLINE SECTION */}
        <div className="text-center space-y-5">
          <div className="flex items-center justify-center space-x-2.5 text-indigo-400">
            <Terminal className="w-12 h-12 stroke-[2.5]" />
            <span className="text-3xl font-extrabold tracking-tight text-white">Dev<span className="text-indigo-500">Connect</span></span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-200">Your next developer job starts here</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create an account or sign in to build your timeline portfolio, scan resumes, and analyze real-time Kafka streams.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex justify-center items-center">
            <button
              onClick={handleGuestAccess}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* 3. COLLAPSIBLE TRENDING DROPDOWN */}
        <div className="w-full max-w-md mx-auto">
          <button
            onClick={() => setIsTrendingOpen(!isTrendingOpen)}
            className="w-full flex items-center justify-center space-x-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-350 transition-colors uppercase tracking-wider"
          >
            <span>What's trending on DevConnect</span>
            {isTrendingOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <AnimatePresence>
            {isTrendingOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 mt-3 grid grid-cols-2 gap-3 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                    <Zap size={12} className="text-indigo-400" />
                    <span>Apache Kafka streams logging</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                    <Database size={12} className="text-cyan-400" />
                    <span>HDFS splits WordCount</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                    <Flame size={12} className="text-amber-500" />
                    <span>18d Weekly Commit Streaks</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-900/40 p-2.5 rounded-xl border border-white/5">
                    <ShieldCheck size={12} className="text-purple-400" />
                    <span>ATS CV Optimization scanner</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. TECH ROLES CATEGORIES (Grid Selector) */}
        <div className="space-y-6 pt-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider text-center">Popular developer roles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobCategories.map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  loginAsGuest();
                  addToast(`Opening ${cat.title} directory`, 'success');
                  navigate(`/jobs?q=${cat.title}`);
                }}
                className="p-4 bg-slate-950 border border-slate-900 rounded-2xl hover:border-slate-800 hover:bg-slate-900/10 transition-all flex justify-between items-center group cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-400 transition-colors block">{cat.title}</span>
                  <span className="text-[9px] text-slate-500 block font-mono">{cat.desc}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. INLINE TABULAR FOOTER */}
      <footer className="border-t border-white/5 pt-6 text-[10px] text-slate-550 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <span className="hover:text-slate-400 cursor-pointer">About DevConnect</span>
          <span className="hover:text-slate-400 cursor-pointer">Browse Jobs</span>
          <span className="hover:text-slate-400 cursor-pointer">Developer Directory</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Center</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Use</span>
          <span className="hover:text-slate-400 cursor-pointer">Privacy Guidelines</span>
        </div>
        <span>© 2026 DevConnect Inc. All rights reserved.</span>
      </footer>

    </div>
  );
};

export default Landing;
