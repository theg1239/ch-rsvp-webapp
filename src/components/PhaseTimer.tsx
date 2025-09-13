"use client";
import { useEffect, useMemo, useState } from "react";

type Props = { until?: string | number | Date; accent?: string };

export default function PhaseTimer({ until, accent = "#F5753B" }: Props) {
  const target = useMemo(() => (until ? new Date(until) : null), [until]);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target ? Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000)) : 0;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;

  const unit = (v: number, label: string) => (
    <div className="flex-1 min-w-0 text-center">
      <div className="rounded-xl ch-card ch-card--outlined px-3 py-3" style={{ borderColor: "rgba(255,255,255,.08)" }}>
        <div className="font-qurova ch-text text-xl" style={{ color: accent }}>{v.toString().padStart(2, '0')}</div>
        <div className="font-area ch-subtext text-xs mt-1">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-2">
      {unit(days, 'Days')}
      {unit(hours, 'Hours')}
      {unit(mins, 'Minutes')}
      {unit(secs, 'Seconds')}
    </div>
  );
}

