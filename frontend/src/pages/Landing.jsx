// pages/Landing.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Terminal, ArrowRight, Code2, Users2, MessageSquare, Video, 
  ShieldCheck, Briefcase, Zap, Sparkles, LogIn, Database, ChevronRight 
} from 'lucide-react';

const Landing = () => {
  const { guestLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleGuestAccess = () => {
    guestLogin();
    addToast('Logged in as Guest Dev (Sandbox Mode)', 'success');
    navigate('/');
  };

  const jobCategories = [
    { title: 'Frontend Engineering', count: '1,240 open roles' },
    { title: 'Backend Systems', count: '890 open roles' },
    { title: 'Big Data / Data Pipelines', count: '450 open roles' },
    { title: 'DevOps / Cloud Native', count: '310 open roles' },
    { title: 'AI / Machine Learning', count: '520 open roles' },
    { title: 'Cybersecurity Architect', count: '180 open roles' }
  ];

  return (
    <div className="space-y-24 py-4 md:py-8 overflow-hidden max-w-6xl mx-auto px-4">
      
      {/* 2-COLUMN HERO SECTION (LinkedIn Style) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[75vh]">
        
        {/* Left Column: Welcome & Sign-In/Guest Actions */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/25 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400 w-fit">
            <Sparkles size={13} className="animate-pulse" />
            <span>The Professional Dev-Network Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to your <br className="hidden sm:inline"/>
            <span className="text-gradient">professional community.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed">
            DevConnect is the full-stack developer portfolio and social network. Sync code repositories, build recruiter-ready profiles, search technical jobs, and run big data diagnostics.
          </p>

          {/* Quick Access Card options */}
          <div className="space-y-4 max-w-md">
            
            {/* Guest Sandbox Mode Card */}
            <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 bg-indigo-950/5 hover:bg-indigo-950/10 transition-all shadow-xl shadow-indigo-600/5 space-y-3.5">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-indigo-400 tracking-wider block">Recommended for Quick Review</span>
                <h3 className="font-bold text-sm text-slate-200 mt-1">Explore Developer Sandbox</h3>
                <p className="text-[11px] text-slate-450 mt-1">Click below to bypass database setup and interact with preloaded profiles, real-time metrics, and systems simulations.</p>
              </div>

              <button
                onClick={handleGuestAccess}
                className="w-full bg-indigo-600 hover:bg-indigo-755 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/15"
              >
                <span>Continue as Guest Dev</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Account CTA Links */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="flex-1 bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-200 font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Create Account</span>
              </Link>
              <Link
                to="/signin"
                className="flex-1 bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/25 font-bold py-3 px-5 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <LogIn size={13} />
                <span>Sign In Securely</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Right Column: Visual Architecture Mock (System Design Feel) */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <div className="w-full max-w-md p-6 glass-panel rounded-3xl border border-white/5 bg-slate-900/10 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.02),transparent_70%)]"></div>
            
            {/* Header tab panel */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-5 text-[10px] font-mono text-slate-500">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              </div>
              <span>cluster_blueprint.svg</span>
            </div>

            {/* SVG Diagram representing Big Data components */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between space-y-6 relative h-64">
              <div className="flex justify-between items-center h-full relative z-10 text-[9px] font-bold">
                
                {/* Node 1: Kafka */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex flex-col items-center justify-center text-indigo-400 space-y-1 shadow-md shadow-indigo-600/5">
                    <Zap size={18} />
                    <span>Kafka</span>
                  </div>
                  <span className="text-[8px] text-slate-500">Ingest (Log)</span>
                </div>

                {/* Line Arrow */}
                <div className="flex-1 h-0.5 border-t border-dashed border-slate-800 relative mx-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-[-4px] left-1/4 animate-ping"></div>
                </div>

                {/* Node 2: Spark */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex flex-col items-center justify-center text-cyan-400 space-y-1 shadow-md shadow-cyan-600/5">
                    <Cpu size={18} />
                    <span>Spark</span>
                  </div>
                  <span className="text-[8px] text-slate-500">Process (DAG)</span>
                </div>

                {/* Line Arrow */}
                <div className="flex-1 h-0.5 border-t border-dashed border-slate-800 relative mx-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 absolute top-[-4px] left-1/2 animate-ping"></div>
                </div>

                {/* Node 3: Hadoop */}
                <div className="flex flex-col items-center space-y-1.5">
                  <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex flex-col items-center justify-center text-violet-400 space-y-1 shadow-md shadow-violet-600/5">
                    <Database size={18} />
                    <span>Hadoop</span>
                  </div>
                  <span className="text-[8px] text-slate-500">Store (HDFS)</span>
                </div>

              </div>

              {/* Status details inside graphic */}
              <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[8px] font-mono text-slate-500">
                <span>Cluster State: SYNCHRONIZED</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* STATS SECTION */}
      <section className="glass-panel py-8 rounded-3xl border border-white/5 bg-[#0b0f19]/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-white block">15K+</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Members</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-indigo-400 block">4.2K+</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Projects Pinned</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-cyan-400 block">1.2M+</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Events Dispatched</span>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-purple-400 block">8.9K+</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">ATS Resumes Scanned</span>
          </div>
        </div>
      </section>

      {/* CAREERS IN TECH (LinkedIn Style Listing Grid) */}
      <section className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Find technical jobs in your field</h2>
          <p className="text-xs text-slate-400">Browse through hundreds of job listings posted directly by hiring software engineering leads.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobCategories.map((cat, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-slate-950 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-200 group-hover:text-indigo-400 transition-colors">{cat.title}</span>
                <span className="text-[10px] text-slate-500 block">{cat.count}</span>
              </div>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* CORE CAPABILITIES PORTFOLIO */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Platform Core Engine Features</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Providing all key assets developer applicants and recruiting heads need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Interactive Timelines', desc: 'Sync work experience timelines and education details with visual layout grids.', icon: <Code2 className="text-indigo-400" /> },
            { title: 'Real-time WebSocket Chat', desc: 'Instant message connections using Discord-style chat channels and live rooms.', icon: <MessageSquare className="text-cyan-400" /> },
            { title: 'Jitsi Video Meetrooms', desc: 'Spin up peer-to-peer coding meetups with numerical passcode invitation alerts.', icon: <Video className="text-rose-400" /> },
            { title: 'Interactive Job Board', desc: 'Browse remote/internship listings or manage applicants via recruiter dashboards.', icon: <Briefcase className="text-amber-400" /> },
            { title: 'AI Resume Optimization Scanner', desc: 'Scan developer resumes against ATS key terms to obtain match metrics.', icon: <Sparkles className="text-purple-400" /> },
            { title: 'Big Data Pipeline Console', desc: 'Explore system architectures visualizing Kafka topics, Spark DAGs, and Hadoop MapReduce runs.', icon: <Database className="text-emerald-400" /> }
          ].map((feat, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-white/5 bg-slate-900/20 hover:border-indigo-500/20 transition-all flex flex-col space-y-3.5"
            >
              <div className="p-2.5 bg-slate-900/60 border border-white/5 rounded-2xl w-fit">
                {feat.icon}
              </div>
              <h3 className="font-bold text-xs text-slate-100">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-12 pb-6 text-slate-500 text-xs font-medium">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          <div className="space-y-3">
            <span className="text-white font-bold flex items-center space-x-1.5">
              <Terminal className="text-indigo-400 w-5 h-5" />
              <span>DevConnect</span>
            </span>
            <p className="text-[11px] text-slate-450 leading-relaxed">Connect. Build. Grow. The complete workspace ecosystem built by developers for developers.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs">Features</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/signin" className="hover:text-indigo-400">Live Channels</Link></li>
              <li><Link to="/signin" className="hover:text-indigo-400">Timeline Portfolios</Link></li>
              <li><Link to="/signin" className="hover:text-indigo-400">Job Directory</Link></li>
              <li><Link to="/signin" className="hover:text-indigo-400">Resume Scan</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs">Community</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/signin" className="hover:text-indigo-400">Open Source Lounge</Link></li>
              <li><Link to="/signin" className="hover:text-indigo-400">AI ML Hub</Link></li>
              <li><Link to="/signin" className="hover:text-indigo-400">Web Dev Talk</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs">Security</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#" className="hover:text-indigo-400">Terms of Use</a></li>
              <li><a href="#" className="hover:text-indigo-400">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="flex justify-between border-t border-white/5 pt-6 text-slate-600 text-[10px]">
          <span>© 2026 DevConnect Inc. All rights reserved.</span>
          <span>Made for developers worldwide</span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
