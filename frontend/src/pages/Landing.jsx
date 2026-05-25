// pages/Landing.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Search, MapPin, ArrowRight, ChevronDown, ChevronUp, Terminal 
} from 'lucide-react';

const Landing = () => {
  const { loginAsGuest } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Search inputs
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
    loginAsGuest();
    addToast(`Searching for "${roleQuery}" in "${locQuery}" (Guest Mode)`, 'info');
    navigate(`/jobs?q=${roleQuery}`);
  };

  return (
    // Fixed full-screen wrapper with white background to match Indeed layout exactly
    <div className="fixed inset-0 overflow-y-auto bg-white text-[#2d2d2d] z-[100] flex flex-col justify-between font-sans">
      
      {/* 1. INDEED-STYLE HEADER */}
      <header className="w-full bg-white border-b border-slate-200 py-3 px-6 md:px-12 flex justify-between items-center flex-shrink-0">
        
        {/* Left Side: Logo & Tabs */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-1.5 text-[#2557a7] hover:opacity-90 transition-opacity">
            <Terminal className="w-6 h-6 stroke-[3]" />
            <span className="text-xl font-extrabold tracking-tight">devconnect</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4 text-xs font-bold text-[#474747]">
            <Link to="/landing" className="text-[#2557a7] pb-3 border-b-2 border-[#2557a7] pt-1">
              Home
            </Link>
            <span onClick={handleGuestAccess} className="hover:text-slate-900 cursor-pointer transition-colors pb-3 pt-1">
              Company reviews
            </span>
            <span onClick={handleGuestAccess} className="hover:text-slate-900 cursor-pointer transition-colors pb-3 pt-1">
              Salary guide
            </span>
          </div>
        </div>

        {/* Right Side: Sign-In / Post Jobs */}
        <div className="flex items-center space-x-4 text-xs font-bold">
          <Link to="/signin" className="text-[#2557a7] hover:underline">
            Sign in
          </Link>
          <span className="text-slate-300">|</span>
          <Link to="/signup" className="text-[#474747] hover:text-slate-950 transition-colors">
            Employers / Post Job
          </Link>
        </div>

      </header>

      {/* 2. BODY CONTENT (Indeed Layout) */}
      <main className="flex-1 flex flex-col justify-center py-10 px-4 max-w-4xl mx-auto w-full space-y-12">
        
        {/* Search Block Card */}
        <form 
          onSubmit={handleSearchSubmit}
          className="w-full max-w-3xl mx-auto bg-white border border-slate-300 rounded-2xl shadow-md p-1 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-200"
        >
          {/* Input 1: Skill/Role */}
          <div className="relative flex-1 w-full flex items-center py-2 px-3">
            <Search className="text-[#595959] w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={roleQuery}
              onChange={(e) => setRoleQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-1 text-sm text-[#2d2d2d] outline-none placeholder-[#595959] font-medium"
            />
          </div>

          {/* Input 2: Location */}
          <div className="relative flex-1 w-full flex items-center py-2 px-3">
            <MapPin className="text-[#595959] w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              placeholder='City, state, zip code, or "remote"'
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-1 text-sm text-[#2d2d2d] outline-none placeholder-[#595959] font-medium"
            />
          </div>

          {/* Submit Search Button */}
          <button 
            type="submit" 
            className="w-full md:w-auto bg-[#2557a7] hover:bg-[#1f488c] text-white font-bold py-2.5 px-6 rounded-xl md:rounded-r-2xl md:rounded-l-none text-sm transition-colors whitespace-nowrap flex-shrink-0"
          >
            Find jobs
          </button>
        </form>

        {/* Big Brand Logo & Introduction */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 text-[#2557a7]">
            <Terminal className="w-14 h-14 stroke-[3]" />
            <span className="text-5xl font-extrabold tracking-tight">devconnect</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-[#2d2d2d]">Your next job starts here</h2>
            <p className="text-xs text-[#595959] max-w-sm mx-auto leading-relaxed">
              Create an account or sign in to see your personalised job recommendations.
            </p>
          </div>

          {/* Get Started CTA Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGuestAccess}
              className="bg-[#2557a7] hover:bg-[#1f488c] text-white font-bold py-2.5 px-8 rounded-full text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-[#2557a7]/20"
            >
              <span>Get Started</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Trending Accordion Dropdown */}
        <div className="w-full max-w-md mx-auto text-center">
          <button
            onClick={() => setIsTrendingOpen(!isTrendingOpen)}
            className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-[#595959] hover:text-slate-900 transition-colors uppercase tracking-wider"
          >
            <span>What's trending on DevConnect</span>
            {isTrendingOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          <AnimatePresence>
            {isTrendingOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-2.5 grid grid-cols-2 gap-2 text-[9px] text-[#595959] text-left">
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <span className="font-bold text-slate-800 block">Apache Kafka Ingestion</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">Live user event messaging</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <span className="font-bold text-slate-800 block">Apache Spark Core</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">Stream window aggregations</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <span className="font-bold text-slate-800 block">Hadoop MapReduce</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">Distributed HDFS block analysis</span>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <span className="font-bold text-slate-800 block">ATS CV Scanner</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">Resume optimization score</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* 3. INDEED-STYLE FOOTER */}
      <footer className="w-full border-t border-slate-200 bg-[#f3f2f1] py-5 px-6 md:px-12 text-[#595959] text-[10px] font-medium flex-shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center md:justify-start">
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">Career advice</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">Browse jobs</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">Browse companies</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">Salaries</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">DevConnect Events</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">Work at DevConnect</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">About</span>
            <span onClick={handleGuestAccess} className="hover:underline cursor-pointer">Help</span>
          </div>

          <div className="flex space-x-3 text-slate-400">
            <span>© 2026 DevConnect</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer text-[#595959]">Accessibility</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer text-[#595959]">Privacy Centre</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer text-[#595959]">Terms</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
