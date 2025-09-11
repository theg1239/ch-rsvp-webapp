"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type NavItem = { href: string; label: string; icon: string; external?: boolean };
const items: NavItem[] = [
  { href: "/", label: "Home", icon: "/images/NavBar/home.svg" },
  { href: "/profile", label: "Profile", icon: "/images/NavBar/profilenew.svg" },
  { href: "/leaderboard", label: "Leaderboard", icon: "/images/NavBar/cup.svg" },
  { href: "/questions", label: "Questions", icon: "/images/NavBar/note.svg" },
  { href: "https://gravitas.vit.ac.in/events/3df08aa2-22c9-42ff-8640-de501218780f", label: "Register", icon: "/images/NavBar/calendar-2.svg", external: true },
];

import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const pathname = usePathname();
  const path = pathname || "";
  const { user, initialized } = useAuth();

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
  if (path.startsWith("/signin") || path.startsWith("/signup")) return null;
  if (!initialized || !user) return null;
  return (
    <nav className={`fixed nav-safe-offset left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 transition-opacity duration-300 ${autoHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-label="Primary">
      <div className="rounded-2xl py-2 ch-card ch-glass relative">
        {/* Horizontal scroll container on mobile; evenly spaced on larger screens */}
  <div className="flex items-center gap-2 px-3 overflow-x-auto scroll-x no-scrollbar touch-pan-x scroll-smooth sm:overflow-visible sm:no-scrollbar sm:justify-between sm:gap-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {items.map((it) => {
            // Highlight only real route matches
            const active = (!it.external && pathname === it.href);
            const isRegister = it.label.toLowerCase() === 'register' || (it.external && it.href.includes('gravitas'));
            const showActiveStyle = active || isRegister;
            const content = (
              <>
                <Image src={it.icon} alt={it.label} width={22} height={22} className={`w-[22px] h-[22px] nav-icon ${showActiveStyle ? 'active' : ''}`} />
                <span className={`text-[11px] mt-0.5 ${isRegister ? 'px-2 py-[2px] rounded-md' : ''}`}
                      style={{ color: showActiveStyle ? '#F5753B' : '#ccc', background: isRegister ? 'rgba(245,117,59,0.12)' : 'transparent' }}>
                  {it.label}
                </span>
                {active && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 ch-gradient" />}
              </>
            );

            return it.external ? (
              <a key={it.href} href={it.href} target="_blank" rel="noopener noreferrer"
                 className={`relative shrink-0 sm:shrink flex flex-col items-center gap-1 px-3 py-1 hover:opacity-90 ${isRegister ? 'rounded-xl ring-1 ring-[rgba(245,117,59,0.35)]' : ''}`}>
                {content}
              </a>
            ) : (
              <Link key={it.href} href={it.href} className={`relative shrink-0 sm:shrink flex flex-col items-center gap-1 px-3 py-1 ${isRegister ? 'rounded-xl ring-1 ring-[rgba(245,117,59,0.35)]' : ''}`}>
                {content}
              </Link>
            );
          })}
        </div>

        {/* Right fade and arrow hint on small screens */}
        <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center sm:hidden">
          <div className="h-8 w-6 mr-1 rounded-l-xl" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(36,31,26,0.75) 80%)' }} />
          <Image src="/images/QuestionsPage/left-arrow.svg" alt="scroll" width={16} height={16} className="rotate-180 w-4 h-4 opacity-75 animate-pulse" />
        </div>
      </div>
    </nav>
  );
}
