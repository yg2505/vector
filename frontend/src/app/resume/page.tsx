"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";
import {
  FileText, UploadCloud, Sparkles, CheckCircle, AlertTriangle,
  TrendingUp, Check, ArrowRight, BookOpen, Clock, Tag, Info, PenLine
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

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 85 ? "#1D9E75" : score >= 65 ? "#BA7517" : "#D85A30";
  const label =
    score >= 85 ? "Excellent" : score >= 65 ? "Good" : "Needs work";
  return (
    <div className="relative w-[120px] h-[120px] shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <path
          d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="3"
        />
        <path
          d="M18 2.0845 a15.9155 15.9155 0 0 1 0 31.831 a15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${score},100`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-medium text-white leading-none">{score}</span>
        <span className="text-[11px] text-white/40 mt-0.5">/100</span>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.getResumeHistory();
      setHistory(res);
      if (res?.length > 0 && !results) {
        const latest = res[0];
        if (latest.feedback_json) {
          try { setResults(JSON.parse(latest.feedback_json)); } catch {}
        }
      }
    } catch {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(""); setSuccess("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a PDF resume file first."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await api.analyzeResume(file);
      setResults(res.feedback);
      setSuccess(`Resume '${res.file_name}' analyzed — score: ${res.ats_score}/100`);
      setFile(null);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || "Upload failed. Try again.");
    } finally { setLoading(false); }
  };

  const loadPastAnalysis = (item: any) => {
    if (item.feedback_json) {
      try {
        setResults(JSON.parse(item.feedback_json));
        setSuccess(`Loaded: ${item.file_name}`);
      } catch {}
    }
  };

  const scoreColor = results
    ? results.ats_score >= 85 ? "#1D9E75" : results.ats_score >= 65 ? "#BA7517" : "#D85A30"
    : undefined;
  const scoreLabel = results
    ? results.ats_score >= 85 ? "Excellent" : results.ats_score >= 65 ? "Good" : "Needs work"
    : undefined;

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

      {/* ── Main grid: left narrow, right wide ── */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "2fr 3fr", alignItems: "start" }}>

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4">

          {/* Upload card */}
          <div className="glass-card card-body-lg flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-neon-cyan" />
              Upload resume
            </h3>
            <form onSubmit={handleUpload} className="flex flex-col gap-3">
              <div className="relative border border-dashed border-white/10 hover:border-neon-cyan/40 rounded-xl min-h-[150px] flex flex-col items-center justify-center gap-3 bg-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group">
                <input
                  type="file" accept=".pdf" onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {file ? file.name : "Drop PDF here"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {file ? "Ready to analyze" : "or click to browse · max 5MB"}
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{error}
                </p>
              )}
              {success && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />{success}
                </p>
              )}

              <button
                type="submit" disabled={loading || !file}
                className="glass-btn w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? "Analyzing…" : "Run ATS audit"}
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* History card */}
          {history.length > 0 && (
            <div className="glass-card card-body-lg flex flex-col gap-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/40" />
                Audit history
              </h3>
              <div className="flex flex-col gap-2">
                {history.map((h) => {
                  const sc = h.ats_score;
                  const badgeColor =
                    sc >= 85 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : sc >= 65 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20";
                  return (
                    <div
                      key={h.id}
                      onClick={() => loadPastAnalysis(h)}
                      className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-white/10 cursor-pointer transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{h.file_name}</p>
                        <p className="text-[11px] text-gray-500 mt-2">
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-5 py-3 rounded-full border shrink-0 ${badgeColor}`}>
                        {sc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-4">
          {results ? (
            <>
              {/* Score hero row */}
              <div className="glass-card card-body-lg flex items-center gap-6">
                <ScoreRing score={results.ats_score} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">ATS score</p>
                  <p className="text-2xl font-bold text-white mb-1">{scoreLabel}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Your resume passes most ATS filters but is missing keywords critical for your target role.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {results.strengths.length} strengths
                    </span>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      {results.weaknesses.length} gaps
                    </span>
                    {results.keyword_recommendations.length > 0 && (
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {results.keyword_recommendations.length} keywords missing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths + Gaps side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card card-body-lg">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Check className="w-3.5 h-3.5" /> Strengths
                  </h4>
                  <ul className="flex flex-col divide-y divide-white/5">
                    {results.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 py-2 text-sm text-gray-300 leading-snug first:pt-0 last:pb-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="glass-card card-body-lg">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-3.5 h-3.5" /> Critical gaps
                  </h4>
                  <ul className="flex flex-col divide-y divide-white/5">
                    {results.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 py-2 text-sm text-gray-300 leading-snug first:pt-0 last:pb-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Keywords */}
              {results.keyword_recommendations.length > 0 && (
                <div className="glass-card card-body-lg flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" /> Keywords to inject
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.keyword_recommendations.map((kw, i) => (
                      <span key={i} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewrites */}
              {results.rewrite_suggestions.length > 0 && (
                <div className="glass-card card-body-lg flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <PenLine className="w-3.5 h-3.5 text-white/40" /> Bullet rewrites
                  </h4>
                  <div className="flex flex-col gap-3">
                    {results.rewrite_suggestions.map((sug, i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 20px 1fr" }}>
                          <div>
                            <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1.5">Original</p>
                            <p className="text-sm text-gray-400 italic bg-red-500/5 border border-red-500/15 rounded-xl p-3 leading-relaxed">
                              "{sug.original}"
                            </p>
                          </div>
                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1.5">Improved</p>
                            <p className="text-sm text-white bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 leading-relaxed">
                              "{sug.improved}"
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 bg-white/[0.02] rounded-lg px-3 py-2 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                          {sug.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state glass-card">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">No audit active</h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Upload a PDF to run an instant ATS review, extract missing keywords, and get bullet rewrites.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["ATS score", "Keyword analysis", "Bullet rewrites", "Gap detection"].map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-500">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}