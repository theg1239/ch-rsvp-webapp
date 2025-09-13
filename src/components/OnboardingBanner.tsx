"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function OnboardingBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const flag = window.localStorage.getItem('show_welcome');
      setShow(flag === '1');
    } catch {}
  }, []);

  const dismiss = () => {
    try { window.localStorage.removeItem('show_welcome'); } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 ch-card">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "url('/images/onboarding1worldmapbg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative flex flex-col sm:flex-row items-center gap-4 p-5">
        <img src="/images/onboardingowl.svg" alt="owl" className="w-20 h-20 sm:w-24 sm:h-24" />
        <div className="flex-1 text-center sm:text-left">
          <p className="font-qurova ch-text text-2xl">Hi{user?.name ? `, ${user.name}` : ''}!</p>
          <p className="font-area ch-subtext text-sm">Welcome to Cryptic Hunt RSVP. Jump into your team, check the leaderboard, or start solving questions.</p>
        </div>
        <button onClick={dismiss} aria-label="Close" className="font-qurova text-sm px-3 py-2 rounded-xl" style={{ border: '1px solid var(--ch-subtext)', color: 'var(--ch-subtext)' }}>Close</button>
      </div>
    </div>
  );
}
