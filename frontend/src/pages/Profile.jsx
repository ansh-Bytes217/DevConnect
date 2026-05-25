import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, Briefcase, GraduationCap, Award, MapPin, Plus, Trash2, 
  ThumbsUp, Check, ExternalLink, Loader2, Code2, Sparkles, 
  Eye, GitPullRequest, Bookmark, Layout, FileDown, SunMoon 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [profileUser, setProfileUser] = useState(null);
  const [isSelf, setIsSelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('portfolio'); // 'social' vs 'portfolio'

  // Form Fields
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [badge, setBadge] = useState('none');
  const [newSkill, setNewSkill] = useState('');

  // Timeline inputs
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const [eduSchool, setEduSchool] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduDuration, setEduDuration] = useState('');

  // Simulated Pinned Repos
  const pinnedRepos = [
    { name: 'websocket-message-broker', desc: 'Lightweight publish-subscribe message broker built in Go utilizing standard channels.', lang: 'Go', stars: 124 },
    { name: 'threejs-shader-art', desc: 'Creative canvas drawing shaders in WebGL with custom vertex displacement mapping.', lang: 'JavaScript', stars: 89 },
    { name: 'nextjs-saas-boilerplate', desc: 'SaaS framework template equipped with Docker clusters, auth setups, and stripe integrations.', lang: 'TypeScript', stars: 312 },
  ];

  // Simulating GitHub activity grids (4 rows representing weeks, days representing activity levels)
  const heatmapRows = Array(7).fill(0).map(() => 
    Array(20).fill(0).map(() => Math.floor(Math.random() * 4)) // 0 = none, 1-3 = different greens
  );

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    const targetId = id || currentUser?._id;
    if (!targetId) {
      setLoading(false);
      return;
    }
    setIsSelf(targetId === currentUser?._id);

    try {
      const res = await axios.get(`/users/profile/${targetId}`);
      setProfileUser(res.data);
      setBio(res.data.bio || '');
      setProfilePicture(res.data.profilePicture || '');
      setBadge(res.data.badge || 'none');
    } catch (err) {
      console.error('Error loading profile, fallback mock active:', err.message);
      // Fallback
      setProfileUser(currentUser);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({
        bio,
        profilePicture,
        badge,
        skills: profileUser.skills,
        experience: profileUser.experience,
        education: profileUser.education
      });
      setProfileUser(updated);
      setEditMode(false);
      addToast('Profile metadata updated', 'success');
    } catch (err) {
      console.error('Update failed:', err.message);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    if (profileUser.skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setNewSkill('');
      return;
    }

    const updatedSkills = [...profileUser.skills, { name: newSkill.trim(), endorsedBy: [] }];
    try {
      const updated = await updateProfile({ ...profileUser, skills: updatedSkills });
      setProfileUser(updated);
      setNewSkill('');
      addToast('Skill tag added', 'success');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const handleRemoveSkill = async (skillName) => {
    const updatedSkills = profileUser.skills.filter(s => s.name !== skillName);
    try {
      const updated = await updateProfile({ ...profileUser, skills: updatedSkills });
      setProfileUser(updated);
      addToast('Skill tag removed', 'info');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!expCompany.trim() || !expRole.trim() || !expDuration.trim()) return;

    const newExp = {
      company: expCompany.trim(),
      role: expRole.trim(),
      duration: expDuration.trim(),
      description: expDesc.trim()
    };
    const updatedExp = [...(profileUser.experience || []), newExp];

    try {
      const updated = await updateProfile({ ...profileUser, experience: updatedExp });
      setProfileUser(updated);
      setExpCompany('');
      setExpRole('');
      setExpDuration('');
      setExpDesc('');
      addToast('Position added to experience', 'success');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const handleRemoveExperience = async (expId) => {
    const updatedExp = profileUser.experience.filter(e => e._id !== expId);
    try {
      const updated = await updateProfile({ ...profileUser, experience: updatedExp });
      setProfileUser(updated);
      addToast('Experience position removed', 'info');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduSchool.trim() || !eduDegree.trim() || !eduDuration.trim()) return;

    const newEdu = { school: eduSchool.trim(), degree: eduDegree.trim(), duration: eduDuration.trim() };
    const updatedEdu = [...(profileUser.education || []), newEdu];

    try {
      const updated = await updateProfile({ ...profileUser, education: updatedEdu });
      setProfileUser(updated);
      setEduSchool('');
      setEduDegree('');
      setEduDuration('');
      addToast('School added to education', 'success');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const handleRemoveEducation = async (eduId) => {
    const updatedEdu = profileUser.education.filter(e => e._id !== eduId);
    try {
      const updated = await updateProfile({ ...profileUser, education: updatedEdu });
      setProfileUser(updated);
      addToast('Education item removed', 'info');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const handleEndorse = async (skillName) => {
    if (isSelf) return;
    try {
      const res = await axios.post('/users/endorse', { targetUserId: profileUser._id, skillName });
      setProfileUser(res.data);
      addToast(`Endorsed ${skillName}!`, 'success');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  const getHeatmapColor = (val) => {
    switch (val) {
      case 1: return 'bg-emerald-900';
      case 2: return 'bg-emerald-700';
      case 3: return 'bg-emerald-500';
      default: return 'bg-slate-900/60 border border-white/5';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Cover Banner + Profile Details */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-white/5 relative">
        <div className="h-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-end justify-between p-4">
          
          {/* Social vs Portfolio Mode Toggle Buttons */}
          <div className="flex space-x-1 p-0.5 bg-slate-900/80 rounded-xl border border-white/10 backdrop-blur">
            <button
              onClick={() => setViewMode('portfolio')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                viewMode === 'portfolio' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Portfolio View
            </button>
            <button
              onClick={() => setViewMode('social')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                viewMode === 'social' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Social View
            </button>
          </div>

          {isSelf && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-slate-900/85 hover:bg-slate-900 text-white font-semibold py-1.5 px-4 rounded-xl text-xs border border-white/10 transition-colors"
            >
              Edit Details
            </button>
          )}
        </div>

        <div className="px-8 pb-8 -mt-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <img
              src={profileUser?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${profileUser?.username}`}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-[#0b0f19] object-cover bg-slate-700 shadow-2xl"
            />
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h2 className="text-2xl font-bold text-white">{profileUser?.username}</h2>
                {profileUser?.badge && profileUser.badge !== 'none' && (
                  <span className={`text-[8px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full ${
                    profileUser.badge === 'open-to-work' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {profileUser.badge.replace('-', ' ')}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-xs max-w-xl">{profileUser?.bio || "No tagline added."}</p>
              <div className="flex items-center text-xs text-slate-400 space-x-1.5 justify-center sm:justify-start">
                <User size={14} className="text-indigo-400" />
                <span>{profileUser?.connections?.length || 0} connections</span>
              </div>
            </div>
          </div>

          {!isSelf && (
            <Link
              to={`/chat?userId=${profileUser?._id}`}
              className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 px-6 rounded-2xl text-xs text-center shadow-lg shadow-indigo-600/15"
            >
              Message Developer
            </Link>
          )}
        </div>
      </div>

      {/* Edit Form Drawer */}
      {editMode && (
        <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Edit Profile Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Bio Tagline</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full glass-input rounded-xl p-3 text-xs text-white"
                placeholder="Briefly state your tech specialization..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Avatar URL</label>
              <input
                type="text"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Employment Badge Status</label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
              >
                <option value="none">No Badge</option>
                <option value="open-to-work">Open to Work</option>
                <option value="hiring">Hiring</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-slate-850 hover:bg-slate-800 text-slate-350 font-semibold py-2 px-5 rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold py-2 px-5 rounded-xl text-xs shadow-md"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* PORTFOLIO VIEW MODE */}
      {viewMode === 'portfolio' ? (
        <div className="space-y-8">
          
          {/* AI generated summary card */}
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/10 shadow-xl bg-indigo-900/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-indigo-400/20">
              <Sparkles size={40} />
            </div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              <span>AI Profile Synthesis Card</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-3.5">
              Synthesized Profile: <span className="font-semibold text-slate-100">{profileUser?.username}</span> is a full-stack engineer specialized in high-performance Web environments. Demonstrates competencies in React development and Node systems, with timeline experience in pair programming environments. Pinned repos indicate skills in WebSockets and creative WebGL shaders.
            </p>
          </div>

          {/* GitHub Sync panel (Pinned repos & heatmaps) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-xs font-bold text-slate-250 uppercase tracking-wider flex items-center space-x-2">
                <Code2 size={16} className="text-indigo-400" />
                <span>GitHub Synced Repository Metrics</span>
              </h3>
              
              <button
                onClick={() => addToast('Simulated GitHub Repo Sync complete!', 'success')}
                className="bg-slate-900 border border-white/5 hover:border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center space-x-1 transition-all"
              >
                <GitPullRequest size={10} />
                <span>Sync Repositories</span>
              </button>
            </div>

            {/* Pinned repos grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pinnedRepos.map((repo, idx) => (
                <div key={idx} className="bg-slate-950/45 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-100 block truncate">{repo.name}</span>
                    <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">{repo.desc}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-900/60">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <span>{repo.lang}</span>
                    </span>
                    <span>★ {repo.stars}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Code contribution heatmap grid */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contribution Activity History</span>
              <div className="overflow-x-auto pb-2">
                <div className="flex flex-col space-y-1 min-w-[320px]">
                  {heatmapRows.map((row, rIdx) => (
                    <div key={rIdx} className="flex space-x-1">
                      {row.map((val, cIdx) => (
                        <div
                          key={cIdx}
                          className={`w-3.5 h-3.5 rounded-sm transition-all ${getHeatmapColor(val)}`}
                          title={`Activity level: ${val}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skill tags */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <Award className="text-indigo-400 w-4 h-4" />
              <span>Developer Competencies & Endorsements</span>
            </h3>

            {isSelf && (
              <form onSubmit={handleAddSkill} className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill tag (React, Go)..."
                  className="flex-1 max-w-sm glass-input rounded-xl px-4 py-2 text-xs text-white border border-white/5"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-750 text-white p-2 rounded-xl transition-all">+</button>
              </form>
            )}

            <div className="flex flex-wrap gap-2.5">
              {profileUser?.skills?.map((skill, index) => {
                const hasEndorsed = skill.endorsedBy?.some(e => e === currentUser?._id);
                return (
                  <div key={index} className="flex items-center space-x-2 bg-slate-900/40 border border-white/5 px-3 py-1.5 rounded-xl text-xs text-slate-350">
                    <span className="font-semibold">{skill.name}</span>
                    <button
                      onClick={() => handleEndorse(skill.name)}
                      disabled={isSelf}
                      className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                        hasEndorsed ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp size={8} />
                      <span>{skill.endorsedBy?.length || 0}</span>
                    </button>
                    {isSelf && (
                      <button onClick={() => handleRemoveSkill(skill.name)} className="text-slate-500 hover:text-rose-450">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timelines grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Experience */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl space-y-6">
              <h3 className="text-xs font-bold text-slate-205 uppercase tracking-wider flex items-center space-x-2">
                <Briefcase className="text-indigo-400 w-4 h-4" />
                <span>Work Experience Timeline</span>
              </h3>

              {isSelf && (
                <form onSubmit={handleAddExperience} className="p-4 bg-slate-900/20 rounded-2xl border border-white/5 space-y-3">
                  <input
                    type="text"
                    placeholder="Company"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white border border-white/5"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white border border-white/5"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={expDuration}
                    onChange={(e) => setExpDuration(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white border border-white/5"
                    required
                  />
                  <textarea
                    placeholder="Key deliverables..."
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 text-xs text-white border border-white/5 resize-none"
                  />
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-1.5 rounded-xl text-xs">Add Position</button>
                </form>
              )}

              <div className="space-y-6 relative pl-4 border-l border-white/5">
                {profileUser?.experience?.map((exp) => (
                  <div key={exp._id} className="relative group space-y-1">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-[#0b0f19]"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{exp.role}</h4>
                        <p className="text-[10px] text-indigo-400 font-semibold">{exp.company}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] text-slate-500">{exp.duration}</span>
                        {isSelf && (
                          <button onClick={() => handleRemoveExperience(exp._id)} className="text-slate-500 hover:text-rose-400">
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl space-y-6">
              <h3 className="text-xs font-bold text-slate-205 uppercase tracking-wider flex items-center space-x-2">
                <GraduationCap className="text-indigo-400 w-4 h-4" />
                <span>Education Timeline</span>
              </h3>

              {isSelf && (
                <form onSubmit={handleAddEducation} className="p-4 bg-slate-900/20 rounded-2xl border border-white/5 space-y-3">
                  <input
                    type="text"
                    placeholder="School"
                    value={eduSchool}
                    onChange={(e) => setEduSchool(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white border border-white/5"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={eduDegree}
                    onChange={(e) => setEduDegree(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white border border-white/5"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={eduDuration}
                    onChange={(e) => setEduDuration(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-1.5 text-xs text-white border border-white/5"
                    required
                  />
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-1.5 rounded-xl text-xs">Add School</button>
                </form>
              )}

              <div className="space-y-6 relative pl-4 border-l border-white/5">
                {profileUser?.education?.map((edu) => (
                  <div key={edu._id} className="relative group space-y-1">
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-[#0b0f19]"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-100">{edu.school}</h4>
                        <p className="text-[10px] text-indigo-400 font-semibold">{edu.degree}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] text-slate-500">{edu.duration}</span>
                        {isSelf && (
                          <button onClick={() => handleRemoveEducation(edu._id)} className="text-slate-500 hover:text-rose-400">
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* SOCIAL FEED VIEW MODE (Mock user activities lists) */
        <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl text-center space-y-4">
          <Bookmark className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-350">Recent Social Activities</h4>
          <p className="text-[10px] text-slate-500 max-w-xs mx-auto">No recent activities found on this profile feed.</p>
        </div>
      )}

    </div>
  );
};

export default Profile;
