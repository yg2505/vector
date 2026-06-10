"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { 
  Award, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  Check, 
  ArrowRight,
  TrendingUp,
  Brain,
  RotateCcw
} from "lucide-react";

interface Skill {
  id: number;
  user_id: number;
  name: string;
  status: string; // "mastered", "learning", "gap"
  category: string | null;
  created_at: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.getSkills();
      setSkills(res);
    } catch (err: any) {
      setError(err.message || "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (skillId: number, currentStatus: string) => {
    let nextStatus = "learning";
    if (currentStatus === "gap") {
      nextStatus = "learning";
    } else if (currentStatus === "learning") {
      nextStatus = "mastered";
    } else {
      nextStatus = "gap";
    }

    try {
      // Optimistic UI update
      setSkills(prev => 
        prev.map(s => s.id === skillId ? { ...s, status: nextStatus } : s)
      );
      await api.updateSkillStatus(skillId, nextStatus);
    } catch (err: any) {
      console.error("Failed to update status", err);
      fetchSkills(); // revert on error
    }
  };

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await api.triggerGapAnalysis();
      setSuccessMsg(`Skill gap analysis complete! Your target role readiness score is calculated at ${res.readiness_score}%.`);
      fetchSkills();
    } catch (err: any) {
      setError(err.message || "AI Analysis failed. Make sure you set a target role.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" />
      </div>
    );
  }

  // Filter skills
  const masteredSkills = skills.filter(s => s.status === "mastered");
  const learningSkills = skills.filter(s => s.status === "learning");
  const gapSkills = skills.filter(s => s.status === "gap");

  const totalSkillsCount = skills.length;
  const masteredPercent = totalSkillsCount > 0 
    ? Math.round((masteredSkills.length / totalSkillsCount) * 100) 
    : 0;

  return (
    <div className="page-shell animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Skill Gap{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
              Matrix
            </span>
          </h1>
          <p className="page-subtitle">
            Map out your current competencies and identify missing requirements
          </p>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={analyzing}
          className="glass-btn flex items-center gap-2 text-sm disabled:opacity-60 shrink-0 self-start md:self-auto"
        >
          <Sparkles className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`} />
          {analyzing ? "Analyzing Gaps..." : "Run AI Skill Analysis"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="glass-card card-body flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5 text-neon-cyan" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Role Requirements Match</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Upload your resume or toggle skills manually to improve your score
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-3xl font-extrabold text-white">{masteredPercent}%</span>
          <div className="w-28 bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-neon-cyan to-neon-indigo h-full rounded-full transition-all duration-700"
              style={{ width: `${masteredPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skill Columns */}
      {skills.length > 0 ? (
        <div className="responsive-grid-3">

          {/* Mastered Column */}
          <div className="glass-card card-body space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_6px_rgba(0,242,254,0.7)]" />
                <h3 className="text-sm font-bold text-white">Mastered</h3>
              </div>
              <span className="badge badge-cyan">{masteredSkills.length}</span>
            </div>
            
            <div className="flex flex-col gap-2">
              {masteredSkills.map((skill) => (
                <div 
                  key={skill.id}
                  onClick={() => handleToggleStatus(skill.id, skill.status)}
                  className="flex items-center justify-between p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10 hover:border-neon-cyan/30 transition-all duration-200 cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-white">{skill.name}</span>
                  <div className="w-5 h-5 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center group-hover:bg-red-500/10 group-hover:border-red-500/30 transition-colors">
                    <Check className="w-3 h-3 text-neon-cyan group-hover:hidden" />
                    <RotateCcw className="w-3 h-3 text-red-400 hidden group-hover:block" />
                  </div>
                </div>
              ))}
              {masteredSkills.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">No mastered skills recorded.</p>
              )}
            </div>
          </div>

          {/* Learning Column */}
          <div className="glass-card card-body space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-purple shadow-[0_0_6px_rgba(139,92,246,0.7)]" />
                <h3 className="text-sm font-bold text-white">Learning</h3>
              </div>
              <span className="badge badge-indigo">{learningSkills.length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {learningSkills.map((skill) => (
                <div 
                  key={skill.id}
                  onClick={() => handleToggleStatus(skill.id, skill.status)}
                  className="flex items-center justify-between p-3 rounded-xl bg-neon-purple/5 border border-neon-purple/10 hover:border-neon-purple/30 transition-all duration-200 cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-white">{skill.name}</span>
                  <div className="w-5 h-5 rounded-full bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center group-hover:bg-neon-cyan/20 group-hover:border-neon-cyan/30 transition-colors">
                    <BookOpen className="w-3 h-3 text-neon-purple group-hover:hidden" />
                    <Check className="w-3 h-3 text-neon-cyan hidden group-hover:block" />
                  </div>
                </div>
              ))}
              {learningSkills.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">No active subjects in learning.</p>
              )}
            </div>
          </div>

          {/* Skill Gaps Column */}
          <div className="glass-card card-body space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]" />
                <h3 className="text-sm font-bold text-white">Skill Gaps</h3>
              </div>
              <span className="badge badge-red">{gapSkills.length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {gapSkills.map((skill) => (
                <div 
                  key={skill.id}
                  onClick={() => handleToggleStatus(skill.id, skill.status)}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-white">{skill.name}</span>
                  <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center group-hover:bg-neon-purple/20 group-hover:border-neon-purple/30 transition-colors">
                    <HelpCircle className="w-3 h-3 text-red-400 group-hover:hidden" />
                    <BookOpen className="w-3 h-3 text-neon-purple hidden group-hover:block" />
                  </div>
                </div>
              ))}
              {gapSkills.length === 0 && (
                <p className="text-xs text-gray-500 text-center py-6">All target gaps filled! Excellent work.</p>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="empty-state glass-card max-w-xl mx-auto w-full">
          <Brain className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Initialize Skill Assessment</h3>
          <p className="text-sm text-gray-400">
            Please run the AI Skill Gap Analysis to generate target skills based on your career preferences.
          </p>
          <button
            onClick={handleRunAIAnalysis}
            disabled={analyzing}
            className="glass-btn inline-flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Analyze Skill Gaps
          </button>
        </div>
      )}
    </div>
  );
}
