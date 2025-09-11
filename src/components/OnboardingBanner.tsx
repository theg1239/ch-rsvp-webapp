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
    <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: 'rgba(0,0,0,0.25)' }}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "url('/Images/onboarding1worldmapbg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="relative flex items-center gap-4 p-5">
        <img src="/Images/onboardingowl.svg" alt="owl" className="w-24 h-24" />
        <div className="flex-1">
          <p className="font-qurova ch-text text-2xl">Hi{user?.name ? `, ${user.name}` : ''}!</p>
          <p className="font-area ch-subtext text-sm">Welcome to Cryptic Hunt RSVP. Jump into your team, check the leaderboard, or start solving questions.</p>
        </div>
        <button onClick={dismiss} aria-label="Close" className="font-qurova text-sm px-3 py-2 rounded-xl" style={{ border: '1px solid var(--ch-subtext)', color: 'var(--ch-subtext)' }}>Close</button>
      </div>
    </div>
  );
}

