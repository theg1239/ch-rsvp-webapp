"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore, type AppView } from '../store/appStore';

type PromptCopy = {
  badge?: string;
  title: string;
  body: string;
  cta?: string;
  icon?: string;
  footnote?: string;
};

const PROMPTS: Partial<Record<AppView | 'default', PromptCopy>> = {
  questions: {
    badge: 'Demo tip',
    title: 'Lock in for the real hunt.',
    body: 'Register your crew now and we\'ll give you brownie points for the real hunt!',
    cta: 'Reserve our slot',
    icon: '/images/map.svg',
  },
  leaderboard: {
    badge: 'Podium nudge',
    title: 'Claim the leaderboard with your actual team tag.',
    body: 'Register now so this scoreboard pins your chosen name and backfills points once the hunt starts.',
    cta: 'Claim team tag',
    icon: '/images/NavBar/cup.svg',
  },
  resources: {
    badge: 'Extras unlock',
    title: 'Registered teams get the printable cheat cards.',
    body: 'Pop in a quick registration and we email the resource bundle plus sponsor perks straight to your inbox.',
    cta: 'Unlock extras',
    icon: '/images/resources.svg',
  },
  profile: {
    badge: 'Profile glow',
    title: 'Flip your profile into highlight mode.',
    body: 'Once you register we drop animated badges, recap emails, and stat tracking on this page for your squad.',
    cta: 'Upgrade profile',
    icon: '/images/profileicon.svg',
  },
  team: {
    badge: 'Squad handle',
    title: 'Hold the team name before someone else grabs it.',
    body: 'Registration locks your preferred team name and member slots ahead of launch day!',
    cta: 'Reserve handle',
    icon: '/images/NavBar/add-square.svg',
  },
  faq: {
    badge: 'Quick heads-up',
    title: 'The full experience is 60 seconds away.',
    body: 'Register and we handle team matching, clue pings, and campus check-ins so you can focus on solving.',
    cta: 'Register now',
    icon: '/images/faqMascot.svg',
  },
  announcements: {
    badge: 'Stay in the loop',
    title: 'Want these drops to ping your phone?',
    body: 'Registered players get push notifications + WhatsApp alerts whenever a new announcement lands.',
    cta: 'Send me alerts',
    icon: '/images/announcementPintoo.svg',
  },
  rules: {
    badge: 'Skip the paperwork',
    title: 'We auto-apply these rules to your squad.',
    body: 'Register and the app tracks attendance, clue limits, and penalty timers so you never worry mid-hunt.',
    cta: 'Handle it for me',
    icon: '/images/rules.svg',
  },
  timeline: {
    badge: 'Stay ahead',
    title: 'Sync this timeline to your calendar.',
    body: 'Registration drops calendar reminders and phase alerts so your squad hits every checkpoint.',
    cta: 'Sync timeline',
    icon: '/images/NavBar/calendar-2.svg',
  },
  default: {
    badge: 'Soft reminder',
    title: 'Ready for the real run?',
    body: 'Registration locks your squad in and ensures you get to play before slots fill out!',
    cta: 'I’m in',
    icon: '/images/owlOnPlane.png',
  },
};

const REGISTER_PATH = '/register';

function buildClassName(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

type Props = {
  view?: AppView | 'default';
  className?: string;
  align?: 'left' | 'center';
};

export default function RegistrationPrompt({ view: overrideView, className = '', align = 'left' }: Props) {
  const { view, guestMode } = useAppStore();
  const pathname = usePathname();
  const resolvedView = useMemo<AppView | 'default'>(
    () => overrideView ?? view ?? 'default',
    [overrideView, view],
  );
  const prompt = PROMPTS[resolvedView] ?? PROMPTS.default;
  const storageKey = `ch_demo_prompt_${resolvedView}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!guestMode) {
      setDismissed(false);
      return;
    }
    try {
      const stored = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
      setDismissed(stored === '1');
    } catch {
      setDismissed(false);
    }
  }, [storageKey, guestMode]);

  if (!prompt) return null;
  const shouldShow = guestMode && pathname?.startsWith('/hunt');
  if (!shouldShow || dismissed) return null;

  const alignmentClasses = align === 'center'
    ? 'flex-col items-center text-center'
    : 'items-start text-left';

  const icon = prompt.icon ? (
    <span className="relative h-8 w-8 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
      {prompt.icon.endsWith('.svg') || prompt.icon.endsWith('.png') ? (
        <img src={prompt.icon} alt="" className="h-5 w-5 opacity-80" />
      ) : null}
    </span>
  ) : null;

  return (
    <div className={className}>
      <div
        className={buildClassName(
          `ch-card ch-card--outlined flex gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 shadow-[0_10px_24px_rgba(8,4,20,0.28)] backdrop-blur-md ${alignmentClasses}`,
          '',
        )}
      >
        {icon}
        <div className="flex-1 space-y-2">
          {prompt.badge && (
            <p className="text-[10px] font-area uppercase tracking-[0.36em] text-white/55">
              {prompt.badge}
            </p>
          )}
          <p className="font-qurova text-sm text-white leading-snug">{prompt.title}</p>
          <p className="font-area text-xs text-white/65 leading-relaxed">{prompt.body}</p>
          <div className={buildClassName('mt-3 flex flex-wrap items-center gap-3', align === 'center' ? 'justify-center' : '')}>
            {prompt.cta && (
              <Link
                href={REGISTER_PATH}
                className="inline-flex items-center gap-1 rounded-full bg-white/14 px-3 py-1.5 text-xs font-qurova tracking-[0.12em] text-white/90 transition hover:bg-white/24"
              >
                {prompt.cta}
                <span aria-hidden className="text-white/60">→</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setDismissed(true);
                try { if (typeof window !== 'undefined') window.sessionStorage.setItem(storageKey, '1'); } catch {}
              }}
              className="text-[11px] font-area text-white/45 underline-offset-2 transition hover:text-white/70"
            >
              maybe later
            </button>
          </div>
          {prompt.footnote && (
            <p className="font-area text-[10px] uppercase tracking-[0.32em] text-white/40">
              {prompt.footnote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
