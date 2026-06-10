"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { 
  Map, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  BookOpen,
  Calendar,
  AlertCircle
} from "lucide-react";

interface RoadmapTask {
  id: number;
  user_id: number;
  week_number: number;
  month_number: number;
  title: string;
  description: string | null;
  status: string; // "pending", "in_progress", "completed"
  resources: string | null; // JSON encoded
  category: string | null;
  created_at: string;
}

export default function RoadmapPage() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await api.getRoadmap();
      setTasks(res);
    } catch (err: any) {
      setError(err.message || "Failed to load learning roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (taskId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      // Optimistic update
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      );
      await api.updateTaskStatus(taskId, nextStatus);
    } catch (err: any) {
      console.error("Failed to update status", err);
      fetchRoadmap();
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.generateRoadmap();
      setTasks(res);
      setSuccess("Roadmap successfully generated!");
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap. Set your profile parameters first.");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalWeeks = tasks.length;
  const completedWeeks = tasks.filter(t => t.status === "completed").length;
  const completionPercent = totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0;

  // Group tasks by month
  const groupedTasks: { [key: number]: RoadmapTask[] } = {};
  tasks.forEach(t => {
    if (!groupedTasks[t.month_number]) {
      groupedTasks[t.month_number] = [];
    }
    groupedTasks[t.month_number].push(t);
  });

  return (
    <div className="space-y-7 pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="section-label mb-1">Weekly Milestones</p>
          <h1 className="text-2xl font-bold tracking-tight">
            Learning{" "}
            <span className="bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
              Roadmap
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Follow your structured week-by-week milestones to reach your goal
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="glass-btn gap-2 text-sm disabled:opacity-60 self-start sm:self-auto shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Regenerating..." : "Regenerate Roadmap"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Progress Card */}
      {tasks.length > 0 && (
        <div className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center shrink-0">
              <Map className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Milestone Completion Rate</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {completedWeeks} of {totalWeeks} weeks completed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-3xl font-extrabold text-white">{completionPercent}%</span>
            <div className="w-28 bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-neon-cyan to-neon-indigo h-full rounded-full transition-all duration-700"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {tasks.length > 0 ? (
        <div className="space-y-10 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
          {Object.keys(groupedTasks).map((monthStr) => {
            const monthNum = Number(monthStr);
            return (
              <div key={monthNum} className="space-y-4 relative">
                {/* Month Title Indicator */}
                <div className="flex items-center gap-3 pl-14">
                  <div className="absolute left-3 w-6 h-6 rounded-full bg-neon-indigo/25 border border-neon-indigo/40 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-neon-indigo" />
                  </div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                    Month {monthNum}
                  </h2>
                </div>

                {/* Weeks under this month */}
                <div className="space-y-4 pl-14">
                  {groupedTasks[monthNum].map((task) => {
                    const isCompleted = task.status === "completed";
                    const isExpanded = expandedTask === task.id;
                    
                    // Parse resources
                    let resourcesList = [];
                    if (task.resources) {
                      try {
                        resourcesList = JSON.parse(task.resources);
                      } catch {
                        resourcesList = [];
                      }
                    }

                    return (
                      <div 
                        key={task.id}
                        className={`glass-card p-5 border transition-all duration-300 relative ${
                          isCompleted 
                            ? "bg-emerald-500/5 border-emerald-500/25 text-gray-400" 
                            : "border-white/5 hover:border-neon-cyan/20"
                        }`}
                      >
                        {/* Bullet Circle marker on the timeline line */}
                        <button
                          onClick={() => handleToggleStatus(task.id, task.status)}
                          className="absolute -left-[37px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-dark-bg border-2 border-neon-cyan flex items-center justify-center z-10 transition-transform hover:scale-125"
                          style={{
                            borderColor: isCompleted ? "#10b981" : "#00f2fe",
                            backgroundColor: isCompleted ? "#10b981" : "#07060b"
                          }}
                        >
                          {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                        </button>

                        {/* Task Content */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 cursor-pointer flex-1" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                Week {task.week_number}
                              </span>
                              {task.category && (
                                <span className="text-xs font-medium text-neon-cyan uppercase tracking-wider">
                                  {task.category}
                                </span>
                              )}
                            </div>
                            <h3 className={`text-base font-bold ${isCompleted ? "line-through text-gray-500" : "text-white"}`}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed mt-0.5">
                              {task.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                              className="text-xs font-semibold text-neon-cyan hover:underline"
                            >
                              {isExpanded ? "Collapse" : "Expand Details"}
                            </button>
                            <button
                              onClick={() => handleToggleStatus(task.id, task.status)}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-600 hover:text-neon-cyan" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details container */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Milestone Description</h4>
                              <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                                {task.description}
                              </p>
                            </div>

                            {/* Resources */}
                            {resourcesList.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Recommended Resources
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {resourcesList.map((res: any, idx: number) => (
                                    <a 
                                      key={idx}
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-xs text-neon-cyan font-medium group"
                                    >
                                      <span className="truncate pr-4">{res.title}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-neon-cyan shrink-0" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 glass-card border border-white/5 space-y-4 max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Roadmap</h3>
          <p className="text-sm text-gray-400">
            It looks like you haven't generated a career roadmap yet. Specify your career goal and click the button below.
          </p>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="glass-btn inline-flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Generate Learning Roadmap
          </button>
        </div>
      )}
    </div>
  );
}
