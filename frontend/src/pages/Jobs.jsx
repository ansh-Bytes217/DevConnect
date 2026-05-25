import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Search, Plus, MapPin, Tag, Trash2, FileText, Check, X, 
  CornerDownLeft, Loader2, ListCollapse, BarChart3, Users2, ShieldCheck, 
  ChevronDown, ChevronUp, Link as LinkIcon, Phone, MessageSquare, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_JOBS = [
  {
    _id: 'mock_job_1',
    title: 'Senior Frontend Engineer (React/TypeScript)',
    company: 'Vercel',
    location: 'Remote (US/Europe)',
    jobType: 'Full-time',
    description: 'We are looking for a Senior Frontend Engineer to help build the future of Web development. You will contribute directly to Next.js dashboard features, deploy optimizations, and custom web core vitals trackers. Experience with caching and edge architectures is highly valued.',
    skillsRequired: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    postedBy: {
      _id: 'mock_user_dan',
      username: 'Dan_The_Coder',
      profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dan'
    },
    applicants: [
      {
        userId: 'mock_applicant_sarah',
        username: 'Sarah_ShaderArt',
        email: 'sarah@shaderart.dev',
        phone: '+1 415-555-2026',
        portfolio: 'https://sarahshader.art',
        resumeName: 'sarah_shader_threejs.pdf',
        matchScore: 94,
        status: 'Shortlisted'
      },
      {
        userId: 'mock_applicant_alex',
        username: 'Alex_GoDev',
        email: 'alex.go@golang.org',
        phone: '+1 650-555-0912',
        portfolio: 'https://github.com/alexgo',
        resumeName: 'alex_systems_cv.pdf',
        matchScore: 78,
        status: 'Pending'
      }
    ],
    views: 142,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    _id: 'mock_job_2',
    title: 'Backend Systems Engineer (Golang & Kubernetes)',
    company: 'Supabase',
    location: 'Singapore / Hybrid',
    jobType: 'Full-time',
    description: 'Join our systems team to work on Postgres clustering, connection pools, and containerized scale-out configurations. You will write high-performance Go libraries and manage cloud-native deployments.',
    skillsRequired: ['Go', 'Postgres', 'Kubernetes', 'Docker'],
    postedBy: {
      _id: 'mock_user_sarah',
      username: 'Sarah_ShaderArt',
      profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah'
    },
    applicants: [],
    views: 89,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

const Jobs = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'recruiter'
  
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedApplyJob, setSelectedApplyJob] = useState(null);
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantPortfolio, setApplicantPortfolio] = useState('');
  const [applicantResume, setApplicantResume] = useState('default_developer_resume.pdf');
  const [applyLoading, setApplyLoading] = useState(false);

  // Post Job Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');

  // Expandable candidate details
  const [expandedJobId, setExpandedJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedJobs = localStorage.getItem('mock_jobs');
      if (storedJobs) {
        setJobs(JSON.parse(storedJobs));
      } else {
        localStorage.setItem('mock_jobs', JSON.stringify(MOCK_JOBS));
        setJobs(MOCK_JOBS);
      }
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`/jobs?q=${searchQuery}`);
      // Merge views/applicants count in real backend datasets if missing
      const backendJobs = res.data.map(j => ({
        ...j,
        views: j.views || Math.floor(Math.random() * 40) + 5,
        applicants: j.applicants || []
      }));
      setJobs(backendJobs);
    } catch (err) {
      console.error('Error fetching jobs, utilizing mock datasets:', err.message);
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Filter locally or fetch from backend
    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedJobs = localStorage.getItem('mock_jobs');
      const allJobs = storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS;
      setJobs(allJobs.filter(j => 
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.skillsRequired.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
    } else {
      fetchJobs();
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) return;

    const skillsArray = skillsRequired
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newJobPayload = {
      title,
      company,
      location,
      jobType,
      description,
      skillsRequired: skillsArray,
      postedBy: {
        _id: currentUser?._id || 'mock_guest_9999',
        username: currentUser?.username || 'GuestDev',
        profilePicture: currentUser?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username}`
      },
      applicants: [],
      views: 0,
      createdAt: new Date().toISOString()
    };

    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedJobs = localStorage.getItem('mock_jobs');
      const allJobs = storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS;
      const updatedJobs = [{ ...newJobPayload, _id: `mock_job_${Math.random()}` }, ...allJobs];
      localStorage.setItem('mock_jobs', JSON.stringify(updatedJobs));
      setJobs(updatedJobs);
      setShowPostModal(false);
      resetPostForm();
      return;
    }

    try {
      const res = await axios.post('/jobs', newJobPayload);
      setJobs([res.data, ...jobs]);
      setShowPostModal(false);
      resetPostForm();
    } catch (err) {
      console.error('Error posting job:', err.message);
    }
  };

  const resetPostForm = () => {
    setTitle('');
    setCompany('');
    setLocation('');
    setJobType('Full-time');
    setDescription('');
    setSkillsRequired('');
  };

  const openApplyModal = (job) => {
    setSelectedApplyJob(job);
    setShowApplyModal(true);
    setApplicantPhone('');
    setApplicantPortfolio('');
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    setApplyLoading(true);

    setTimeout(async () => {
      const newApplicant = {
        userId: currentUser._id,
        username: currentUser.username,
        email: currentUser.email,
        phone: applicantPhone,
        portfolio: applicantPortfolio || 'https://github.com/' + currentUser.username,
        resumeName: applicantResume,
        matchScore: Math.floor(Math.random() * 25) + 75, // Simulated ATS Score
        status: 'Pending'
      };

      if (localStorage.getItem('token') === 'mock-guest-token') {
        const storedJobs = localStorage.getItem('mock_jobs');
        const allJobs = storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS;
        const updated = allJobs.map(j => {
          if (j._id === selectedApplyJob._id) {
            const currentApplicants = Array.isArray(j.applicants) ? j.applicants : [];
            // Support backward compatibility (if old applicants were just strings)
            const cleanApplicants = currentApplicants.filter(a => typeof a === 'object');
            return { ...j, applicants: [newApplicant, ...cleanApplicants] };
          }
          return j;
        });
        localStorage.setItem('mock_jobs', JSON.stringify(updated));
        setJobs(updated);
      } else {
        try {
          // Register application metadata on backend route if supported
          await axios.post(`/jobs/${selectedApplyJob._id}/apply`, newApplicant);
          // Refresh list
          fetchJobs();
        } catch (err) {
          console.warn('Backend custom application object fail, fallback locally:', err.message);
          // Fallback locally
          setJobs(jobs.map(j => {
            if (j._id === selectedApplyJob._id) {
              const currentApplicants = Array.isArray(j.applicants) ? j.applicants : [];
              return { ...j, applicants: [newApplicant, ...currentApplicants] };
            }
            return j;
          }));
        }
      }

      setApplyLoading(false);
      setShowApplyModal(false);
      alert('Application transmitted securely to recruiter console.');
    }, 1200);
  };

  const handleUpdateApplicantStatus = async (jobId, applicantUserId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock-guest-token') {
      const updatedJobs = jobs.map(j => {
        if (j._id === jobId) {
          const updatedApplicants = j.applicants.map(app => {
            if (app.userId === applicantUserId) {
              return { ...app, status: newStatus };
            }
            return app;
          });
          return { ...j, applicants: updatedApplicants };
        }
        return j;
      });

      setJobs(updatedJobs);
      localStorage.setItem('mock_jobs', JSON.stringify(updatedJobs));
      return;
    }

    try {
      await axios.put(`/jobs/${jobId}/applicants/${applicantUserId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
      alert(`Candidate status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating candidate status:', err.message);
      alert('Failed to update candidate status on server.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;

    if (localStorage.getItem('token') === 'mock-guest-token') {
      const storedJobs = localStorage.getItem('mock_jobs');
      const allJobs = storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS;
      const updated = allJobs.filter(j => j._id !== jobId);
      localStorage.setItem('mock_jobs', JSON.stringify(updated));
      setJobs(updated);
      return;
    }

    try {
      await axios.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err.message);
    }
  };

  // Recruiter analytics calculations
  const postedByMe = jobs.filter(j => j.postedBy?._id === currentUser?._id || j.postedBy?.username === currentUser?.username);
  // If in guest mode and no jobs posted by me, let's treat mock_job_1 as posted by me for recruitment dashboard visibility!
  const recruiterJobsList = localStorage.getItem('token') === 'mock-guest-token' ? jobs : postedByMe;

  const totalApplicantsCount = recruiterJobsList.reduce((acc, j) => acc + (j.applicants?.length || 0), 0);
  const totalViewsCount = recruiterJobsList.reduce((acc, j) => acc + (j.views || 0), 0);
  
  const getATSShortlistRate = () => {
    let shortlisted = 0;
    let total = 0;
    recruiterJobsList.forEach(j => {
      j.applicants?.forEach(a => {
        if (typeof a === 'object') {
          total++;
          if (a.status === 'Shortlisted') shortlisted++;
        }
      });
    });
    return total === 0 ? '0%' : Math.round((shortlisted / total) * 100) + '%';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-2">
      
      {/* LEFT COLUMN: JOB BOARD NAVIGATION SHORTCUTS */}
      <div className="lg:col-span-3 space-y-6">
        <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-xl space-y-4">
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider pl-2 border-b border-white/5 pb-2">
            Job Console
          </h3>
          
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('board')}
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'board'
                  ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Briefcase size={16} />
              <span>Find Jobs</span>
            </button>

            <button
              onClick={() => setActiveTab('recruiter')}
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'recruiter'
                  ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Users2 size={16} />
              <span>Recruiter Console</span>
            </button>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-indigo-600/15"
          >
            <Plus size={14} />
            <span>Post a Job</span>
          </button>
        </div>

        {/* LinkedIn-style tools */}
        <div className="glass-panel p-4 rounded-3xl border border-white/5 shadow-xl space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Job Seeker Tools</span>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
              <Bookmark size={14} className="text-indigo-400" />
              <span>My Jobs</span>
            </div>
            <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
              <Bell size={14} className="text-indigo-400" />
              <span>Job Alerts</span>
            </div>
            <div className="flex items-center space-x-2.5 hover:text-white transition-colors cursor-pointer">
              <ShieldCheck size={14} className="text-indigo-400" />
              <span>Skill Assessments</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: MAIN CONTENT FEED (BOARD OR ANALYTICS) */}
      <div className="lg:col-span-9">
        {activeTab === 'recruiter' ? (
        /* RECRUITER CONSOLE TAB */
        <div className="space-y-6">
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Listings</span>
              <span className="text-2xl font-extrabold text-white mt-1.5">{recruiterJobsList.length}</span>
              <div className="flex items-center space-x-1 mt-2 text-[9px] text-indigo-400">
                <Briefcase size={10} />
                <span>Live in directory</span>
              </div>
            </div>
            
            <div className="glass-panel p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Candidates</span>
              <span className="text-2xl font-extrabold text-white mt-1.5">{totalApplicantsCount}</span>
              <div className="flex items-center space-x-1 mt-2 text-[9px] text-emerald-400">
                <Users2 size={10} />
                <span>Applications received</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Listing Views</span>
              <span className="text-2xl font-extrabold text-white mt-1.5">{totalViewsCount}</span>
              <div className="flex items-center space-x-1 mt-2 text-[9px] text-cyan-400">
                <BarChart3 size={10} />
                <span>Traffic analytics</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ATS Shortlist Rate</span>
              <span className="text-2xl font-extrabold text-white mt-1.5">{getATSShortlistRate()}</span>
              <div className="flex items-center space-x-1 mt-2 text-[9px] text-purple-400">
                <ShieldCheck size={10} />
                <span>Quality ATS match score</span>
              </div>
            </div>
          </div>

          {/* List of my jobs & applicant management table */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-slate-350 uppercase tracking-wider pl-1">Listings applicant managers</h3>
            
            {recruiterJobsList.length === 0 ? (
              <div className="glass-panel p-8 text-center text-xs text-slate-500 rounded-3xl border border-slate-850">
                No job listings found. Switch to "Find Jobs" or post a new job to start receiving developer applications.
              </div>
            ) : (
              recruiterJobsList.map((job) => {
                const isExpanded = expandedJobId === job._id;
                // Parse applicants
                const jobApplicants = Array.isArray(job.applicants) 
                  ? job.applicants.filter(a => typeof a === 'object') 
                  : [];

                return (
                  <div key={job._id} className="glass-panel rounded-3xl border border-slate-850 overflow-hidden">
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : job._id)}
                      className="w-full p-5 text-left flex justify-between items-center bg-slate-950/20 hover:bg-slate-905/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-550/15 font-semibold">
                          {job.jobType}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-0.5"><MapPin size={10} /> <span>{job.location}</span></span>
                          <span>•</span>
                          <span>{job.views} views</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3.5">
                        <span className="text-xs bg-slate-900 border border-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-xl">
                          {jobApplicants.length} Applicants
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden border-t border-slate-900 bg-slate-950/40"
                        >
                          <div className="p-4 overflow-x-auto">
                            {jobApplicants.length === 0 ? (
                              <p className="text-[11px] text-slate-500 text-center py-6">No developer profiles have registered for this position yet.</p>
                            ) : (
                              <table className="w-full text-left text-xs min-w-[700px]">
                                <thead>
                                  <tr className="border-b border-slate-900 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                                    <th className="pb-3 pl-2">Applicant</th>
                                    <th className="pb-3">ATS Matching</th>
                                    <th className="pb-3">Contact</th>
                                    <th className="pb-3">Selected Resume</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right pr-2">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-900">
                                  {jobApplicants.map((app, idx) => (
                                    <tr key={idx} className="hover:bg-slate-900/10">
                                      <td className="py-3.5 pl-2 flex items-center space-x-2.5">
                                        <img 
                                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${app.username}`} 
                                          alt="avatar" 
                                          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                                        />
                                        <div>
                                          <span className="font-bold text-slate-200 block">{app.username}</span>
                                          <span className="text-[9px] text-slate-450 block truncate max-w-[150px]">{app.email}</span>
                                        </div>
                                      </td>
                                      
                                      <td className="py-3.5">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-12 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                                            <div 
                                              className={`h-full rounded-full ${
                                                app.matchScore >= 85 ? 'bg-emerald-500' : app.matchScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                                              }`}
                                              style={{ width: `${app.matchScore}%` }}
                                            />
                                          </div>
                                          <span className={`font-bold ${
                                            app.matchScore >= 85 ? 'text-emerald-400' : app.matchScore >= 70 ? 'text-amber-400' : 'text-rose-400'
                                          }`}>{app.matchScore}%</span>
                                        </div>
                                      </td>

                                      <td className="py-3.5 space-y-1 text-[10px]">
                                        <div className="flex items-center space-x-1 text-slate-400">
                                          <Phone size={10} />
                                          <span>{app.phone || 'None provided'}</span>
                                        </div>
                                        {app.portfolio && (
                                          <a 
                                            href={app.portfolio} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300"
                                          >
                                            <LinkIcon size={10} />
                                            <span className="max-w-[120px] truncate">{app.portfolio.replace('https://', '')}</span>
                                          </a>
                                        )}
                                      </td>

                                      <td className="py-3.5">
                                        <div className="flex items-center space-x-1 text-slate-300">
                                          <FileText size={12} className="text-indigo-400" />
                                          <span className="max-w-[140px] truncate text-[10px]" title={app.resumeName}>{app.resumeName}</span>
                                        </div>
                                      </td>

                                      <td className="py-3.5">
                                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                          app.status === 'Shortlisted' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                            : app.status === 'Rejected'
                                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                                        }`}>
                                          {app.status}
                                        </span>
                                      </td>

                                      <td className="py-3.5 text-right pr-2 space-x-1.5">
                                        {app.status !== 'Shortlisted' && (
                                          <button
                                            onClick={() => handleUpdateApplicantStatus(job._id, app.userId, 'Shortlisted')}
                                            className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 px-2 py-1 rounded-lg text-[9px] transition-colors"
                                          >
                                            Shortlist
                                          </button>
                                        )}
                                        {app.status !== 'Rejected' && (
                                          <button
                                            onClick={() => handleUpdateApplicantStatus(job._id, app.userId, 'Rejected')}
                                            className="bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-2 py-1 rounded-lg text-[9px] transition-colors"
                                          >
                                            Reject
                                          </button>
                                        )}
                                        <button
                                          onClick={() => navigate(`/chat?userId=${app.userId}`)}
                                          className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20 transition-all inline-flex items-center justify-center align-middle"
                                          title="Send DM Message"
                                        >
                                          <MessageSquare size={12} />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* FIND JOBS BOARD TAB */
        <div className="space-y-4">
          {/* SEARCH AND FILTER */}
          <form onSubmit={handleSearchSubmit} className="flex max-w-md space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search jobs by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 border border-slate-800"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
            </div>
            <button
              type="submit"
              className="bg-indigo-600/20 hover:bg-indigo-650 text-indigo-400 hover:text-white border border-indigo-500/20 font-bold px-5 rounded-2xl text-xs transition-colors"
            >
              Search
            </button>
          </form>

          {/* JOBS LISTINGS */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10">No active job listings found.</p>
            ) : (
              jobs.map((job) => {
                // Determine application status
                const applicantEntry = Array.isArray(job.applicants) 
                  ? job.applicants.find(a => a?.userId === currentUser?._id || a === currentUser?._id)
                  : null;

                const hasApplied = !!applicantEntry;
                const isOwner = job.postedBy?._id === currentUser?._id || job.postedBy?.username === currentUser?.username;

                return (
                  <motion.div
                    key={job._id}
                    className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-md flex flex-col justify-between md:flex-row gap-6 relative"
                    layout
                  >
                    {/* Left Side: Job Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-slate-100">{job.title}</h3>
                          <p className="text-xs text-indigo-400 font-semibold mt-0.5">{job.company}</p>
                        </div>

                        <div className="flex space-x-2">
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                            {job.jobType}
                          </span>
                          <span className="text-[10px] bg-slate-900 text-slate-400 border border-slate-850 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                            <MapPin size={10} />
                            <span>{job.location}</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {job.description}
                      </p>

                      {/* Skills tags */}
                      {job.skillsRequired?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skillsRequired.map((s, idx) => (
                            <span key={idx} className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Poster details */}
                      <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900/60 flex items-center space-x-1.5">
                        <span>Posted by</span>
                        <img 
                          src={job.postedBy?.profilePicture || `https://api.dicebear.com/7.x/bottts/svg?seed=${job.postedBy?.username}`}
                          alt="Poster avatar" 
                          className="w-4 h-4 rounded-full bg-slate-800"
                        />
                        <span className="font-semibold text-slate-450">{job.postedBy?.username || 'Recruiter'}</span>
                        <span>•</span>
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Right Side: Apply Actions */}
                    <div className="flex md:flex-col justify-end md:justify-center items-end gap-3 min-w-[120px]">
                      {hasApplied ? (
                        <button
                          disabled
                          className="w-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-default"
                        >
                          <Check size={12} />
                          <span>Applied ({applicantEntry.status || 'Pending'})</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openApplyModal(job)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10 text-center"
                        >
                          Easy Apply
                        </button>
                      )}

                      {isOwner && (
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="w-full md:w-auto p-2 bg-slate-900 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/25 rounded-xl transition-all flex items-center justify-center space-x-1"
                          title="Delete Listing"
                        >
                          <Trash2 size={12} />
                          <span className="md:hidden text-xs">Delete Position</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* POST JOB OVERLAY SLIDE-DOWN MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="font-bold text-sm text-white">Create a New Job Listing</h3>
                <button 
                  onClick={() => setShowPostModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-900 text-slate-450 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Go Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. OpenAI"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco / Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Required Skills (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Node.js, WebSockets, Go"
                      value={skillsRequired}
                      onChange={(e) => setSkillsRequired(e.target.value)}
                      className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Description</label>
                  <textarea
                    placeholder="Describe the role, tech stack, responsibilities, and team structure..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full glass-input rounded-xl p-3 text-xs text-white border border-slate-800 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold py-2 px-5 rounded-xl text-xs transition-colors border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-705 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10"
                  >
                    Publish Listing
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EASY APPLY MODAL OVERLAY */}
      <AnimatePresence>
        {showApplyModal && selectedApplyJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">Easy Application Tunnel</h3>
                  <p className="text-[10px] text-indigo-400 font-semibold">{selectedApplyJob.title} • {selectedApplyJob.company}</p>
                </div>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-450 hover:text-white border border-slate-800"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Applicant Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.username}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-slate-400 border border-slate-800 cursor-not-allowed bg-slate-950/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Verification Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 555-0199"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Portfolio / Github URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/myusername"
                    value={applicantPortfolio}
                    onChange={(e) => setApplicantPortfolio(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-400">Select ATS Optimized Resume</label>
                  <select
                    value={applicantResume}
                    onChange={(e) => setApplicantResume(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white border border-slate-800"
                  >
                    <option value="developer_cv_main.pdf">developer_cv_main.pdf (ATS Scanned Score: 92%)</option>
                    <option value="react_native_profile.pdf">react_native_profile.pdf (ATS Scanned Score: 85%)</option>
                    <option value="guest_portfolio_cv.pdf">guest_portfolio_cv.pdf (ATS Scanned Score: 78%)</option>
                  </select>
                  <p className="text-[8px] text-slate-500 italic pl-0.5">Note: ATS scores loaded directly from your AI Resume Scanner profile.</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-350 px-4 py-2 rounded-xl text-xs font-bold border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-650/15 flex items-center justify-center min-w-[120px]"
                  >
                    {applyLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

    </div>
  );
};

export default Jobs;
