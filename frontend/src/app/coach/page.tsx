"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import { 
  Sparkles, 
  Send, 
  User, 
  Brain, 
  Award, 
  Map, 
  ArrowRight,
  Shield,
  HelpCircle
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface UserProfile {
  target_role: string | null;
  career_goal: string | null;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Grounding Context States for Sidebar
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistoryAndContext();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistoryAndContext = async () => {
    try {
      setLoadingHistory(true);
      
      // 1. Fetch Chat History
      const hist = await api.getChatHistory();
      setMessages(hist);
      
      // 2. Fetch User Profile
      const me = await api.getMe();
      setProfile({
        target_role: me.target_role,
        career_goal: me.career_goal
      });

      // 3. Fetch Skill Gaps
      const skills = await api.getSkills();
      const gaps = skills.filter(s => s.status === "gap").map(s => s.name);
      setMissingSkills(gaps);

      // 4. Fetch Upcoming Tasks
      const roadmap = await api.getRoadmap();
      const upcoming = roadmap.filter(t => t.status !== "completed").slice(0, 3);
      setUpcomingTasks(upcoming);

    } catch (err: any) {
      setError(err.message || "Failed to load chat parameters.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const userText = inputText;
    setInputText("");
    setSending(true);

    // Optimistic user message append
    const tempUserMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const coachMsg = await api.sendChatMessage(userText);
      setMessages(prev => [...prev, coachMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to send message to Vector.");
      // Revert user message or keep it with error
    } finally {
      setSending(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="coach-container animate-fade-in-up flex flex-col xl:flex-row gap-6 h-full">
      
      {/* ── Grounding sidebar ── */}
      <div className="coach-sidebar w-full xl:w-[320px] shrink-0 flex flex-col gap-4">
        
        {/* Coach Bio */}
        <div className="glass-card-glow-cyan p-5 border border-neon-cyan/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/15 flex items-center justify-center border border-neon-cyan/25 shrink-0">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Coach Vector</h3>
              <p className="section-label mt-0.5">AI Career Advisor</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Grounded in your active resume, skill checklist, and roadmap milestones.
          </p>
        </div>

        {/* Dynamic Context Sidebar */}
        <div
            className="sidebar-context glass-card border border-white/5 overflow-y-auto text-xs flex flex-col gap-5 p-5"
            style={{ flex: 1 }}
          >
          <div className="space-y-1.5">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-neon-indigo" />
              Grounded Profile
            </h4>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <p className="text-white font-semibold text-sm">{profile?.career_goal || "No Goal Set"}</p>
              <p className="text-[10px] text-neon-cyan font-semibold">{profile?.target_role || "No Role Selected"}</p>
            </div>
          </div>

          {/* Missing Skills */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-neon-purple" />
              Target Skill Gaps ({missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-0.5">
              {missingSkills.map((s, idx) => (
                <span 
                  key={idx}
                  className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400"
                >
                  {s}
                </span>
              ))}
              {missingSkills.length === 0 && (
                <p className="text-[10px] text-gray-500">No active gaps! System synced.</p>
              )}
            </div>
          </div>

          {/* Next Tasks */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Map className="w-4 h-4 text-neon-cyan" />
              Upcoming Actions
            </h4>
            <div className="space-y-1.5">
              {upcomingTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <p className="font-semibold text-white truncate text-xs">W{t.week_number}: {t.title}</p>
                  <p className="text-[9px] text-gray-500 line-clamp-1">{t.description}</p>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <p className="text-[10px] text-gray-500">No upcoming milestones.</p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Chat Thread Container (Right, flex-1) */}
      <div className="flex-1 glass-card border border-white/5 flex flex-col overflow-hidden relative min-h-[700px]">
        
        {/* Messages list */}
        <div className="flex-1 px-8 py-6 overflow-y-auto space-y-6">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isCoach = msg.role === "assistant";
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
                >
                  <div className={`flex gap-3 max-w-[70%] lg:max-w-[65%] ${isCoach ? "flex-row" : "flex-row-reverse"}`}>
                    
                    {/* Avatar Icon */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border text-xs font-bold ${
                      isCoach 
                        ? "bg-neon-cyan/15 border-neon-cyan/30 text-neon-cyan" 
                        : "bg-white/10 border-white/10 text-white"
                    }`}>
                      {isCoach ? "V" : <User className="w-4 h-4" />}
                    </div>

                    {/* Chat Text Card */}
                    <div className={`px-5 py-4 rounded-3xl border text-sm leading-relaxed ${
                      isCoach 
                        ? "bg-white/[0.02] border-white/5 rounded-tl-none text-gray-200" 
                        : "bg-gradient-to-r from-neon-indigo/20 to-neon-cyan/20 border-neon-cyan/25 rounded-tr-none text-white shadow-lg"
                    }`}>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                    
                  </div>
                </div>
              );
            })
          ) : (
            /* Welcome prompt */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto">
              <HelpCircle className="w-12 h-12 text-gray-600 animate-bounce" />
              <h3 className="text-base font-bold text-white">Ask Vector Anything</h3>
              <p className="text-xs text-gray-400">
                "What is my first roadmap task?" "How can I improve my resume for an AI internship?" "Can you explain Docker networking?"
              </p>
            </div>
          )}
          
          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center border bg-neon-cyan/15 border-neon-cyan/30 text-neon-cyan text-xs font-bold animate-pulse">
                  V
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 rounded-tl-none flex items-center gap-1.5 py-3.5">
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 py-5 border-t border-white/5 bg-black/30 backdrop-blur-xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={sending ? "Vector is crafting a response..." : "Ask your coach a question..."}
              disabled={sending}
              className="glass-input flex-1 h-12 px-4 text-sm"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="glass-btn h-12 w-12 shrink-0 flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
