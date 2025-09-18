"use client";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import type { ApiOk, ProfileData } from "../../../lib/types";
import type { MainGeneric } from "../../../lib/types";
import { useAppStore } from "../../../store/appStore";

const MainColors = { background: "#241f1a", orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const { decideFromBackend, setHideNav } = useAppStore();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';

  // Hide Nav while on SignUp
  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);

  const handleSignUp = async () => {
    await signInWithGoogle();
    if (SPA) { await decideFromBackend(); return; }
    try {
      const res = await api.get<MainGeneric>("/api/main");
      const msg = (res.message || '').toUpperCase();
      if (msg === 'ONBOARDING_INCOMPLETE') { router.push('/onboarding'); return; }
      if (msg === 'NO_TEAM') { router.push('/team'); return; }
      if (msg === 'TEAM_NOT_CHECKED_IN') { router.push('/checkin'); return; }
      if (msg === 'PHASE_ACTIVE' || msg === 'PHASE_NOT_STARTED') { router.push('/questions'); return; }
      if (msg === 'TEAM_NOT_CHECKED_IN') { router.push('/checkin'); return; }
      if (msg === 'ATTENDANCE_MARKED') { router.push('/team'); return; }
      if (msg === 'TEAM_BLACKLISTED') { router.push('/profile'); return; }
      if (msg === 'EVENT_ENDED') { router.push('/leaderboard'); return; }
      const pref = await api.get<ApiOk<ProfileData>>("/api/profile/");
      const team = (pref.data as ProfileData)?.user?.team;
      router.push(team ? '/questions' : '/team');
    } catch { router.push("/team"); }
  };

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />
      <div className="relative ch-container ch-container-narrow pt-12 pb-36 safe-bottom">
        <header className="text-center">
          <h1 className="font-qurova ch-gradient-text ch-title ch-h1">cryptic hunt</h1>
        </header>

        <div className="mt-3 text-center">
          <p className="leading-snug font-area ch-text ch-tagline">
            We are not just another event.
            <br />
            We are the conspiracy that actually works.
          </p>
        </div>

        {/* Mobile/desktop hero (six owls), cropped; larger + higher on desktop */}
        <div className="mt-8">
          <div className="auth-hero">
            <img src="/images/six-owls.svg" alt="Six owls" />
          </div>
        </div>

        <section className="mt-10">
          <div className="mx-auto max-w-xl">
            <h2 className="text-left font-qurova ch-gradient-text mb-2 ch-h2">Sign up</h2>
            <p className="text-left mb-6 font-area ch-text">
              Use your Google account to get started.
            </p>
          </div>
        </section>
      </div>

      {/* Bottom sticky action like the phone version */}
      <div className="fixed left-0 right-0 nav-safe-offset px-5">
        <div className="ch-card ch-glass rounded-2xl p-3">
          <button
            onClick={handleSignUp}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-3 btn-ripple ch-btn"
          >
            <Image src="/images/google-logo.svg" alt="Google" width={20} height={20} />
            <span className="font-qurova">Sign up with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
