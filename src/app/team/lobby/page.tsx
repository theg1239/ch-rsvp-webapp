"use client";
import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";
import type { ApiOk, ProfileData } from "../../../lib/types";

const MainColors = { orange: "#F5753B", text: "#ffffff", subText: "#cccccc", subBg: "#EFEFEF" } as const;

type Slot = { id: string; status: "available" | "filled"; initials?: string; name?: string; isYou?: boolean };

export default function SquadLobbyPage() {
  const [teamName, setTeamName] = useState<string>("—");
  const [teamCode, setTeamCode] = useState<string>("—");
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        if (!mounted) return;
  const user = res.data.user as ProfileData["user"];
        const t = user?.team;
        setTeamName(t?.name ?? "—");
        setTeamCode(t?.code ?? "—");
        const all: string[] = res.data.team_members || [];
        const userName: string | null = user?.name ?? null;
        const others = userName ? all.filter(n => n !== userName) : all;
        setSlots(mapMembersToGrid(userName, others));
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const canProceed = useMemo(() => slots.filter(s => s.status === 'filled').length >= 2, [slots]);

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/Images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container ch-container-narrow pt-10 pb-12 safe-bottom">
        <header className="text-center">
          <h1 className="font-qurova ch-text ch-h3">cryptic hunt</h1>
        </header>

        <main className="mt-6">
          <h2 className="font-qurova ch-gradient-text text-center ch-h2">Squad Lobby</h2>
          <div className="mt-2 text-center">
            <p className="font-qurova ch-text" style={{ fontSize: 22, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamName}</p>
          </div>

          <div className="mt-6 rounded-2xl p-5" style={{ background: 'transparent' }}>
            <Legend />
            <Grid slots={slots} />
            <p className="mt-4 text-center font-area ch-text" style={{ letterSpacing: 1.2 }}>Squad Code - {teamCode}</p>
          </div>

          <p className="mt-4 text-center font-area" style={{ color: MainColors.subText }}>
            To start hunting you need at least 2 members in the squad. You can have up to 6 members in a squad.
          </p>

          {/* <div className="mt-6 flex items-center justify-center gap-4">
            <a href="/team" className="px-6 py-3 rounded-xl font-qurova ch-btn">Leave Team</a>
          </div> */}
        </main>

        <footer className="mt-10">
          <div className="flex items-center justify-center">
            {/* <button className="border-2 rounded-2xl px-8 py-3 font-qurova ch-text" style={{ borderColor: canProceed ? MainColors.orange : '#888' }} disabled={!canProceed}>
              Proceed
            </button> */}
          </div>
        </footer>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center justify-center gap-6 mb-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: MainColors.subBg, border: `2px solid ${MainColors.orange}` }} />
        <span className="font-area ch-text text-sm">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ background: MainColors.orange }} />
        <span className="font-area ch-text text-sm">Unavailable</span>
      </div>
    </div>
  );
}

function Grid({ slots }: { slots: Slot[] }) {
  const colA = slots.filter(s => s.id.startsWith('A'));
  const colB = slots.filter(s => s.id.startsWith('B'));
  const rowLabels = ['1','2','3'];
  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-3">
        <span className="font-qurova ch-text">A</span>
        {colA.map(s => <SlotBox key={s.id} s={s} />)}
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="font-qurova ch-text">B</span>
        {colB.map(s => <SlotBox key={s.id} s={s} />)}
      </div>
      <div className="flex flex-col items-center gap-3">
        {rowLabels.map(r => <span key={r} className="font-qurova ch-text">{r}</span>)}
      </div>
    </div>
  );
}

function SlotBox({ s }: { s: Slot }) {
  const baseStyle: React.CSSProperties = {
    height: 72,
    width: 72,
    borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  if (s.status === 'filled') {
    return (
      <div style={{ ...baseStyle, background: MainColors.orange }}>
        <span className="font-area ch-text" style={{ fontSize: 18, fontWeight: 700 }}>{s.isYou ? 'YOU' : (s.initials || '')}</span>
      </div>
    );
  }
  return (
    <div style={{ ...baseStyle, background: MainColors.subBg, border: `2px solid ${MainColors.orange}` }} />
  );
}

function mapMembersToGrid(currentUserName: string | null, otherMembers: string[]): Slot[] {
  const gridOrder = ['A1','B1','A2','B2','A3','B3'];
  const reservedForYou = 'A3';
  const computeInitials = (full?: string) => {
    if (!full) return 'YOU';
    const parts = full.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };
  const base: Slot[] = gridOrder.map(id => id === reservedForYou
    ? { id, status: 'filled', initials: computeInitials(currentUserName ?? 'YOU'), name: currentUserName ?? 'Your Name', isYou: true }
    : { id, status: 'available' });
  const fillOrder = gridOrder.filter(id => id !== reservedForYou);
  let i = 0;
  for (const name of otherMembers) {
    if (i >= fillOrder.length) break;
    const slotId = fillOrder[i++];
    const at = base.findIndex(b => b.id === slotId);
    if (at >= 0) base[at] = { id: slotId, status: 'filled', initials: computeInitials(name), name };
  }
  return base;
}
