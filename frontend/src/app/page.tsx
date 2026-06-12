"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Compass, 
  ArrowRight, 
  Sparkles, 
  Map, 
  FileCheck, 
  TrendingUp 
} from "lucide-react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("vector_token"));
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-dark-bg relative overflow-hidden">
      {/* Dynamic light glows in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-cyan/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-neon-purple/20 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Hero Header */}
      <div className="text-center relative max-w-3xl space-y-5 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neon-cyan font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          Next-Gen AI Career Coaching Platform
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Navigate Your Tech Journey With{" "}
          <span className="bg-gradient-to-r from-neon-cyan via-neon-indigo to-neon-purple bg-clip-text text-transparent">
            Vector
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          An intelligent Career Copilot designed for software engineering and AI aspirants. Map your skill gaps, generate custom week-by-week roadmaps, analyze resumes, and chat with a dedicated career coach.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {isLoggedIn ? (
            <Link href="/dashboard" className="glass-btn flex items-center gap-2">
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link href="/register" className="glass-btn flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="glass-btn-secondary flex items-center justify-center">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="responsive-grid-3 page-container" style={{ maxWidth: "64rem", marginTop: "3.5rem", zIndex: 10 }}>
        <div className="glass-card card-body-lg hover:border-neon-cyan/30 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-neon-cyan" />
          </div>
          <h3 className="text-base font-bold mb-1.5">Skill Gap Analysis</h3>
          <p className="text-gray-400 text-sm">
            Evaluate your capabilities against pre-defined industry role maps. Identify missing technologies and strength areas.
          </p>
        </div>

        <div className="glass-card card-body-lg hover:border-neon-indigo/30 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-neon-indigo/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Map className="w-5 h-5 text-neon-indigo" />
          </div>
          <h3 className="text-base font-bold mb-1.5">Interactive Roadmaps</h3>
          <p className="text-gray-400 text-sm">
            Generate custom, weekly milestone learning roadmaps that adapt based on your timeline and target study hours.
          </p>
        </div>

        <div className="glass-card card-body-lg hover:border-neon-purple/30 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <FileCheck className="w-5 h-5 text-neon-purple" />
          </div>
          <h3 className="text-base font-bold mb-1.5">ATS Resume Analyzer</h3>
          <p className="text-gray-400 text-sm">
            Upload your resume PDF to receive an instant ATS score, keyword advice, and detailed bullet-point rewrite suggestions.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs text-gray-600 z-10">
        © 2026 Vector. Built for early-career devs and career switchers.
      </div>
    </div>
  );
}
