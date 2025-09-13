"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import PhaseHeader from "@/components/PhaseHeader";
import PhaseTimer from "@/components/PhaseTimer";
import type { MainGeneric } from "@/lib/types";

export default function TimelinePage() {
  const [data, setData] = useState<null | { current?: string; next?: string; phase?: number }>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      try {
        const res = await api.get<MainGeneric>("/api/main");
        const d: any = res.data || {};
        setData({ current: d.current_phase_time, next: d.next_phase_time, phase: d.active_phase });
      } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); }
    })();
  }, []);

  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom grid gap-4">
        <PhaseHeader phase={data?.phase ?? '—'} title="Upcoming Phase" subtitle={data?.next ? new Date(data.next).toLocaleString() : '—'} />
        {err && <p className="text-red-400 font-area">{err}</p>}
        {data?.next && <PhaseTimer until={data.next} />}
        <div className="ch-card ch-card--outlined rounded-2xl p-4">
          <p className="font-qurova ch-text">Schedule</p>
          <p className="font-area ch-subtext text-sm mt-1">This shows time until next phase. You’ll get a push notification when it starts.</p>
        </div>
      </div>
    </div>
  );
}

