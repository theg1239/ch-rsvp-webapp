"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type NavItem = { href: string; label: string; icon: string };
// Mirror mobile navbar order and items
const items: NavItem[] = [
  { href: "/timeline", label: "Timeline", icon: "/images/NavBar/calendar-2.svg" },
  // { href: "/", label: "Home", icon: "/images/NavBar/home.svg" },
  { href: "/leaderboard", label: "Leaderboard", icon: "/images/NavBar/cup.svg" },
  { href: "/faq", label: "FAQ", icon: "/images/NavBar/FAQ.svg" },
  { href: "/announcements", label: "Announcements", icon: "/images/NavBar/archive.svg" },
  { href: "/rules", label: "Rules", icon: "/images/NavBar/briefcase.svg" },
  { href: "/resources", label: "Resources", icon: "/images/NavBar/resources.svg" },
];

import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../store/appStore";

export default function NavBar() {
  const pathname = usePathname();
  const path = pathname || "";
  const router = useRouter();
  const { user, initialized } = useAuth();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';
  const { view, setView, decideFromBackend, hideNav } = useAppStore();

  // Auto-hide on desktop when viewing leaderboard (hooks must run unconditionally)
  const [autoHidden, setAutoHidden] = useState(false);
  const [scrolledNav, setScrolledNav] = useState(false);
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
  const hideForAuthPath = path.startsWith("/signin") || path.startsWith("/signup") || path.startsWith("/onboarding") || path.startsWith("/checkin") || path.startsWith("/hunt");
  const hideForSPA = SPA && (view === 'signin' || view === 'signup' || view === 'onboarding' || view === 'checkin');
  if (hideForAuthPath || hideForSPA || hideNav) return null;
  if (!initialized || !user) return null;

  const scrollToEdge = (toEnd: boolean) => {
    try {
      const scroller = document.getElementById('ch-nav-scroller');
      if (!scroller) return;
      const behavior: ScrollBehavior = 'smooth';
      scroller.scrollTo({ left: toEnd ? scroller.scrollWidth : 0, behavior });
    } catch {}
  };
  return (
    <nav className={`fixed nav-safe-offset left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 transition-opacity duration-300 ${autoHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} aria-label="Primary">
      <div className="relative rounded-2xl py-2 ch-card ch-glass ring-1 ring-[rgba(255,255,255,0.06)] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        {/* Scrolling strip */}
        <div id="ch-nav-scroller" className="flex items-center gap-2 px-3 overflow-x-auto scroll-x no-scrollbar touch-pan-x scroll-smooth sm:overflow-visible sm:no-scrollbar sm:justify-between sm:gap-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Left cluster */}
          {items.slice(0, 3).map((it) => {
            const active = SPA ? matchView(view, it.href) : (it.href === '/' ? pathname === '/' : pathname === it.href);
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

          {/* Spacer around center owl (gap on both sides) */}
          <div aria-hidden className="shrink-0" style={{ width: 128 }} />

          {/* Right cluster */}
          {items.slice(3).map((it) => {
            const active = SPA ? matchView(view, it.href) : (it.href === '/' ? pathname === '/' : pathname === it.href);
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
        {/* Toggle scroll button */}
        <button aria-label="Toggle" onClick={() => { const toEnd = !scrolledNav; scrollToEdge(toEnd); setScrolledNav(toEnd); setAutoHidden(false); }}
                className="absolute inset-y-0 right-1 flex items-center sm:hidden px-1 rounded-l-xl bg-transparent">
          <div className="h-8 w-6 mr-1 rounded-l-xl" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(36,31,26,0.75) 80%)' }} />
          <Image src="/images/QuestionsPage/left-arrow.svg" alt="scroll" width={16} height={16} className={`w-4 h-4 opacity-75 ${scrolledNav ? '' : 'rotate-180'}`} />
        </button>

        {/* Center circle owl */}
        <div className="pointer-events-none">
          <button type="button" aria-label="Owl"
                  className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -top-7 w-[76px] h-[76px] rounded-full flex items-center justify-center"
                  onClick={() => {
                    if (SPA) { setView('questions'); } else { router.push('/questions'); }
                  }}>
            <Image src="/images/NavBar/owl with circle.svg" alt="owl" width={76} height={76} className="w-[76px] h-[76px]" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// Helpers for SPA mode
function matchView(view: ReturnType<typeof useAppStore.getState>["view"], href: string): boolean {
  switch (href) {
    case '/': return view === 'questions' || view === 'team' || view === 'profile' || view === 'checkin';
    case '/leaderboard': return view === 'leaderboard';
    case '/questions': return view === 'questions';
    case '/profile': return view === 'profile';
    // Non-SPA static routes; treat as not active under SPA view control
    case '/timeline':
    case '/faq':
    case '/announcements':
    case '/rules':
    case '/resources':
      return false;
    default: return false;
  }
}

function goTo(href: string, setView: (v: any) => void, decideFromBackend: () => Promise<void>) {
  switch (href) {
    case '/':
      void decideFromBackend();
      break;
    case '/leaderboard': setView('leaderboard'); break;
    case '/questions': setView('questions'); break;
    case '/profile': setView('profile'); break;
    // Fall back to hard navigation for static pages in SPA mode
    case '/timeline':
    case '/faq':
    case '/announcements':
    case '/rules':
    case '/resources':
      if (typeof window !== 'undefined') window.location.href = href;
      break;
    default: break;
  }
}
