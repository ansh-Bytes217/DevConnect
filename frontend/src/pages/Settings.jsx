import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  Settings as SettingsIcon, User, Shield, Bell, Eye, EyeOff, 
  Trash2, SunMoon, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  // Privacy toggles
  const [showPresence, setShowPresence] = useState(true);
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Settings updated successfully', 'success');
  };

  const handleDeactivate = () => {
    if (window.confirm('WARNING: Are you sure you want to deactivate your developer account? This action is irreversible.')) {
      addToast('Mock deactivation trigger fired', 'info');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <SettingsIcon size={24} className="text-indigo-400" />
          <span>Account Settings</span>
        </h2>
        <p className="text-xs text-slate-400">Configure your professional profile, data privacy, integrations, and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT NAV PANEL */}
        <div className="glass-panel p-4 rounded-3xl border border-slate-800 shadow-xl h-fit space-y-1 bg-slate-900/10">
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-left bg-indigo-600/15 text-indigo-400 border border-indigo-500/10">
            <User size={16} />
            <span>Profile Information</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-left text-slate-450 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent">
            <Shield size={16} />
            <span>Security & Credentials</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-left text-slate-450 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent">
            <Bell size={16} />
            <span>Email Alerts</span>
          </button>
        </div>

        {/* RIGHT COLUMN: MAIN FORM VIEWS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* PROFILE FORM */}
          <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-2 flex items-center space-x-2">
              <User size={16} className="text-indigo-400" />
              <span>Identity & Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Developer Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
                  required
                />
              </div>
            </div>

            {/* Appearance toggles */}
            <div className="pt-4 border-t border-slate-900/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 flex items-center space-x-2">
                <SunMoon size={16} className="text-indigo-400" />
                <span>Appearance & Themes</span>
              </h3>

              <div className="flex justify-between items-center bg-slate-900/30 border border-slate-850 p-4 rounded-2xl">
                <div className="text-xs">
                  <span className="font-bold text-slate-200 block">System Style Theme</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Toggle between Dark Mode and Light Mode configurations.</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-400 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </div>

            {/* Privacy toggles */}
            <div className="pt-4 border-t border-slate-900/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 flex items-center space-x-2">
                <Shield size={16} className="text-indigo-400" />
                <span>Semantics & Privacy</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-900/35 p-3 rounded-2xl border border-slate-850">
                  <div className="text-xs min-w-0">
                    <span className="font-bold text-slate-200 block">Broadcast Presence Activity</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Allow other connected developers to see if you are Coding or In a Meeting.</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPresence(!showPresence)}
                    className="text-indigo-400"
                  >
                    {showPresence ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>

                <div className="flex justify-between items-center bg-slate-900/35 p-3 rounded-2xl border border-slate-850">
                  <div className="text-xs min-w-0">
                    <span className="font-bold text-slate-200 block">Recruiter Search Indexing</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Include your skills profile card in search grids filtered by verified recruiters.</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAllowIndexing(!allowIndexing)}
                    className="text-indigo-400"
                  >
                    {allowIndexing ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-2xl text-xs transition-colors shadow-lg shadow-indigo-600/10"
              >
                Save Settings
              </button>
            </div>
          </form>

          {/* DANGER ZONE */}
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/15 shadow-xl bg-rose-500/5 space-y-4">
            <h3 className="text-sm font-bold text-rose-450 uppercase tracking-wider flex items-center space-x-2">
              <Trash2 size={16} />
              <span>Danger Zone</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once you deactivate your account, your profile data, pinned portfolios, and direct message history logs will be removed.
            </p>
            <button
              onClick={handleDeactivate}
              className="bg-rose-600 hover:bg-rose-750 text-white font-bold py-2.5 px-5 rounded-2xl text-xs transition-colors"
            >
              Deactivate Developer Account
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
