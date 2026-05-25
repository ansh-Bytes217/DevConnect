import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, User, Users, MessageSquare, Briefcase, Video, 
  Settings, Bell, ShieldAlert, Cpu, ChevronLeft, ChevronRight, Database
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null; // Hide on landing page / public login

  const menuItems = [
    { path: '/', label: 'Feed Home', icon: <Home size={18} /> },
    { path: '/profile', label: 'My Profile', icon: <User size={18} /> },
    { path: '/connections', label: 'Network Connections', icon: <Users size={18} /> },
    { path: '/chat', label: 'DMs Messenger', icon: <MessageSquare size={18} /> },
    { path: '/communities', label: 'Discord Spaces', icon: <Cpu size={18} /> },
    { path: '/jobs', label: 'Job Directory', icon: <Briefcase size={18} /> },
    { path: '/resume-analyzer', label: 'AI Resume Scanner', icon: <ShieldAlert size={18} /> },
    { path: '/bigdata', label: 'Big Data Pipeline', icon: <Database size={18} /> },
    { path: '/meet', label: 'Video Conferencing', icon: <Video size={18} /> },
    { path: '/settings', label: 'Account Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col h-[calc(100vh-64px)] border-r border-white/5 bg-[#0b0f19]/40 backdrop-blur-xl transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Trigger */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/30 z-30 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Menu Links */}
      <div className="flex-1 py-6 px-3.5 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center rounded-2xl p-3 text-xs font-semibold border border-transparent transition-all group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="ml-3 truncate transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Minimal Sidebar Footer (Quick Mini Card) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center space-x-2.5 p-2 bg-slate-900/30 rounded-xl border border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync Connection Live</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
