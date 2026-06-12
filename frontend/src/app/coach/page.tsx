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
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", content: userText, created_at: new Date().toISOString() },
    ]);

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
    <div className="coach-container animate-fade-in-up">
      <div className="coach-sidebar">
        <div className="coach-panel">
          <div className="coach-panel-section">
            <div className="coach-identity">
              <div className="coach-avatar">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="coach-name">Coach Vector</div>
                <div className="coach-status">AI Career Advisor</div>
              </div>
            </div>
          </div>

          <div className="sidebar-context">
            <div className="coach-panel-section">
              <div className="coach-panel-label">
                <Shield className="w-3 h-3" />
                Profile
              </div>
              <p className="coach-value">{profile?.career_goal || "No goal set"}</p>
              <p className="coach-value-muted">{profile?.target_role || "No role selected"}</p>
            </div>

            <div className="coach-panel-section">
              <div className="coach-panel-label">
                <Brain className="w-3 h-3" />
                Skill gaps
                {missingSkills.length > 0 && ` (${missingSkills.length})`}
              </div>
              {missingSkills.length > 0 ? (
                <div className="coach-tags">
                  {missingSkills.map((s, i) => (
                    <span key={i} className="coach-tag">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="coach-empty">All skills covered</p>
              )}
            </div>

            <div className="coach-panel-section">
              <div className="coach-panel-label">
                <Map className="w-3 h-3" />
                Up next
              </div>
              {upcomingTasks.length > 0 ? (
                <div className="coach-tasks">
                  {upcomingTasks.map((t) => (
                    <div key={t.id} className="coach-task">
                      <p className="coach-task-title">{t.title}</p>
                      <p className="coach-task-meta">Week {t.week_number}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="coach-empty">No upcoming tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="coach-chat">
        {error && <div className="coach-error">{error}</div>}

        <div className="coach-chat-messages">
          {messages.length > 0 ? (
            <div className="coach-chat-inner">
              {messages.map((msg) => {
                const isCoach = msg.role === "assistant";
                return (
                  <div key={msg.id} className={`coach-msg${isCoach ? "" : " coach-msg--user"}`}>
                    <div
                      className={`coach-msg-avatar${isCoach ? " coach-msg-avatar--coach" : " coach-msg-avatar--user"}`}
                    >
                      {isCoach ? "V" : <User className="w-3 h-3" />}
                    </div>
                    <div className={`coach-bubble${isCoach ? " coach-bubble--coach" : " coach-bubble--user"}`}>
                      <p style={{ whiteSpace: "pre-line", margin: 0 }}>{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="coach-msg">
                  <div className="coach-msg-avatar coach-msg-avatar--coach">V</div>
                  <div className="coach-bubble coach-bubble--coach coach-bubble--typing">
                    <span className="coach-dot" style={{ animationDelay: "0ms" }} />
                    <span className="coach-dot" style={{ animationDelay: "150ms" }} />
                    <span className="coach-dot" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="coach-empty-state">
              <HelpCircle className="w-5 h-5 text-white/20" />
              <p className="coach-empty-title">Ask anything</p>
              <p className="coach-empty-sub">
                Try &ldquo;What&apos;s my first roadmap task?&rdquo; or &ldquo;How can I improve my resume?&rdquo;
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="coach-input-bar">
          <form onSubmit={handleSendMessage} className="coach-input-form">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={sending ? "Vector is thinking…" : "Message your coach…"}
              disabled={sending}
              className="coach-input"
            />
            <button type="submit" disabled={!inputText.trim() || sending} className="coach-send">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
