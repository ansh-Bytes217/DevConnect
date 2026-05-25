import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Terminal, Home, User, Users, MessageSquare, Briefcase, Video, LogOut, LogIn, UserPlus, Bell, X 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { invites, clearInvite } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: <Home size={18} /> },
    { path: '/profile', label: 'Profile', icon: <User size={18} /> },
    { path: '/connections', label: 'Connections', icon: <Users size={18} /> },
    { path: '/chat', label: 'Chat', icon: <MessageSquare size={18} /> },
    { path: '/jobs', label: 'Jobs', icon: <Briefcase size={18} /> },
    { path: '/meet', label: 'Meet', icon: <Video size={18} /> },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 py-3 px-6 md:px-12 flex justify-between items-center">
      <Link to="/" className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors">
        <Terminal className="w-8 h-8 stroke-[2.5]" />
        <span className="text-xl font-bold tracking-tight text-white">Dev<span className="text-indigo-500">Connect</span></span>
      </Link>

      {user ? (
        <div className="flex items-center space-x-4">
          {/* Main Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Notifications / Meet Invites Area */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white relative transition-colors"
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

          {/* User Profile avatar dropdown/signout */}
          <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
            <Link to="/profile" className="flex items-center space-x-2 group">
              <img
                src={user.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 object-cover group-hover:border-indigo-500 transition-colors"
              />
              <span className="hidden sm:inline text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                {user.username}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link
            to="/signin"
            className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </Link>
          <Link
            to="/signup"
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <UserPlus size={16} />
            <span>Sign Up</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
