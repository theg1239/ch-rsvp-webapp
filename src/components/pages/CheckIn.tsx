"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { ApiOk, ProfileData } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/store/appStore";

export default function CheckInPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { setHideNav } = useAppStore();
  const [team, setTeam] = useState<ProfileData["user"]["team"] | null>(null);
  const [members, setMembers] = useState<string[]>([]);
  const [qrB64, setQrB64] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [listening] = useState(true);

  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);
  useEffect(() => { if (initialized && !user) router.replace('/signin'); }, [initialized, user, router]);

  useEffect(() => {
    if (!initialized || !user) return;
    let active = true;
    (async () => {
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        if (!active) return;
        setTeam(res.data.user.team || null);
        setMembers(res.data.team_members || []);
      } catch (e) { setErr(e instanceof Error ? e.message : "Failed to fetch profile"); }
      try { const r = await api.get<ApiOk<string>>("/api/team/user/qr"); if (!active) return; setQrB64(r.data); } catch {}
    })();
    return () => { active = false; };
  }, [initialized, user]);

  const teamName = team?.name || '—';
  const teamCode = team?.code || '—';
  const membersList = useMemo(() => members && members.length ? members : [], [members]);

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />
      <div className="relative ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <header className="text-center mb-6"><h1 className="font-qurova ch-gradient-text ch-h1">Team Check-in</h1><p className="font-area ch-subtext text-sm">Show this QR at the desk to get checked in.</p></header>
        {err && <p className="text-red-400 font-area mb-3">{err}</p>}
        <section className="grid gap-4 mb-6">
          <div className="rounded-2xl p-4 ch-card">
            <p className="ch-text font-qurova text-lg">{teamName}</p>
            <p className="font-area ch-subtext text-sm">Code: {teamCode}</p>
            {membersList.length > 0 && (<ul className="mt-2 list-disc pl-5 font-area ch-text text-sm">{membersList.map((m, i) => <li key={i}>{m}</li>)}</ul>)}
          </div>
          <div className="rounded-2xl p-4 ch-card flex flex-col items-center gap-3">
            {qrB64 ? (<img alt="Check-in QR" src={`data:image/png;base64,${qrB64}`} className="h-56 w-56 rounded bg-white p-2" />) : (<p className="font-area ch-subtext">Generating QR…</p>)}
            <p className="font-area ch-subtext text-sm text-center">Keep this screen open. An organizer will scan the QR to mark your team as checked in.</p>
            {listening && <p className="font-area ch-subtext text-xs">Waiting for check-in…</p>}
          </div>
        </section>
        <div className="text-center"><button onClick={()=>router.replace('/hunt/team')} className="px-4 py-2 rounded-xl font-qurova" style={{ border: '2px solid var(--ch-orange)' }}>Back to Team</button></div>
      </div>
    </div>
  );
}

