"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Flame,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Brain,
  Edit2,
  Sparkles,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  full_name: string | null;
  target_role: string | null;
  career_goal: string | null;
  readiness_score: number;
  learning_streak: number;
  skills_mastered_count: number;
  skills_learning_count: number;
  skills_gap_count: number;
  roadmap_completion_percentage: number;
  upcoming_tasks: any[];
}

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "ML Engineer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [careerGoal, setCareerGoal] = useState("");
  const [timeline, setTimeline] = useState(6);
  const [hours, setHours] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboardSummary();
      setData(summary);
      if (summary.target_role) setTargetRole(summary.target_role);
      if (summary.career_goal) setCareerGoal(summary.career_goal);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.updateMe({
        target_role: targetRole,
        career_goal: careerGoal,
        timeline_months: Number(timeline),
        study_hours_per_week: Number(hours),
      });
      await api.triggerGapAnalysis();
      await api.generateRoadmap();
      setIsEditing(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTask = async (taskId: number, currentStatus: string) => {
    try {
      const next = currentStatus === "completed" ? "pending" : "completed";
      await api.updateTaskStatus(taskId, next);
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error("Task update failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" />
      </div>
    );
  }

  const showSetup = !data?.target_role || isEditing;

  const radarData = [
    { subject: "Mastered", A: data?.skills_mastered_count ?? 0, fullMark: 15 },
    { subject: "Learning", A: data?.skills_learning_count ?? 0, fullMark: 15 },
    { subject: "Gaps", A: data?.skills_gap_count ?? 0, fullMark: 15 },
  ];

  return (
    <div className="page-shell animate-fade-in-up">
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Career Overview</p>
          <h1 className="page-title">
            Hi,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #00f2fe, #6366f1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {data?.full_name || "Developer"}
            </span>{" "}
            👋
          </h1>
          <p className="page-subtitle">
            {data?.target_role
              ? `Tracking your journey to becoming an expert ${data.target_role}`
              : "Set your career direction to generate a personalised roadmap"}
          </p>
        </div>
        {!showSetup && (
          <button
            onClick={() => setIsEditing(true)}
            className="glass-btn-secondary shrink-0"
            style={{ padding: "0.5rem 1rem", gap: "0.5rem", fontSize: "0.75rem" }}
          >
            <Edit2 style={{ width: 14, height: 14 }} />
            Edit Goal
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showSetup ? (
        /* ── Onboarding form ── */
        <div className="glass-card-glow-indigo card-body-lg element-gap">
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
              }}
            >
              <Target style={{ width: 20, height: 20, color: "#6366f1" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                Configure Your Career Vector
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: 4 }}>
                We&apos;ll generate a personalised skill gap analysis and week-by-week roadmap.
              </p>
            </div>
          </div>

          <div className="divider" />

          <form onSubmit={handleSaveProfile} className="element-gap">
            <div className="responsive-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="section-label">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="glass-input"
                  style={{ background: "#0d0a18" }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} style={{ background: "#0d0a18" }}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="section-label">Career Goal</label>
                <input
                  type="text"
                  required
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder="e.g. Get a remote AI internship"
                  className="glass-input"
                />
              </div>
            </div>

            <div className="responsive-grid-2">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="section-label">Timeline (months)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                  className="glass-input"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label className="section-label">Study hrs / week</label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  required
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="glass-input"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", paddingTop: 4 }}>
              <button
                type="submit"
                disabled={saving}
                className="glass-btn"
                style={{ flex: 1, gap: "0.5rem", opacity: saving ? 0.5 : 1 }}
              >
                <Sparkles style={{ width: 16, height: 16 }} className={saving ? "animate-spin" : ""} />
                {saving ? "Generating…" : "Generate My Roadmap"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="glass-btn-secondary"
                  style={{ padding: "0.75rem 1.25rem" }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* ── Metric cards row ── */}
          <div className="responsive-grid-4">
            {/* Readiness */}
            <div className="glass-card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem", minHeight: 140, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -12, right: -12, width: 80, height: 80, background: "rgba(0,242,254,0.06)", filter: "blur(32px)", borderRadius: "50%", pointerEvents: "none" }} />
              <div>
                <p className="section-label">Readiness Score</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#00f2fe", lineHeight: 1 }}>
                    {data?.readiness_score}
                  </span>
                  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "rgba(0,242,254,0.5)" }}>%</span>
                  <TrendingUp style={{ width: 16, height: 16, color: "#00f2fe", marginLeft: 4 }} />
                </div>
              </div>
              <div>
                <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      background: "linear-gradient(90deg, #00f2fe, #6366f1)",
                      height: "100%", borderRadius: 99, transition: "width 0.7s ease",
                      width: `${data?.readiness_score ?? 0}%`,
                    }}
                  />
                </div>
                <p className="section-label" style={{ marginTop: 8 }}>Role match rating</p>
              </div>
            </div>

            {/* Streak */}
            <div className="glass-card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem", minHeight: 140, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -12, right: -12, width: 80, height: 80, background: "rgba(139,92,246,0.06)", filter: "blur(32px)", borderRadius: "50%", pointerEvents: "none" }} />
              <div>
                <p className="section-label">Learning Streak</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#8b5cf6", lineHeight: 1 }}>
                    {data?.learning_streak}
                  </span>
                  <Flame style={{ width: 24, height: 24, color: "#8b5cf6" }} />
                </div>
              </div>
              <p className="section-label">Consecutive days active</p>
            </div>

            {/* Roadmap */}
            <div className="glass-card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem", minHeight: 140, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -12, right: -12, width: 80, height: 80, background: "rgba(99,102,241,0.06)", filter: "blur(32px)", borderRadius: "50%", pointerEvents: "none" }} />
              <div>
                <p className="section-label">Roadmap Progress</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1 }}>
                    {data?.roadmap_completion_percentage}
                  </span>
                  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>%</span>
                </div>
              </div>
              <div>
                <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", height: 4, borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      height: "100%", borderRadius: 99, transition: "width 0.7s ease",
                      width: `${data?.roadmap_completion_percentage ?? 0}%`,
                    }}
                  />
                </div>
                <p className="section-label" style={{ marginTop: 8 }}>Weekly milestones done</p>
              </div>
            </div>

            {/* Active goal */}
            <div className="glass-card card-body" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "1rem", minHeight: 140, position: "relative", overflow: "hidden" }}>
              <div>
                <p className="section-label">Active Goal</p>
                <p style={{ marginTop: 10, fontSize: "0.875rem", fontWeight: 600, color: "#fff", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {data?.career_goal || "Not specified"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Target style={{ width: 14, height: 14, color: "#00f2fe", flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#00f2fe", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {data?.target_role}
                </span>
              </div>
            </div>
          </div>

          {/* ── Radar + Tasks grid ── */}
          <div className="dashboard-grid-split">
            {/* Radar card */}
            <div className="glass-card card-body-lg element-gap">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <Brain style={{ width: 16, height: 16, color: "#00f2fe" }} />
                  <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>Skill Composition</h3>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 24 }}>
                  Your current skill distribution across the target role
                </p>
              </div>

              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem 0" }}>
                {mounted && (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 15]}
                        tick={false}
                        axisLine={false}
                        stroke="transparent"
                      />
                      <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="#00f2fe"
                        strokeWidth={1.5}
                        fill="#6366f1"
                        fillOpacity={0.25}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Mini stat pills */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                {[
                  { label: "Mastered", val: data?.skills_mastered_count, color: "#00f2fe" },
                  { label: "Learning", val: data?.skills_learning_count, color: "#8b5cf6" },
                  { label: "Gaps", val: data?.skills_gap_count, color: "#f87171" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "0.625rem", textAlign: "center" }}>
                    <p className="section-label">{label}</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 4, color }}>{val ?? 0}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming tasks card */}
            <div className="glass-card card-body-lg element-gap">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <Clock style={{ width: 16, height: 16, color: "#6366f1" }} />
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>Upcoming Milestones</h3>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: 24 }}>
                    Complete these tasks to advance your readiness score
                  </p>
                </div>
                {data?.upcoming_tasks && data.upcoming_tasks.length > 0 && (
                  <a
                    href="/roadmap"
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 600, color: "#00f2fe", textDecoration: "none", flexShrink: 0, marginLeft: 16 }}
                  >
                    View all
                    <ArrowRight style={{ width: 12, height: 12 }} />
                  </a>
                )}
              </div>

              <div className="divider" />

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {data?.upcoming_tasks && data.upcoming_tasks.length > 0 ? (
                  data.upcoming_tasks.map((task) => {
                    const done = task.status === "completed";
                    return (
                      <div
                        key={task.id}
                        className="card-body rounded-xl transition-all"
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                          border: done ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.06)",
                          background: done ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.02)",
                        }}
                      >
                        <button
                          onClick={() => handleToggleTask(task.id, task.status)}
                          style={{ marginTop: 2, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "transform 0.2s" }}
                        >
                          <CheckCircle2
                            style={{ width: 20, height: 20, color: done ? "#10b981" : "#4b5563" }}
                          />
                        </button>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span className="badge badge-indigo">Wk {task.week_number}</span>
                            {task.category && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: "#00f2fe", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {task.category}
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4,
                              color: done ? "#6b7280" : "#fff",
                              textDecoration: done ? "line-through" : "none",
                            }}
                          >
                            {task.title}
                          </p>
                          <p style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <Clock style={{ width: 32, height: 32, color: "#4b5563" }} />
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#9ca3af" }}>No upcoming milestones</p>
                    <p style={{ fontSize: "0.75rem", color: "#4b5563" }}>
                      Upload your resume or regenerate your roadmap to populate tasks
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
