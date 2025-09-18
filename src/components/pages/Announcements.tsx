"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Announcement = { id: string; title?: string; body?: string; created_at?: string };

export default function AnnouncementsPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const res = await api.get<{ status: string; data: unknown }>("/api/app/announcements/");
        if (!mounted) return;
        const raw = (res as any)?.data;
        const arr: Announcement[] = Array.isArray(raw)
          ? raw.filter((x) => x && typeof x === 'object')
          : [];
        setList(arr);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load announcements");
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <h1 className="font-qurova ch-gradient-text ch-h2 mb-4">Announcements</h1>
        {loading && <p className="font-area ch-subtext">Loading…</p>}
        {err && <p className="text-red-400 font-area">{err}</p>}
        <ul className="grid gap-3 mt-2">
          {list.map((a) => (
            <li key={a.id} className="rounded-xl p-4 ch-card ch-card--outlined" style={{ borderColor: "rgba(255,255,255,.08)" }}>
              <p className="font-qurova ch-text text-lg">{a.title || 'Announcement'}</p>
              {a.body && <p className="font-area ch-subtext mt-1" style={{ whiteSpace: 'pre-wrap' }}>{a.body}</p>}
              {a.created_at && <p className="font-area ch-subtext text-xs mt-2 opacity-70">{new Date(a.created_at).toLocaleString()}</p>}
            </li>
          ))}
          {!loading && list.length === 0 && <p className="font-area ch-subtext">No announcements yet.</p>}
        </ul>
      </div>
    </div>
  );
}

