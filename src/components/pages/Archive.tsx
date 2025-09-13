"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { MainGeneric } from "@/lib/types";

export default function ArchivePage() {
  const [solved, setSolved] = useState<Array<{ id: string; name: string }>>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      try {
        const res = await api.get<MainGeneric>("/api/main");
        const data: any = res.data || {};
        setSolved(data.solved_questions || []);
      } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); }
    })();
  }, []);

  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <h1 className="font-qurova ch-gradient-text ch-h2 mb-4">Archive</h1>
        {err && <p className="text-red-400 font-area">{err}</p>}
        <ul className="grid gap-3">
          {solved.map((q) => (
            <li key={q.id} className="rounded-xl p-4 ch-card ch-card--outlined">
              <p className="font-qurova ch-text">{q.name}</p>
              <p className="font-area ch-subtext text-sm">ID: {q.id}</p>
            </li>
          ))}
          {solved.length === 0 && <p className="font-area ch-subtext">No solved questions yet.</p>}
        </ul>
      </div>
    </div>
  );
}

