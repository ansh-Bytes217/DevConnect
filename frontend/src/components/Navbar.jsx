// components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Terminal, Home, User, Users, MessageSquare, Briefcase, Video, 
  LogOut, LogIn, UserPlus, Bell, X, Cpu, Database, ShieldAlert, Settings, Menu
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { invites, clearInvite } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  // Primary Navigation Links (mimicking LinkedIn header)
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={19} /> },
    { path: '/connections', label: 'My Network', icon: <Users size={19} /> },
    { path: '/jobs', label: 'Jobs', icon: <Briefcase size={19} /> },
    { path: '/chat', label: 'Messaging', icon: <MessageSquare size={19} /> },
    { path: '/communities', label: 'Spaces', icon: <Cpu size={19} /> },
    { path: '/bigdata', label: 'Big Data', icon: <Database size={19} /> },
    { path: '/resume-analyzer', label: 'AI Resume', icon: <ShieldAlert size={19} /> },
    { path: '/meet', label: 'Video Call', icon: <Video size={19} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={19} /> },
  ];

  return (
    <>
      {/* HEADER NAVBAR (DESKTOP & MOBILE LOGO) */}
      <nav className="glass-nav sticky top-0 z-50 py-2.5 px-4 md:px-8 flex justify-between items-center border-b border-white/5 bg-[#0b0f19]/70 backdrop-blur-md">
        
        {/* LOGO & SEARCH BAR */}
        <div className="flex items-center space-x-3.5 flex-1 md:flex-initial">
          <Link to="/" className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <Terminal className="w-7 h-7 stroke-[2.5]" />
            <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">DevConnect</span>
          </Link>

          {/* Simulated search bar like LinkedIn */}
          {user && (
            <div className="relative max-w-xs w-full hidden sm:block">
              <input
                type="text"
                placeholder="Search developers, jobs..."
                className="w-full bg-slate-900/60 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded-xl py-1.5 pl-3.5 pr-8 text-xs text-slate-200 outline-none transition-all"
              />
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS (DESKTOP MODE) */}
        {user ? (
          <div className="flex items-center space-x-2.5 md:space-x-5">
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col items-center justify-center w-[72px] h-[52px] transition-all relative group ${
                    isActive(link.path)
                      ? 'text-indigo-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`transition-transform duration-200 group-hover:scale-105 ${
                    isActive(link.path) ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {link.icon}
                  </span>
                  <span className="text-[9px] mt-1 tracking-wide">{link.label}</span>
                  
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-1 w-10/12 h-[2.5px] bg-indigo-500 rounded-t-full"></span>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile menu link trigger (for communities/bigdata/resume on tablets/small screens) */}
            <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-850/60 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Notifications / Meet Invites Area */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl hover:bg-slate-850/80 text-slate-400 hover:text-white relative transition-colors"
              >
                <Bell size={20} />
                {invites.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {invites.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel shadow-2xl rounded-2xl p-4 border border-slate-700/50 z-50">
                  <div className="flex justify-between items-center border-b border-slate-700/50 pb-2 mb-3">
                    <h4 className="text-sm font-semibold text-white">Meeting Invites</h4>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {invites.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No active meeting requests</p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {invites.map((invite) => (
                        <div key={invite.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 flex flex-col space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="text-xs text-slate-200">
                              <span className="font-semibold text-indigo-400">{invite.senderUsername}</span> has invited you to a video room.
                            </p>
                            <button 
                              onClick={() => clearInvite(invite.id)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/meet?room=${invite.roomCode}`}
                              onClick={() => {
                                clearInvite(invite.id);
                                setShowNotifications(false);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg text-center flex-1 transition-colors"
                            >
                              Join Call
                            </Link>
                            <button
                              onClick={() => clearInvite(invite.id)}
                              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] py-1.5 px-3 rounded-lg flex-1 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu Trigger */}
            <div className="flex items-center space-x-2 border-l border-slate-850 pl-3 md:pl-4">
              <Link to="/profile" className="flex items-center space-x-2 group">
                <img
                  src={user.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full bg-slate-700 border border-slate-700 object-cover group-hover:border-indigo-500 transition-colors"
                />
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors max-w-[80px] truncate">
                  {user.username}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/signin"
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20"
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </nav>

      {/* MOBILE BOTTOM NAVIGATION BAR (WHEN USER LOGGED IN) */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/85 backdrop-blur-lg border-t border-white/5 py-1 flex justify-around items-center px-2">
          {[
            { path: '/', label: 'Home', icon: <Home size={20} /> },
            { path: '/connections', label: 'Network', icon: <Users size={20} /> },
            { path: '/jobs', label: 'Jobs', icon: <Briefcase size={20} /> },
            { path: '/chat', label: 'Messaging', icon: <MessageSquare size={20} /> },
            { path: '/profile', label: 'Me', icon: (
              <img
                src={user.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt="Avatar"
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
              />
            ) }
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[9px] font-bold ${
                isActive(link.path) ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              {link.icon}
              <span className="mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      )}

      {/* FLOATING EXTRA MENU DRAWER (FOR LOWER PRIORITY NAVIGATION LINKS ON MOBILE/TABLET) */}
      {showMobileMore && user && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-64 bg-[#0a0f18] h-full p-6 border-l border-white/5 flex flex-col space-y-6 animate-slideIn">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">DevConnect Hub</span>
              <button 
                onClick={() => setShowMobileMore(false)}
                className="p-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMobileMore(false)}
                  className={`flex items-center space-x-3 p-3 rounded-2xl text-xs font-bold transition-all border ${
                    isActive(link.path)
                      ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <button
                onClick={() => { setShowMobileMore(false); handleLogout(); }}
                className="w-full bg-rose-600/10 border border-rose-500/20 text-rose-400 py-2.5 rounded-2xl text-xs font-bold hover:bg-rose-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
