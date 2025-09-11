"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import MainStatus from "../components/MainStatus";
import OnboardingBanner from "../components/OnboardingBanner";
import api from "../lib/api";
import type { ApiOk, ProfileData } from "../lib/types";

export default function Home() {
  const { user, initialized, signOut } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState<string | null>(null);
  const [teamCode, setTeamCode] = useState<string | null>(null);

  useEffect(() => { if (initialized && !user) router.replace("/signin"); }, [initialized, user, router]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        if (!mounted) return;
        const t = (res.data as ProfileData).user?.team;
        if (t) { setTeamName(t.name); setTeamCode(t.code); }
        else { router.replace("/team"); }
      } catch (e) {
        // Backend sends 400 when not in any team
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("User is not part of any team") || msg.includes("400")) router.replace("/team");
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  if (!initialized) return null;
  if (!user) return null;

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none select-none" style={{ backgroundImage: "url('/Images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/Images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />

      <div className="relative ch-container py-12 pb-28 safe-bottom">
        <header className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="font-qurova ch-gradient-text ch-h1">CH RSVP</h1>
            <p className="mt-1 font-area ch-subtext">Plan, assemble, and get ready to hunt.</p>
          </div>
          <div className="absolute right-6 top-12 sm:static sm:right-0 sm:top-0">
            <button
              onClick={async ()=>{ try { await signOut(); } finally { router.replace('/signin'); } }}
              className="px-4 py-2 rounded-xl font-qurova"
              style={{ border: '2px solid var(--ch-orange)' }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-6">
          <OnboardingBanner />
          <div className="rounded-2xl p-6 ch-card">
            <h2 className="font-qurova ch-text text-xl">Welcome, {user.email ?? user.uid}</h2>
            <p className="font-area ch-subtext text-sm mt-1">Use the same account as registration.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/team" className="px-5 py-3 rounded-xl font-qurova ch-btn">Create / Join Team</Link>
              {teamName && <Link href="/team/created" className="px-5 py-3 rounded-xl font-qurova" style={{ border: '2px solid var(--ch-orange)' }}>Team: {teamName}</Link>}
              <Link href="/profile" className="px-5 py-3 rounded-xl font-qurova" style={{ border: '2px solid var(--ch-orange)' }}>Profile</Link>
              <Link href="/questions" className="px-5 py-3 rounded-xl font-qurova" style={{ border: '2px solid var(--ch-orange)' }}>Questions</Link>
              <Link href="/leaderboard" className="px-5 py-3 rounded-xl font-qurova" style={{ border: '2px solid var(--ch-orange)' }}>Leaderboard</Link>
            </div>
          </div>

          <div className="rounded-2xl p-6 ch-card">
            <h3 className="font-qurova ch-text text-lg">App Status</h3>
            <div className="mt-2"><MainStatus /></div>
            {teamCode && (
              <p className="mt-2 font-area ch-subtext text-sm">Your Squad Code: <span className="ch-text font-qurova">{teamCode}</span></p>
            )}
            <div className="mt-4 flex gap-3">
              <Link href="/questions" className="px-5 py-3 rounded-xl font-qurova ch-btn">Questions</Link>
            </div>
          </div>
          
          {/* Banner row (boarding banner thingy) */}
          <div className="rounded-2xl p-6 flex items-center gap-4 ch-card">
            <img src="/Images/onboardingowl.svg" alt="owl" className="w-20 h-20" />
            <div className="flex-1">
              <p className="font-qurova ch-text text-lg">Boarding soon</p>
              <p className="font-area ch-subtext text-sm">Keep your squad ready — hunt launches with phases. Follow the announcements.</p>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center">
          <p className="font-area ch-subtext text-xs">© Cryptic Hunt RSVP Demo</p>
        </footer>
      </div>
    </div>
  );
}
