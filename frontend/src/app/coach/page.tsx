"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/services/api";
import { Sparkles, Send, User, Brain, Map, Shield, HelpCircle } from "lucide-react";

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchHistoryAndContext(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistoryAndContext = async () => {
    try {
      setLoadingHistory(true);
      const hist = await api.getChatHistory();
      setMessages(hist);
      const me = await api.getMe();
      setProfile({ target_role: me.target_role, career_goal: me.career_goal });
      const skills = await api.getSkills();
      setMissingSkills(skills.filter((s) => s.status === "gap").map((s) => s.name));
      const roadmap = await api.getRoadmap();
      setUpcomingTasks(roadmap.filter((t) => t.status !== "completed").slice(0, 3));
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
    setMessages((prev) => [...prev, {
      id: Date.now(), role: "user", content: userText, created_at: new Date().toISOString(),
    }]);
    try {
      const coachMsg = await api.sendChatMessage(userText);
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err: any) {
      setError(err.message || "Failed to send message to Vector.");
    } finally {
      setSending(false);
    }
  };

  if (loadingHistory) {
    return (
      <div className="coach-container page-loading">
        <div className="page-loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Sidebar card ── */
        .cv-sidebar-card {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
        }

        /* Identity block */
        .cv-identity {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .cv-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(6,182,212,0.12);
          color: #06b6d4;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cv-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          line-height: 1;
          margin-bottom: 3px;
        }
        .cv-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          color: rgba(255,255,255,0.3);
        }
        .cv-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #22c55e;
        }

        /* Context sections */
        .cv-section {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .cv-section:last-child { border-bottom: none; }
        .cv-section-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }
        .cv-section-count {
          margin-left: auto;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
        }
        .cv-val-primary {
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.82);
          line-height: 1.45;
        }
        .cv-val-secondary {
          font-size: 11.5px;
          color: rgba(6,182,212,0.75);
        }
        .cv-empty {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
        }

        /* Skill tags */
        .cv-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .cv-tag {
          font-size: 10.5px;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.18);
          color: rgba(252,165,165,0.85);
        }

        /* Task list */
        .cv-tasks { display: flex; flex-direction: column; gap: 9px; }
        .cv-task { display: flex; align-items: flex-start; gap: 8px; }
        .cv-task-week {
          font-size: 9.5px;
          font-weight: 700;
          color: rgba(6,182,212,0.6);
          padding-top: 1px;
          flex-shrink: 0;
          width: 18px;
        }
        .cv-task-title {
          font-size: 11.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.72);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cv-task-desc {
          font-size: 10.5px;
          color: rgba(255,255,255,0.25);
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          margin-top: 1px;
        }

        /* ── Chat panel ── */
        .cv-chat {
          flex: 1;
          min-height: 0;
          min-width: 0;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Chat header */
        .cv-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .cv-chat-header-left { display: flex; align-items: center; gap: 9px; }
        .cv-chat-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(6,182,212,0.12);
          color: #06b6d4;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cv-chat-header-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          line-height: 1;
          margin-bottom: 2px;
        }
        .cv-chat-header-sub {
          font-size: 10.5px;
          color: rgba(255,255,255,0.28);
        }
        .cv-thinking {
          font-size: 10.5px;
          color: #06b6d4;
          opacity: 0.7;
          font-style: italic;
        }

        /* Accent sweep line */
        .cv-accent-line {
          height: 2px;
          background: rgba(6,182,212,0.08);
          flex-shrink: 0;
          transition: background 0.3s;
        }
        .cv-accent-line--on {
          background: linear-gradient(90deg, transparent, #06b6d4, #6366f1, transparent);
          background-size: 200% 100%;
          animation: cvSweep 1.5s ease-in-out infinite;
        }
        @keyframes cvSweep {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        /* Error */
        .cv-error {
          padding: 7px 18px;
          font-size: 11.5px;
          color: rgba(248,113,113,0.9);
          background: rgba(239,68,68,0.05);
          border-bottom: 1px solid rgba(239,68,68,0.1);
          flex-shrink: 0;
        }

        /* Messages */
        .cv-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 20px 18px 10px;
        }
        .cv-messages-inner {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 660px;
          margin: 0 auto;
        }
        .cv-msg { display: flex; align-items: flex-end; gap: 8px; }
        .cv-msg--user { flex-direction: row-reverse; }
        .cv-msg-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .cv-msg-avatar--coach { background: rgba(6,182,212,0.12); color: #06b6d4; }
        .cv-msg-avatar--user  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.35); }
        .cv-bubble {
          max-width: 78%;
          padding: 9px 13px;
          font-size: 13.5px;
          line-height: 1.6;
        }
        .cv-bubble--coach {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.8);
          border-radius: 14px 14px 14px 3px;
        }
        .cv-bubble--user {
          background: rgba(99,102,241,0.17);
          border: 1px solid rgba(99,102,241,0.25);
          color: rgba(255,255,255,0.88);
          border-radius: 14px 14px 3px 14px;
        }
        .cv-bubble--typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 11px 14px;
        }
        .cv-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          animation: cvBounce 1s ease-in-out infinite;
        }
        @keyframes cvBounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-5px); }
        }

        /* Empty state */
        .cv-empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          max-width: 300px;
          margin: 0 auto;
          padding: 32px 0;
        }
        .cv-empty-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.18);
          margin-bottom: 4px;
        }
        .cv-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
        }
        .cv-empty-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          line-height: 1.65;
        }

        /* Input bar */
        .cv-input-bar {
          flex-shrink: 0;
          padding: 13px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .cv-input-form {
          display: flex;
          gap: 8px;
          align-items: center;
          max-width: 660px;
          margin: 0 auto;
        }
        .cv-input {
          flex: 1;
          height: 42px;
          padding: 0 15px;
          font-size: 13.5px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: rgba(255,255,255,0.85);
          outline: none;
          transition: border-color 0.2s;
        }
        .cv-input::placeholder { color: rgba(255,255,255,0.2); }
        .cv-input:focus { border-color: rgba(6,182,212,0.4); }
        .cv-input:disabled { opacity: 0.45; }
        .cv-send {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(99,102,241,0.22);
          border: 1px solid rgba(99,102,241,0.32);
          color: rgba(255,255,255,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, opacity 0.15s;
        }
        .cv-send:hover:not(:disabled) { background: rgba(99,102,241,0.38); }
        .cv-send:disabled { opacity: 0.28; cursor: default; }
      `}</style>

      <div className="coach-container animate-fade-in-up">

        {/* ── Sidebar ── */}
        <div className="coach-sidebar">

          {/* Identity — always visible */}
          <div className="cv-sidebar-card cv-identity" style={{ flexShrink: 0 }}>
            <div className="cv-avatar">
              <Sparkles style={{ width: 15, height: 15 }} />
            </div>
            <div>
              <div className="cv-name">Coach Vector</div>
              <div className="cv-status">
                <span className="cv-status-dot" />
                Online
              </div>
            </div>
          </div>

          {/* Scrollable context — desktop only via .sidebar-context */}
          <div className="sidebar-context cv-sidebar-card" style={{ flexDirection: "column" }}>

            <div className="cv-section">
              <div className="cv-section-label">
                <Shield style={{ width: 11, height: 11 }} />
                Profile
              </div>
              <div className="cv-val-primary">{profile?.career_goal || "No goal set"}</div>
              <div className="cv-val-secondary">{profile?.target_role || "No role selected"}</div>
            </div>

            <div className="cv-section">
              <div className="cv-section-label">
                <Brain style={{ width: 11, height: 11 }} />
                Skill gaps
                {missingSkills.length > 0 && (
                  <span className="cv-section-count">{missingSkills.length}</span>
                )}
              </div>
              {missingSkills.length > 0 ? (
                <div className="cv-tags">
                  {missingSkills.map((s, i) => (
                    <span key={i} className="cv-tag">{s}</span>
                  ))}
                </div>
              ) : (
                <div className="cv-empty">All skills covered</div>
              )}
            </div>

            <div className="cv-section">
              <div className="cv-section-label">
                <Map style={{ width: 11, height: 11 }} />
                Up next
              </div>
              {upcomingTasks.length > 0 ? (
                <div className="cv-tasks">
                  {upcomingTasks.map((t) => (
                    <div key={t.id} className="cv-task">
                      <span className="cv-task-week">W{t.week_number}</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="cv-task-title">{t.title}</div>
                        <div className="cv-task-desc">{t.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cv-empty">No upcoming tasks</div>
              )}
            </div>

          </div>
        </div>

        {/* ── Chat panel ── */}
        <div className="cv-chat">

          {/* Header */}
          <div className="cv-chat-header">
            <div className="cv-chat-header-left">
              <div className="cv-chat-avatar">V</div>
              <div>
                <div className="cv-chat-header-name">Coach Vector</div>
                <div className="cv-chat-header-sub">Ask me anything about your career</div>
              </div>
            </div>
            {sending && <div className="cv-thinking">thinking…</div>}
          </div>

          {/* Animated accent line */}
          <div className={`cv-accent-line${sending ? " cv-accent-line--on" : ""}`} />

          {error && <div className="cv-error">{error}</div>}

          {/* Messages */}
          <div className="cv-messages">
            {messages.length > 0 ? (
              <div className="cv-messages-inner">
                {messages.map((msg) => {
                  const isCoach = msg.role === "assistant";
                  return (
                    <div key={msg.id} className={`cv-msg${isCoach ? "" : " cv-msg--user"}`}>
                      <div className={`cv-msg-avatar${isCoach ? " cv-msg-avatar--coach" : " cv-msg-avatar--user"}`}>
                        {isCoach ? "V" : <User style={{ width: 12, height: 12 }} />}
                      </div>
                      <div className={`cv-bubble${isCoach ? " cv-bubble--coach" : " cv-bubble--user"}`}>
                        <p style={{ whiteSpace: "pre-line", margin: 0 }}>{msg.content}</p>
                      </div>
                    </div>
                  );
                })}

                {sending && (
                  <div className="cv-msg">
                    <div className="cv-msg-avatar cv-msg-avatar--coach">V</div>
                    <div className="cv-bubble cv-bubble--coach cv-bubble--typing">
                      <span className="cv-dot" style={{ animationDelay: "0ms" }} />
                      <span className="cv-dot" style={{ animationDelay: "150ms" }} />
                      <span className="cv-dot" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="cv-empty-state">
                <div className="cv-empty-icon">
                  <HelpCircle style={{ width: 18, height: 18 }} />
                </div>
                <div className="cv-empty-title">Ask anything</div>
                <div className="cv-empty-sub">
                  Try &ldquo;What&apos;s my first roadmap task?&rdquo; or &ldquo;How can I improve my resume?&rdquo;
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="cv-input-bar">
            <form onSubmit={handleSendMessage} className="cv-input-form">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={sending ? "Vector is thinking…" : "Message your coach…"}
                disabled={sending}
                className="cv-input"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="cv-send"
              >
                <Send style={{ width: 14, height: 14 }} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  );
}