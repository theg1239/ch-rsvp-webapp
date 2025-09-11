"use client";
import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

type LBItem = { rank: number; team_name: string; points: number };
type LBRes = { status: string; message: string; data: { team_ranking: LBItem[]; user_team?: LBItem } };

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<LBItem[]>([]);
  const [userTeam, setUserTeam] = useState<LBItem | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<LBRes>("/api/leaderboard/team");
        if (!mounted) return;
        setItems(res.data.team_ranking || []);
        setUserTeam(res.data.user_team || null);
      } catch (e) {
        if (e instanceof Error) setErr(e.message);
        else setErr("Failed to load leaderboard");
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const top3 = useMemo(() => items.slice(0, 3), [items]);
  const list = useMemo(() => items.slice(3, 10), [items]);

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container py-10 pb-28 safe-bottom">
        <header className="text-center mb-8">
          <h1 className="font-qurova ch-gradient-text ch-h1">cryptic hunt</h1>
          <p className="font-area ch-text" style={{ fontSize: 18 }}>Leaderboard</p>
        </header>

        {loading && <p className="font-area ch-subtext">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}

        {!loading && !err && (
          <>
            {/* Podium: scrollable on small screens, centered on md+ */}
            <div className="flex items-end justify-center gap-6 mb-10 scroll-x snap-x md:snap-none">
              {top3[1] ? <Podium place={2} item={top3[1]} /> : <div className="w-40 shrink-0" />}
              {top3[0] ? <Podium place={1} item={top3[0]} /> : <div className="w-40 shrink-0" />}
              {top3[2] ? <Podium place={3} item={top3[2]} /> : <div className="w-40 shrink-0" />}
            </div>

            {/* List 4..10 */}
            <div className="grid gap-3">
              {list.map((it) => (
                <Row key={it.rank} item={it} />
              ))}
            </div>

            {/* Your team */}
            <div className="mt-8 mb-8">
              <Row item={userTeam || { rank: 0, team_name: "GET A TEAM", points: 0 }} highlight />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Podium({ place, item }: { place: 1 | 2 | 3; item: LBItem }) {
  const gradients: Record<1 | 2 | 3, string> = {
    1: 'linear-gradient(180deg,#2C2824 2.5%,#F7DB78 60%,#C67F06 90%)',
    2: 'linear-gradient(180deg,#2C2824 5%,#605B4E 30%,#CDC9AD 70%)',
    3: 'linear-gradient(180deg,#2C2824 0%,#2C2824 5%,#F68259 70%,#A7552B 100%)',
  };
  const height = place === 1 ? 260 : 220;
  return (
    <div className="flex flex-col items-center snap-center shrink-0" style={{ width: 'clamp(140px, 45vw, 180px)' }}>
      <div className="w-full rounded-2xl flex flex-col items-center justify-end" style={{ height, background: gradients[place] }}>
        <img src={place === 1 ? "/images/LeaderBoard/first.svg" : place === 2 ? "/images/LeaderBoard/second.svg" : "/images/LeaderBoard/third.svg"} alt={`#${place}`} className="w-20 h-20 -mt-6" />
        <img src="/images/LeaderBoard/PodiumPintoo.svg" alt="podium" className="w-32 h-32" />
      </div>
      <p className="font-area ch-text text-center mt-2" style={{ fontSize: 18, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{item.team_name}</p>
      <p className="font-area" style={{ color: '#F5753B', fontSize: 16 }}>{item.points} pts</p>
    </div>
  );
}

function Row({ item, highlight }: { item: LBItem; highlight?: boolean }) {
  return (
    <div className={`w-full rounded-2xl flex items-center px-4`} style={{ height: 56, border: `2px solid #F8E7DB`, background: highlight ? '#FF7A01' : 'transparent' }}>
      <div className="flex-1 text-center font-area ch-text" style={{ minWidth: 40 }}>{item.rank}</div>
      <div className="flex-[3] text-left font-area ch-text" style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.team_name}</div>
      <div className="flex-[2] text-right font-area ch-text">{item.points}pts</div>
    </div>
  );
}
