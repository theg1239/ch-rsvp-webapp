"use client";
import Image from "next/image";
import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";

type Item = { view: ReturnType<typeof useAppStore.getState>["view"]; label: string; icon: string };
const baseItems: Item[] = [
  { view: "timeline", label: "Timeline", icon: "/images/NavBar/calendar-2.svg" },
  // { view: "questions", label: "Home", icon: "/images/NavBar/home.svg" },
  { view: "leaderboard", label: "Leaderboard", icon: "/images/NavBar/cup.svg" },
  { view: "profile", label: "Profile", icon: "/images/NavBar/profilenew.svg" },
  { view: "faq", label: "FAQ", icon: "/images/NavBar/FAQ.svg" },
  { view: "announcements", label: "Announcements", icon: "/images/NavBar/archive.svg" },
  { view: "rules", label: "Rules", icon: "/images/NavBar/briefcase.svg" },
  { view: "resources", label: "Resources", icon: "/images/NavBar/resources.svg" },
  { view: "about", label: "About", icon: "/images/NavBar/profile.svg" },
];

export default function HuntNav() {
  const { view, setView, decideFromBackend, guestMode, hideNav } = useAppStore();
  // Always call hooks (useMemo) regardless of hideNav to keep hook order stable.
  const items = useMemo(() => {
    if (!guestMode) return baseItems;
    return baseItems.filter(it => ["about", "faq"].includes(it.view));
  }, [guestMode]);
  const go = (v: Item["view"]) => { if (v === 'questions') { void decideFromBackend(); } else { setView(v); } };
  const isActive = (v: Item["view"]) => v === 'questions'
    ? (view === 'questions' || view === 'team' || view === 'profile' || view === 'checkin')
    : view === v;
  const left = useMemo(() => items.slice(0, Math.ceil(items.length / 2)), [items]);
  const right = useMemo(() => items.slice(Math.ceil(items.length / 2)), [items]);

  if (hideNav) return null;

  return (
    <nav className="fixed nav-safe-offset left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-2 sm:px-4" aria-label="Hunt">
      <div className="relative rounded-2xl py-2 ch-card ch-glass ring-1 ring-[rgba(255,255,255,0.06)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] px-2 sm:px-3">
        <div className="flex items-center gap-2">
          {/* Left cluster - scrollable on small screens */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto sm:overflow-visible">
            {left.map(it => (
              <button
                key={it.label}
                type="button"
                onClick={()=>go(it.view)}
                aria-current={isActive(it.view) ? 'page' : undefined}
                className="relative flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 flex-1 min-w-[56px]"
              >
                <Image
                  src={it.icon}
                  alt={it.label}
                  width={24}
                  height={24}
                  className={`nav-icon w-5 h-5 sm:w-6 sm:h-6 ${isActive(it.view) ? 'active' : ''}`}
                />
                <span
                  className="hidden sm:block text-[11px] mt-0.5 font-area truncate"
                  style={{ color: isActive(it.view) ? '#F5753B' : '#ccc' }}
                >
                  {it.label}
                </span>
                {isActive(it.view) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 ch-gradient rounded-full" />}
              </button>
            ))}
          </div>

          {/* Center spacer to reserve owl space */}
          <div className="shrink-0 w-[64px] h-0 sm:w-[76px]" aria-hidden />

          {/* Right cluster - scrollable on small screens */}
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto sm:overflow-visible">
            {right.map(it => (
              <button
                key={it.label}
                type="button"
                onClick={()=>go(it.view)}
                aria-current={isActive(it.view) ? 'page' : undefined}
                className="relative flex flex-col items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 flex-1 min-w-[56px]"
              >
                <Image
                  src={it.icon}
                  alt={it.label}
                  width={24}
                  height={24}
                  className={`nav-icon w-5 h-5 sm:w-6 sm:h-6 ${isActive(it.view) ? 'active' : ''}`}
                />
                <span
                  className="hidden sm:block text-[11px] mt-0.5 font-area truncate"
                  style={{ color: isActive(it.view) ? '#F5753B' : '#ccc' }}
                >
                  {it.label}
                </span>
                {isActive(it.view) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 ch-gradient rounded-full" />}
              </button>
            ))}
          </div>
        </div>
        <div className="pointer-events-none">
          <button
            type="button"
            aria-label="Owl"
            className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -top-6 sm:-top-7 w-[64px] h-[64px] sm:w-[76px] sm:h-[76px] rounded-full flex items-center justify-center"
            onClick={()=>setView('questions')}
          >
            <Image
              src="/images/NavBar/owl with circle.svg"
              alt="owl"
              width={76}
              height={76}
              className="w-[64px] h-[64px] sm:w-[76px] sm:h-[76px]"
            />
          </button>
        </div>
      </div>
    </nav>
  );
}
