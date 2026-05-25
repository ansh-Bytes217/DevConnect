import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Terminal, Loader2, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validations
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { register, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (val) => {
    setUsername(val);
    if (!val) {
      setUsernameError('Username is required');
    } else if (val.length < 3) {
      setUsernameError('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
    } else {
      setUsernameError('');
    }
  };

  const validateEmail = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(val)) {
      setEmailError('Please enter a valid developer email');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (val) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required');
    } else if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Pre-submit validation check
    if (!username) {
      setUsernameError('Username is required');
      return;
    }
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }

    if (usernameError || emailError || passwordError) return;

    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Backend MongoDB server could be offline.');
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
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-400 border border-indigo-500/15 relative group">
              <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Terminal className="h-10 w-10 stroke-[2.5] relative z-10" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-2">
            <span>Create Account</span>
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Initialize your profile inside the developer directory
          </p>
        </div>

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => validateUsername(e.target.value)}
                className={`block w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-xs text-white placeholder-slate-500 transition-all ${
                  usernameError ? 'border-rose-500/50 focus:border-rose-500/80 focus:ring-rose-500/10' : ''
                }`}
                placeholder="git_username"
              />
            </div>
            {usernameError && (
              <p className="text-[10px] text-rose-400 flex items-center space-x-1 pl-1 pt-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>{usernameError}</span>
              </p>
            )}
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Security Password</label>
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
                placeholder="Min 6 characters"
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !!usernameError || !!emailError || !!passwordError}
              className="group relative w-full flex justify-center py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-755 text-xs font-bold text-white transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                'Instantiate Account Tunnel'
              )}
            </button>
          </div>
        </form>

        {/* OR Spacer */}
        <div className="flex items-center my-4 text-[10px] font-bold text-slate-550 uppercase tracking-widest">
          <div className="h-px bg-slate-800/80 flex-1"></div>
          <span className="px-3">Federated OAuth Registration</span>
          <div className="h-px bg-slate-800/80 flex-1"></div>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={handleGuestLogin}
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-700 transition-all text-slate-350 hover:text-white"
            title="Sign up with GitHub"
          >
            {/* Custom GitHub SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
          </button>
          <button 
            onClick={handleGuestLogin}
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-700 transition-all text-slate-350 hover:text-white"
            title="Sign up with LinkedIn"
          >
            {/* Custom LinkedIn SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </button>
          <button 
            onClick={handleGuestLogin}
            className="flex items-center justify-center p-3 rounded-2xl bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-slate-700 transition-all text-slate-350 hover:text-white"
            title="Sign up with Google"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.88-6.435-6.435s2.88-6.435 6.435-6.435c1.637 0 3.136.608 4.29 1.625l3.072-3.072C19.123 2.185 15.897 1 12.24 1v22c5.99 0 10.983-4.39 10.983-11 0-.745-.09-1.465-.245-2.143H12.24z"/>
            </svg>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-400">
            Already registered inside database?{' '}
            <Link to="/signin" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;
