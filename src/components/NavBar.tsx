"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type NavItem = { href: string; label: string; icon: string };
// Match mobile app tab order: Home, Questions, Leaderboard, Profile
const items: NavItem[] = [
  { href: "/", label: "Home", icon: "/images/NavBar/home.svg" },
  { href: "/questions", label: "Questions", icon: "/images/NavBar/note.svg" },
  { href: "/leaderboard", label: "Leaderboard", icon: "/images/NavBar/cup.svg" },
  { href: "/profile", label: "Profile", icon: "/images/NavBar/profilenew.svg" },
];

import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../store/appStore";

export default function NavBar() {
  const pathname = usePathname();
  const path = pathname || "";
  const { user, initialized } = useAuth();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';
  const { view, setView, decideFromBackend, hideNav } = useAppStore();

  // Auto-hide on desktop when viewing leaderboard (hooks must run unconditionally)
  const [autoHidden, setAutoHidden] = useState(false);
  useEffect(() => {
    const isLeaderboard = path === "/leaderboard";
    const isDesktop = typeof window !== "undefined" && window.matchMedia('(min-width: 1024px)').matches;
    if (!isLeaderboard || !isDesktop) { setAutoHidden(false); return; }
    let t: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => setAutoHidden(true), 5000);
    };
    const onMove = () => { setAutoHidden(false); schedule(); };
    schedule();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onMove);
    return () => { if (t) clearTimeout(t); window.removeEventListener('mousemove', onMove); window.removeEventListener('keydown', onMove); };
  }, [path]);

  // Hide on auth routes regardless of auth state (after hooks)
  const hideForAuthPath = path.startsWith("/signin") || path.startsWith("/signup") || path.startsWith("/onboarding") || path.startsWith("/checkin");
  const hideForSPA = SPA && (view === 'signin' || view === 'signup' || view === 'onboarding' || view === 'checkin');
  if (hideForAuthPath || hideForSPA || hideNav) return null;
  if (!initialized || !user) return null;
  return (
    <nav className={`fixed nav-safe-offset left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 transition-opacity duration-300 ${autoHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-label="Primary">
      <div className="relative rounded-2xl py-2 ch-card ch-glass ring-1 ring-[rgba(255,255,255,0.06)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-2 px-3 overflow-x-auto scroll-x no-scrollbar touch-pan-x scroll-smooth sm:overflow-visible sm:no-scrollbar sm:justify-between sm:gap-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {items.map((it) => {
            const active = SPA ? matchView(view, it.href) : pathname === it.href;
            if (SPA) {
              return (
                <button key={it.href} type="button" onClick={() => goTo(it.href, setView, decideFromBackend)}
                        className="relative shrink-0 sm:shrink flex flex-col items-center gap-1 px-3 py-1">
                  <Image src={it.icon} alt={it.label} width={24} height={24} className={`w-[24px] h-[24px] nav-icon ${active ? 'active' : ''}`} />
                  <span className="text-[11px] mt-0.5 font-area" style={{ color: active ? '#F5753B' : '#ccc' }}>{it.label}</span>
                  {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 ch-gradient rounded-full" />}
                </button>
              );
            }
            return (
              <Link key={it.href} href={it.href} className="relative shrink-0 sm:shrink flex flex-col items-center gap-1 px-3 py-1">
                <Image src={it.icon} alt={it.label} width={24} height={24} className={`w-[24px] h-[24px] nav-icon ${active ? 'active' : ''}`} />
                <span className="text-[11px] mt-0.5 font-area" style={{ color: active ? '#F5753B' : '#ccc' }}>{it.label}</span>
                {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 ch-gradient rounded-full" />}
              </Link>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center sm:hidden">
          <div className="h-8 w-6 mr-1 rounded-l-xl" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(36,31,26,0.75) 80%)' }} />
          <Image src="/images/QuestionsPage/left-arrow.svg" alt="scroll" width={16} height={16} className="rotate-180 w-4 h-4 opacity-75 animate-pulse" />
        </div>
      </div>
    </nav>
  );
}

// Helpers for SPA mode
function matchView(view: ReturnType<typeof useAppStore.getState>["view"], href: string): boolean {
  switch (href) {
    case '/': return view === 'questions' || view === 'team' || view === 'profile' || view === 'checkin';
    case '/profile': return view === 'profile';
    case '/leaderboard': return view === 'leaderboard';
    case '/questions': return view === 'questions';
    default: return false;
  }
}

function goTo(href: string, setView: (v: any) => void, decideFromBackend: () => Promise<void>) {
  switch (href) {
    case '/':
      void decideFromBackend();
      break;
    case '/profile': setView('profile'); break;
    case '/leaderboard': setView('leaderboard'); break;
    case '/questions': setView('questions'); break;
    default: break;
  }
}
