"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Award,
  Map,
  FileText,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Compass,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Skill Matrix", href: "/skills", icon: Award },
  { name: "Learning Roadmap", href: "/roadmap", icon: Map },
  { name: "Resume Analyzer", href: "/resume", icon: FileText },
  { name: "Career Coach", href: "/coach", icon: MessageSquare },
];

export default function NavigationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/";

  const isCoachPage = pathname === "/coach";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("vector_token");
    if (!token) {
      setIsAuthenticated(false);
      if (!isAuthPage) router.push("/login");
    } else {
      setIsAuthenticated(true);
      if (pathname === "/login" || pathname === "/register")
        router.push("/dashboard");
    }
  }, [pathname, isAuthPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("vector_token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  /* Loading state */
  if (isAuthenticated === null && !isAuthPage) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#07060b" }}>
        <div className="glass-card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <div className="w-11 h-11 border-[3px] border-neon-cyan border-t-transparent rounded-full animate-spin" />
          <p className="section-label">Establishing secure connection…</p>
        </div>
      </div>
    );
  }

  /* Auth / landing pages – no sidebar */
  if (isAuthPage || !isAuthenticated) {
    return <>{children}</>;
  }

  /* ── Authenticated app shell ── */
  const SIDEBAR_W = 240;

  return (
    <div style={{ minHeight: "100dvh", height: "100dvh", display: "flex", flexDirection: "row", background: "#07060b", overflow: "hidden" }}>

      {/* ── Desktop sidebar ── */}
      {!isMobile && (
        <aside
          style={{
            width: SIDEBAR_W,
            minWidth: SIDEBAR_W,
            maxWidth: SIDEBAR_W,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,8,18,0.72)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {/* Top – logo + nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", padding: "1.75rem 1rem 1rem" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0 0.5rem" }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "rgba(0,242,254,0.08)",
                  border: "1px solid rgba(0,242,254,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <Compass style={{ width: 18, height: 18, color: "#00f2fe" }} />
              </div>
              <span
                style={{
                  fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.15em",
                  background: "linear-gradient(90deg, #00f2fe, #6366f1)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}
              >
                VECTOR
              </span>
            </div>

            {/* Divider */}
            <div className="divider" />

            {/* Nav */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.6rem 0.75rem", borderRadius: "0.75rem",
                      fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
                      transition: "all 0.2s ease",
                      ...(active
                        ? {
                            background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(0,242,254,0.08) 100%)",
                            border: "1px solid rgba(0,242,254,0.22)",
                            color: "#ffffff",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid transparent",
                            color: "#9ca3af",
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = "#ffffff";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.color = "#9ca3af";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                  >
                    <Icon
                      className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? "text-neon-cyan" : "text-current"}`}
                    />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                    {active && (
                      <span
                        style={{
                          marginLeft: "auto", width: 6, height: 6,
                          borderRadius: "50%", background: "#00f2fe", flexShrink: 0,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom – sign out */}
          <div style={{ padding: "0 1rem 1.5rem" }}>
            <div className="divider" style={{ marginBottom: "1rem" }} />
            <button
              onClick={handleLogout}
              style={{
                display: "flex", width: "100%", alignItems: "center", gap: "0.75rem",
                padding: "0.6rem 0.75rem", borderRadius: "0.75rem",
                fontSize: "0.875rem", fontWeight: 500, background: "none", border: "none",
                color: "#6b7280", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f87171";
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#6b7280";
                (e.currentTarget as HTMLElement).style.background = "none";
              }}
            >
              <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── Mobile top-bar ── */}
      {isMobile && (
        <header
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 56, padding: "0 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,8,18,0.85)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Compass style={{ width: 20, height: 20, color: "#00f2fe" }} />
            <span
              style={{
                fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.15em",
                background: "linear-gradient(90deg, #00f2fe, #6366f1)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              VECTOR
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen((p) => !p)}
            style={{
              padding: "0.5rem", borderRadius: "0.5rem", background: "none", border: "none",
              color: "#9ca3af", cursor: "pointer",
            }}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
          </button>
        </header>
      )}

      {/* ── Mobile drawer ── */}
      {isMobile && isMobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsMobileOpen(false)}
        >
          <nav
            className="glass-card"
            style={{
              position: "absolute", top: 56, left: 0, right: 0,
              borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none",
              padding: "1.25rem 1rem",
              display: "flex", flexDirection: "column", gap: "0.25rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 0.75rem", borderRadius: "0.75rem",
                    fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
                    ...(active
                      ? { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(0,242,254,0.22)", color: "#fff" }
                      : { background: "transparent", border: "1px solid transparent", color: "#9ca3af" }),
                  }}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-neon-cyan" : "text-current"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="divider" style={{ margin: "0.5rem 0" }} />
            <button
              onClick={() => { setIsMobileOpen(false); handleLogout(); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.6rem 0.75rem", borderRadius: "0.75rem",
                fontSize: "0.875rem", fontWeight: 500, background: "none", border: "none",
                color: "#6b7280", cursor: "pointer",
              }}
            >
              <LogOut style={{ width: 18, height: 18, flexShrink: 0 }} />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* ── Page content ── */}
      <main className={`app-main${isMobile ? " app-main--mobile" : ""}${isCoachPage ? " app-main--coach" : ""}`}>
        <div className={`app-shell-content${isCoachPage ? " app-shell-content--coach" : ""}`}>
          {children}
        </div>
      </main>
    </div>
  );
}
