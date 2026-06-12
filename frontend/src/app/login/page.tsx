"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Compass, Mail, Lock, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      const res = await api.login(formData);
      localStorage.setItem("vector_token", res.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-8 pb-10 bg-dark-bg relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10 animate-fade-in-up">
        {/* Card */}
        <div className="glass-card card-body-lg element-gap shadow-2xl">
          {/* Logo + heading */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-11 h-11 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-indigo bg-clip-text text-transparent">
                Welcome back
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Sign in to continue your career journey
              </p>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="section-label">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="glass-input glass-input-with-icon"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="section-label">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input glass-input-with-icon"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-btn w-full mt-1 gap-2 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-gray-500">
            New to Vector?{" "}
            <Link href="/register" className="text-neon-cyan font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
