import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Terminal, ArrowRight, Code2, Users2, MessageSquare, Video, 
  ShieldCheck, Briefcase, Zap, Globe, Sparkles 
} from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const featureList = [
    { title: 'Interactive Developer Timeline', desc: 'Sync work experience timelines and education details with visual styling.', icon: <Code2 className="w-5 h-5 text-indigo-400" /> },
    { title: 'Real-time Socket Chat', desc: 'Instant message connections using Discord-style chat channels and live rooms.', icon: <MessageSquare className="w-5 h-5 text-cyan-400" /> },
    { title: 'Jitsi Video Meetrooms', desc: 'Spin up peer-to-peer coding meetups with numerical passcode invitation alerts.', icon: <Video className="w-5 h-5 text-rose-400" /> },
    { title: 'Interactive Job Board', desc: 'Browse remote/internship listings or manage applicants via recruiter dashboards.', icon: <Briefcase className="w-5 h-5 text-amber-400" /> },
    { title: 'AI Resume Optimization Scanner', desc: 'Scan developer resumes against ATS key terms to obtain match metrics.', icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
    { title: 'Discord-Style Communities', icon: <Users2 className="w-5 h-5 text-emerald-400" />, desc: 'Join designated coding hubs to host threads and discuss tech stacks.' }
  ];

  return (
    <div className="space-y-24 py-10 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[75vh] flex items-center justify-center">
        
        {/* Background Radial Gradients */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl -z-10"></div>

        <motion.div 
          className="text-center max-w-4xl mx-auto space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-400"
          >
            <Sparkles size={14} />
            <span>The Developer Ecosystem is Now Open</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none"
          >
            Connect. Build. <br/>
            <span className="text-gradient">Grow Together.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            DevConnect is the ultimate professional social platform engineered for developers. Sync GitHub, write tech-feeds, apply to developer jobs, and launch pair video meetups.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-8 py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-xl shadow-indigo-600/20"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/signin"
              className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-900 text-slate-200 border border-white/5 hover:border-slate-700 font-bold px-8 py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <span>Explore Developers</span>
            </Link>
          </motion.div>

          {/* Interactive Floating Card Graphic Mockup */}
          <motion.div 
            variants={itemVariants}
            className="relative pt-12 flex justify-center"
          >
            <motion.div
              variants={floatVariants}
              animate="animate"
              className="w-full max-w-2xl p-6 glass-panel rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40 relative overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-4 text-xs font-mono text-slate-500">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <span>devconnect_analytics.py</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="bg-slate-950/45 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Coding Streak</span>
                  <span className="text-xl font-bold text-indigo-400 mt-1 block">18 Days</span>
                </div>
                <div className="bg-slate-950/45 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Profile Views</span>
                  <span className="text-xl font-bold text-cyan-400 mt-1 block">+142</span>
                </div>
                <div className="bg-slate-950/45 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Hiring Leads</span>
                  <span className="text-xl font-bold text-rose-400 mt-1 block">4 Active</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section className="glass-panel py-10 rounded-3xl border border-white/5 bg-[#0b0f19]/30">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1.5">
            <span className="text-3xl font-extrabold text-white block">15K+</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Developers</span>
          </div>
          <div className="space-y-1.5">
            <span className="text-3xl font-extrabold text-indigo-400 block">4.2K+</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Pinned Projects</span>
          </div>
          <div className="space-y-1.5">
            <span className="text-3xl font-extrabold text-cyan-400 block">1.2M+</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Live Messages</span>
          </div>
          <div className="space-y-1.5">
            <span className="text-3xl font-extrabold text-purple-400 block">8.9K+</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Conferences Hosted</span>
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Full-Stack Features Portfolio</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Equipped with everything software professionals and hiring managers need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
          {featureList.map((feat, idx) => (
            <motion.div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-white/5 bg-slate-900/20 hover:border-indigo-500/20 transition-all flex flex-col space-y-3.5"
              whileHover={{ y: -4 }}
            >
              <div className="p-2.5 bg-slate-900/60 border border-white/5 rounded-2xl w-fit">
                {feat.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-100">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="space-y-12 max-w-5xl mx-auto px-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Loved by Engineers</h2>
          <p className="text-xs text-slate-400">See how developers are expanding their careers and building connections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-slate-900/10 space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "DevConnect completely transformed how I network. Pinned my React repositories directly onto my timeline portfolio and got contacted by a recruiter at Vercel within a week. The Jitsi meetroom integration was super smooth for my mock interview!"
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Dan" alt="User" className="w-8 h-8 rounded-full bg-slate-800" />
              <div>
                <span className="font-bold text-xs text-slate-200 block">Dan Coder</span>
                <span className="text-[10px] text-slate-500 block">Frontend Developer @ Vercel</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-slate-900/10 space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "The Discord-style community spaces allow us to discuss open-source projects right next to the job search boards. The AI Resume Scanner optimized my keywords and boosted my ATS score before I applied!"
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Sarah" alt="User" className="w-8 h-8 rounded-full bg-slate-800" />
              <div>
                <span className="font-bold text-xs text-slate-200 block">Sarah WebArtist</span>
                <span className="text-[10px] text-slate-500 block">Creative Developer @ Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-12 pb-6 text-slate-500 text-xs font-medium max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          <div className="space-y-3">
            <span className="text-white font-bold flex items-center space-x-1">
              <Terminal className="text-indigo-400 w-5 h-5" />
              <span>DevConnect</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">Connect. Build. Grow. The complete workspace ecosystem built by developers for developers.</p>
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
              <li><Link to="/signin" className="hover:text-indigo-400">AI Hub</Link></li>
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
