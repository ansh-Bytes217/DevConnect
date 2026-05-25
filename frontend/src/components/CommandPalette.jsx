import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Home, User, Users, MessageSquare, Briefcase, Video, 
  Settings, LogOut, SunMoon, ShieldAlert, Cpu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const inputRef = useRef(null);

  // Monitor hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const actions = [
    { name: 'Go to Feed / Home', icon: <Home size={16} />, action: () => navigate('/') },
    { name: 'View My Profile', icon: <User size={16} />, action: () => navigate('/profile') },
    { name: 'Manage Network Connections', icon: <Users size={16} />, action: () => navigate('/connections') },
    { name: 'Direct Messages Chat', icon: <MessageSquare size={16} />, action: () => navigate('/chat') },
    { name: 'Find / Post Jobs', icon: <Briefcase size={16} />, action: () => navigate('/jobs') },
    { name: 'Virtual Conference (Meet)', icon: <Video size={16} />, action: () => navigate('/meet') },
    { name: 'Discord-Style Communities', icon: <Cpu size={16} />, action: () => navigate('/communities') },
    { name: 'AI Resume ATS Analyzer', icon: <ShieldAlert size={16} />, action: () => navigate('/resume-analyzer') },
    { name: 'Appearance & Security Settings', icon: <Settings size={16} />, action: () => navigate('/settings') },
    { name: 'Toggle Dark / Light Theme', icon: <SunMoon size={16} />, action: () => toggleTheme() },
    { name: 'Sign Out Account', icon: <LogOut size={16} />, action: () => { logout(); navigate('/signin'); } },
  ];

  const filteredActions = actions.filter(act => 
    act.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (act) => {
    act.action();
    setIsOpen(false);
  };

  if (!user) return null; // Only show for logged in users

  return (
    <>
      {/* Keyboard hotkey suggestion indicator in bottom-left */}
      <div className="fixed bottom-4 left-4 z-40 hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-white/5 text-[10px] text-slate-400 font-mono backdrop-blur">
        <span>Press</span>
        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-sans text-[9px] font-bold">Ctrl</kbd>
        <span>+</span>
        <kbd className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-sans text-[9px] font-bold">K</kbd>
        <span>for command menu</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] flex items-start justify-center pt-24 px-4 bg-slate-950/70 backdrop-blur-sm">
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Search Header */}
              <div className="flex items-center px-4 py-3.5 border-b border-white/5 space-x-3">
                <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a page name or action..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] bg-slate-800 border border-slate-750 text-slate-400 hover:text-white px-2 py-1 rounded-lg"
                >
                  ESC
                </button>
              </div>

              {/* Action list */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {filteredActions.map((act, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(act)}
                    className="w-full flex items-center space-x-3.5 p-3 rounded-2xl text-left text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-600/20 border border-transparent hover:border-indigo-500/20 transition-all"
                  >
                    <span className="text-indigo-400">{act.icon}</span>
                    <span className="flex-1">{act.name}</span>
                  </button>
                ))}
                {filteredActions.length === 0 && (
                  <p className="text-[11px] text-slate-500 text-center py-6">No matching actions found</p>
                )}
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandPalette;
