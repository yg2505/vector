"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Check, 
  ArrowRight,
  BookOpen,
  Clock,
  ExternalLink
} from "lucide-react";

interface RewriteSuggestion {
  original: string;
  improved: string;
  rationale: string;
}

interface AnalysisResults {
  ats_score: number;
  strengths: string[];
  weaknesses: string[];
  rewrite_suggestions: RewriteSuggestion[];
  keyword_recommendations: string[];
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.getResumeHistory();
      setHistory(res);
      // Load latest resume into view if history exists
      if (res && res.length > 0 && !results) {
        const latest = res[0];
        if (latest.feedback_json) {
          try {
            setResults(JSON.parse(latest.feedback_json));
          } catch {}
        }
      }
    } catch (err) {
      console.error("Failed to load resume history:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF resume file first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.analyzeResume(file);
      setResults(res.feedback);
      setSuccess(`Resume '${res.file_name}' successfully analyzed! Score: ${res.ats_score}/100.`);
      setFile(null);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || "Resume upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadPastAnalysis = (pastResume: any) => {
    if (pastResume.feedback_json) {
      try {
        setResults(JSON.parse(pastResume.feedback_json));
        setSuccess(`Loaded history analysis for: ${pastResume.file_name}`);
      } catch {}
    }
  };

  return (
    <div className="page-shell animate-fade-in-up">
      <div>
        <p className="page-eyebrow">ATS & Keyword Review</p>
        <h1 className="page-title">
          Resume{" "}
          <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
            Analyzer
          </span>
        </h1>
        <p className="page-subtitle">
          Optimize your resume for ATS systems and increase target role match rates
        </p>
      </div>

      <div className="resume-grid-split">
        <div className="element-gap">
          <div className="glass-card card-body-lg element-gap">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-neon-cyan" />
              Upload Resume
            </h3>
            
            <form onSubmit={handleUpload} className="element-gap">
              <div className="relative border-2 border-dashed border-white/10 hover:border-neon-cyan/40 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white/[0.01] transition-all cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-neon-cyan" />
                </div>
                
                <div className="text-center">
                  <p className="text-xs font-semibold text-white">
                    {file ? file.name : "Select Resume PDF"}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    PDF format, max 5MB
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              {success && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{success}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="glass-btn w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Begin ATS Audit"}
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* History Logger */}
          {history.length > 0 && (
            <div className="glass-card card-body-lg element-gap">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-neon-purple" />
                Audit Log History
              </h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.map((h) => (
                  <div 
                    key={h.id}
                    onClick={() => loadPastAnalysis(h)}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-neon-purple/30 transition-all cursor-pointer text-xs"
                  >
                    <div className="truncate pr-4">
                      <p className="font-semibold text-white truncate">{h.file_name}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(h.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-black text-neon-cyan px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/20">
                      {h.ats_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className="element-gap">
          
          {results ? (
            <>
              {/* ATS Circle Gauge & Strengths/Weaknesses Split */}
              <div className="responsive-grid-3">
                <div className="glass-card card-body-lg flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Overall ATS Score</p>
                  
                  <div className="relative w-36 h-36 flex items-center justify-center mt-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/5"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-neon-cyan"
                        strokeWidth="3.5"
                        strokeDasharray={`${results.ats_score}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-4xl font-black text-white">{results.ats_score}</span>
                      <span className="text-[10px] text-gray-500 block uppercase font-bold mt-0.5">/100 pts</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card card-body-lg responsive-grid-2">
                    <div className="responsive-grid-2">
                    
                    {/* Strengths */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-neon-cyan" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-1.5 list-disc pl-4">
                        {results.strengths.map((str, idx) => (
                          <li key={idx} className="text-xs text-gray-300 leading-relaxed">
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Critical Gaps
                      </h4>
                      <ul className="space-y-1.5 list-disc pl-4">
                        {results.weaknesses.map((weak, idx) => (
                          <li key={idx} className="text-xs text-gray-300 leading-relaxed">
                            {weak}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

              </div>

              {/* Recommended Keywords to add */}
              {results.keyword_recommendations && results.keyword_recommendations.length > 0 && (
                <div className="glass-card card-body-lg element-gap">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-neon-indigo" />
                    Recommended Keywords to Inject
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    ATS algorithms count key terms. Inject these missing words into project summaries or core qualifications:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {results.keyword_recommendations.map((kw, idx) => (
                      <span 
                        key={idx}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-neon-indigo/10 border border-neon-indigo/20 text-neon-indigo"
                      >
                        +{kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewrite Comparisons */}
              {results.rewrite_suggestions && results.rewrite_suggestions.length > 0 && (
                <div className="glass-card card-body-lg element-gap">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-neon-purple" />
                    Quantified Bullet-Point Rewrites
                  </h4>

                  <div className="element-gap">
                    {results.rewrite_suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="card-body rounded-xl border border-white/5 bg-white/[0.01] element-gap"
                      >
                        <div className="responsive-grid-2">
                          {/* Original line */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Original (Weak)</span>
                            <p className="text-gray-400 italic bg-red-500/5 p-2 border border-red-500/10 rounded-lg">
                              "{sug.original}"
                            </p>
                          </div>
                          
                          {/* Improved line */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest block">Improved (ATS Ready)</span>
                            <p className="text-white font-medium bg-neon-cyan/5 p-2 border border-neon-cyan/10 rounded-lg">
                              "{sug.improved}"
                            </p>
                          </div>
                        </div>

                        <div className="text-[11px] text-gray-400 leading-relaxed pt-1 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-neon-cyan shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-gray-300">Rationale:</strong> {sug.rationale}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Empty audit state */
            <div className="empty-state glass-card">
              <FileText className="w-16 h-16 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Resume Audit Active</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Upload your resume PDF in the upload section to run an instant ATS review and extract keywords.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
