import React, { useState } from 'react';
import { 
  Bell, UserPlus, Heart, MessageSquare, Briefcase, Video, 
  Trash2, ShieldCheck, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      type: 'connect',
      sender: 'Alex_GoDev',
      text: 'sent you a connection request.',
      time: '12m ago',
      unread: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'
    },
    {
      id: 'notif_2',
      type: 'like',
      sender: 'Sarah_ShaderArt',
      text: 'liked your post: "Building custom shaders in WebGL..."',
      time: '1h ago',
      unread: true,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah'
    },
    {
      id: 'notif_3',
      type: 'job',
      sender: 'Vercel Careers',
      text: 'published a new role matching your skill: "Senior Frontend Engineer".',
      time: '4h ago',
      unread: false,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vercel'
    },
    {
      id: 'notif_4',
      type: 'comment',
      sender: 'Dan_The_Coder',
      text: 'commented: "Looks clean! How are you handling backpressure?"',
      time: '1d ago',
      unread: false,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan'
    },
    {
      id: 'notif_5',
      type: 'meet',
      sender: 'Alex_GoDev',
      text: 'invited you to Jitsi virtual pair meetup #123456.',
      time: '2d ago',
      unread: false,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex'
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'connect': return <UserPlus className="text-indigo-400 w-4 h-4" />;
      case 'like': return <Heart className="text-rose-400 w-4 h-4" fill="rgba(244, 63, 94, 0.2)" />;
      case 'comment': return <MessageSquare className="text-cyan-400 w-4 h-4" />;
      case 'job': return <Briefcase className="text-amber-400 w-4 h-4" />;
      case 'meet': return <Video className="text-purple-400 w-4 h-4" />;
      default: return <Bell className="text-slate-400 w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Bell size={24} className="text-indigo-400" />
            <span>Developer Alerts</span>
          </h2>
          <p className="text-xs text-slate-400">Keep track of connection requests, job listings, comments, and project invites.</p>
        </div>

        {notifications.some(n => n.unread) && (
          <button
            onClick={markAllRead}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-850">
        <AnimatePresence initial={false}>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-4 flex items-start justify-between space-x-4 transition-colors relative ${
                notif.unread ? 'bg-indigo-600/5 hover:bg-indigo-600/10' : 'hover:bg-slate-900/30'
              }`}
            >
              <div className="flex space-x-3.5 items-center flex-1 min-w-0">
                {/* Unread circle */}
                {notif.unread && (
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0 animate-pulse" />
                )}
                
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={notif.avatar}
                    alt="notif avatar"
                    className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 border border-slate-800 rounded-full">
                    {getIcon(notif.type)}
                  </div>
                </div>

                <div className="text-xs min-w-0">
                  <p className="text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-100 mr-1">{notif.sender}</span>
                    {notif.text}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">{notif.time}</span>
                </div>
              </div>

              <button
                onClick={() => deleteNotification(notif.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800/40 transition-colors"
                title="Dismiss"
              >
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <Bell size={40} className="mx-auto text-slate-750 stroke-[1.2]" />
            <h4 className="text-xs font-bold text-slate-400">Inbox Clean!</h4>
            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">No pending alerts. We'll notify you when connections upvote or react to your projects.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Notifications;
