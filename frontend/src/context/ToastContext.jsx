import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Floating Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-2xl border bg-slate-900/95 dark:bg-slate-900/95 text-white shadow-xl min-w-[280px] max-w-sm backdrop-blur-md border-white/10"
            >
              {toast.type === 'success' && <CheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="text-rose-400 w-5 h-5 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="text-sky-400 w-5 h-5 flex-shrink-0" />}

              <p className="text-xs font-medium flex-1 text-slate-100">{toast.message}</p>
              
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
