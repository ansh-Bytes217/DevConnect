import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Sparkles, FileText, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ResumeAnalyzer = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      setResult(null);
    }
  };

  const startAnalysis = () => {
    setAnalyzing(true);
    setProgress(0);
    
    // Simulate analyzing process
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setResult({
            score: 78,
            keywordsMatched: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'JavaScript', 'REST API'],
            missingKeywords: ['Docker', 'Kubernetes', 'WebSockets', 'CI/CD Pipelines', 'TypeScript', 'Jest Unit Tests'],
            formatting: {
              layout: 'Single-Column (Recommended)',
              fontCheck: 'Standard Web Safe (Pass)',
              sectionTitles: 'Standard Headings (Pass)',
              tablesUsed: 'No nested tables (Pass)',
            },
            improvements: [
              'Add technical skill metrics under your project achievements (e.g., "reduced draw calls by 40%").',
              'Inject keywords like "WebSockets" or "TypeScript" inside your experience descriptions to trigger higher ATS relevance.',
              'Ensure experience details follow the standard STAR method (Situation, Task, Action, Result).'
            ]
          });

          // Dispatch simulated resume scan event to big data pipeline
          const token = localStorage.getItem('token');
          if (token) {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            axios.post(`${apiBase}/analytics/mock-event`, {
              type: 'RESUME_SCANNED',
              payload: { fileName: fileName || 'resume.pdf', score: 78 }
            }, {
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => console.log('Analytics logging skipped:', err.message));
          }

          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const resetScanner = () => {
    setFileUploaded(false);
    setFileName('');
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Sparkles size={24} className="text-indigo-400" />
          <span>AI ATS Resume Optimizer</span>
        </h2>
        <p className="text-xs text-slate-400">Scan and evaluate your CV against industry keywords and recruiter formatting standards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: DROP ZONE / SCANNERS */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6 flex flex-col justify-center min-h-[350px]">
            {!fileUploaded ? (
              <div className="border-2 border-dashed border-slate-850 hover:border-indigo-500/40 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="mx-auto w-12 h-12 text-slate-500" />
                <h4 className="mt-3 text-xs font-bold text-slate-200">Upload Resume / CV</h4>
                <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOC, DOCX up to 5MB</p>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center space-x-3 text-left">
                  <FileText className="w-10 h-10 text-indigo-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-200 block truncate">{fileName}</span>
                    <span className="text-[9px] text-slate-500 block">Ready to scan</span>
                  </div>
                </div>

                {analyzing ? (
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-500 h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold block">Analyzing CV semantics... {progress}%</span>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={startAnalysis}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/10"
                    >
                      Analyze CV
                    </button>
                    <button
                      onClick={resetScanner}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-750"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EVALUATION RESULTS DISPLAY */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6"
              >
                {/* Score Header */}
                <div className="flex justify-between items-center bg-slate-900/40 border border-slate-850 p-4 rounded-2xl">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-100">Overall ATS Score</h3>
                    <p className="text-[10px] text-slate-400">Scores above 70 are typically competitive.</p>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center bg-indigo-600/10 rounded-full border border-indigo-500/20">
                    <span className="text-base font-extrabold text-indigo-400">{result.score}</span>
                  </div>
                </div>

                {/* Keyword Analysis */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-200">Semantic Keyword Match</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Matched Keywords */}
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle size={10} />
                        <span>Matched Keywords ({result.keywordsMatched.length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.keywordsMatched.map((k, i) => (
                          <span key={i} className="text-[9px] bg-emerald-500/5 text-emerald-300 border border-emerald-500/15 px-2 py-0.5 rounded">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center space-x-1">
                        <AlertTriangle size={10} />
                        <span>Missing Keywords ({result.missingKeywords.length})</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {result.missingKeywords.map((k, i) => (
                          <span key={i} className="text-[9px] bg-amber-500/5 text-amber-300 border border-amber-500/15 px-2 py-0.5 rounded font-medium">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formatting Checks */}
                <div className="space-y-3 pt-2 border-t border-slate-900/60">
                  <h4 className="text-xs font-bold text-slate-200">Formatting Checklist</h4>
                  <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-300">
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Layout Format</span>
                      <span className="font-semibold">{result.formatting.layout}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Font Integrity</span>
                      <span className="font-semibold text-emerald-400">{result.formatting.fontCheck}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Headings Structure</span>
                      <span className="font-semibold text-emerald-400">{result.formatting.sectionTitles}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 pb-1">
                      <span className="text-slate-500">Table Usage</span>
                      <span className="font-semibold text-emerald-400">{result.formatting.tablesUsed}</span>
                    </div>
                  </div>
                </div>

                {/* Improvement list */}
                <div className="space-y-3 pt-2 border-t border-slate-900/60">
                  <h4 className="text-xs font-bold text-slate-200">Suggested Action Plan</h4>
                  <ul className="list-disc list-inside space-y-2 text-[10px] text-slate-450 leading-relaxed pl-1">
                    {result.improvements.map((imp, idx) => (
                      <li key={idx} className="list-item">{imp}</li>
                    ))}
                  </ul>
                </div>

              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-850 rounded-3xl text-slate-500 min-h-[350px]">
                <FileText className="w-12 h-12 mb-3 stroke-[1.2]" />
                <h4 className="text-xs font-bold text-slate-400">Analysis Results</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">Upload your resume and click Analyze to generate ATS keyword reports and formatting logs here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default ResumeAnalyzer;
