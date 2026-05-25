import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PenTool, Video, Briefcase, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const FloatingActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null; // Only show for logged in users

  const handleAction = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const actionItems = [
    { label: 'Create Post', icon: <PenTool size={16} />, path: '/', color: 'bg-indigo-600 hover:bg-indigo-750' },
    { label: 'Start Meet', icon: <Video size={16} />, path: '/meet', color: 'bg-rose-600 hover:bg-rose-750' },
    { label: 'Browse Jobs', icon: <Briefcase size={16} />, path: '/jobs', color: 'bg-cyan-600 hover:bg-cyan-750' },
    { label: 'Quick Message', icon: <MessageSquare size={16} />, path: '/chat', color: 'bg-emerald-600 hover:bg-emerald-750' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[99] flex flex-col items-end space-y-3">
      
      {/* Expanded Actions Stack */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end space-y-2 mb-1">
            {actionItems.map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-center space-x-2.5"
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.8 }}
                transition={{ delay: (actionItems.length - 1 - idx) * 0.05, duration: 0.2 }}
              >
                {/* Text Label */}
                <span className="bg-slate-900/90 text-slate-200 border border-white/5 shadow-xl px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur">
                  {item.label}
                </span>

                {/* Circular Action Button */}
                <button
                  onClick={() => handleAction(item.path)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${item.color}`}
                >
                  {item.icon}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 transition-transform active:scale-95"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {isOpen ? <X size={20} /> : <Plus size={20} />}
        </motion.div>
      </button>

    </div>
  );
};

export default FloatingActions;
