"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { ApiOk, ProfileData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/appStore";

export default function ProfilePage() {
  const router = useRouter();
  const { initialized, user } = useAuth();
  const { setView } = useAppStore();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [notInTeam, setNotInTeam] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!initialized) return;
      if (!user) { if (SPA) setView('signin'); else router.replace('/signin'); return; }
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to fetch profile";
        if (msg.includes('User is not part of any team') || msg.includes('400')) { setNotInTeam(true); }
        else { setErr(msg); }
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [initialized, user, router, setView, SPA]);

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container ch-container-narrow py-10 safe-bottom">
        <header className="text-center mb-6">
          <h1 className="font-qurova ch-orange ch-h1">Profile</h1>
        </header>
        {loading && <p className="ch-subtext font-area">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}
        {notInTeam && (
          <div className="grid gap-3 items-center text-center">
            <p className="font-area ch-subtext">You are not part of a team yet.</p>
            <Link href="/hunt/team" className="inline-block px-5 py-3 rounded-xl font-qurova ch-btn">Create / Join Team</Link>
          </div>
        )}
        {data && !notInTeam && (
          <div className="grid gap-6">
            <div className="grid gap-1">
              <p className="ch-text font-qurova text-xl">{data.user.name}</p>
              <p className="ch-subtext font-area text-sm">{data.user.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Rank" value={String(data.team_rank)} />
              <Stat label="Points" value={String(data.points)} />
            </div>
            {data.user.team && (
              <div className="grid gap-2">
                <h2 className="font-qurova ch-orange">Team</h2>
                <p className="ch-text font-qurova text-lg">{data.user.team.name}</p>
                <p className="font-area ch-subtext text-sm">Code: {data.user.team.code}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#2A1A1A" }}>
      <p className="font-area ch-subtext text-sm">{label}</p>
      <p className="font-qurova ch-text text-2xl">{value}</p>
    </div>
  );
}

