import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Terminal, Loader2, Eye, EyeOff, AlertCircle, X, Sparkles } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  // Instant validations
  const validateEmail = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      setEmailError('Please enter a valid developer email (e.g. name@domain.com)');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (val) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    // Final validation checks
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (emailError || passwordError) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Invalid credentials or database connection issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLocalError('');
    setLoading(true);
    try {
      await loginAsGuest();
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    
    if (!forgotEmail) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess('A simulated password reset recovery token has been compiled and transmitted to your inbox! Check your spam folder if it doesn\'t arrive in 60s.');
    }, 1500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-650/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-650/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <motion.div 
        className="max-w-md w-full space-y-6 p-8 glass-panel rounded-3xl shadow-2xl border border-slate-800/80 relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Top Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400 border border-indigo-500/15 relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Terminal className="h-10 w-10 stroke-[2.5] relative z-10" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-2">
            <span>Welcome Back</span>
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Connect to your workspace and engage in real-time pairing
          </p>
        </div>

        {/* Global Error Banner */}
        {localError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-2xl flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{localError}</span>
          </motion.div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Developer Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
                className={`block w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-xs text-white placeholder-slate-500 transition-all ${
                  emailError ? 'border-rose-500/50 focus:border-rose-500/80 focus:ring-rose-500/10' : ''
                }`}
                placeholder="developer@domain.com"
              />
            </div>
            {emailError && (
              <p className="text-[10px] text-rose-400 flex items-center space-x-1 pl-1 pt-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Password</label>
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-350 transition-colors"
              >
                Forgot secret?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => validatePassword(e.target.value)}
                className={`block w-full pl-10 pr-10 py-3 rounded-2xl glass-input text-xs text-white placeholder-slate-500 transition-all ${
                  passwordError ? 'border-rose-500/50 focus:border-rose-500/80 focus:ring-rose-500/10' : ''
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[10px] text-rose-400 flex items-center space-x-1 pl-1 pt-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading || !!emailError || !!passwordError}
              className="group relative w-full flex justify-center py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-755 text-xs font-bold text-white transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                'Sign In Security Tunnel'
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleGuestLogin}
              className="group relative w-full flex justify-center py-3.5 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 text-xs font-bold text-indigo-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/15 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              Continue as Guest (Offline Mode)
            </button>
          </div>
        </form>

        {/* OR Spacer */}
        <div className="flex items-center my-4 text-[10px] font-bold text-slate-550 uppercase tracking-widest">
          <div className="h-px bg-slate-800/80 flex-1"></div>
          <span className="px-3">Social Federated OAuth</span>
          <div className="h-px bg-slate-800/80 flex-1"></div>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={handleGuestLogin} 
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-700 transition-all text-slate-350 hover:text-white"
            title="Sign in with GitHub"
          >
            {/* Custom GitHub SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
          </button>
          <button 
            onClick={handleGuestLogin}
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-700 transition-all text-slate-350 hover:text-white"
            title="Sign in with LinkedIn"
          >
            {/* Custom LinkedIn SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </button>
          <button 
            onClick={handleGuestLogin}
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-700 transition-all text-slate-350 hover:text-white"
            title="Sign in with Google"
          >
            {/* Custom Google SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.88-6.435-6.435s2.88-6.435 6.435-6.435c1.637 0 3.136.608 4.29 1.625l3.072-3.072C19.123 2.185 15.897 1 12.24 1v22c5.99 0 10.983-4.39 10.983-11 0-.745-.09-1.465-.245-2.143H12.24z"/>
            </svg>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400">
            First time in the terminal?{' '}
            <Link to="/signup" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
              Create developer account
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal Overlay */}
      <AnimatePresence>
        {showForgotModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl relative space-y-4"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
            >
              <button 
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotError('');
                  setForgotSuccess('');
                  setForgotEmail('');
                }}
                className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 border border-white/5 text-slate-450 hover:text-white transition-all"
              >
                <X size={14} />
              </button>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-white">Reset Security Secret</h3>
                <p className="text-[10px] text-slate-400">Enter your developer email to receive a recovery credentials token.</p>
              </div>

              {forgotError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] p-2.5 rounded-xl flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] p-2.5 rounded-xl leading-normal">
                  {forgotSuccess}
                </div>
              )}

              {!forgotSuccess && (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Verified Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-xs font-bold text-white transition-colors"
                  >
                    {forgotLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Compile Recovery Request'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignIn;
