"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { MainGeneric } from "@/lib/types";

export default function BlacklistedPage() {
  const [isBlack, setIsBlack] = useState<boolean | null>(null);
  const [team, setTeam] = useState<{ id: string; name: string; code: string } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<MainGeneric>("/api/main");
        setIsBlack(res.message === 'TEAM_BLACKLISTED');
        if (res.message === 'TEAM_BLACKLISTED') {
          const d: any = res.data || {}; const td = d.teamDetails || {};
          setTeam({ id: td.id, name: td.name, code: td.code });
        }
      } catch { setIsBlack(false); }
    })();
  }, []);
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <h1 className="font-qurova ch-gradient-text ch-h2 mb-2">Blacklist Status</h1>
        {isBlack === null && <p className="font-area ch-subtext">Checking…</p>}
        {isBlack === false && <p className="font-area ch-subtext">Your team is not blacklisted.</p>}
        {isBlack === true && (
          <div className="rounded-2xl ch-card ch-card--outlined p-4">
            <p className="font-qurova ch-text">{team?.name || 'Your Team'}</p>
            <p className="font-area ch-subtext text-sm">Code: {team?.code || '—'}</p>
            <p className="font-area ch-subtext mt-2">Your team is blacklisted. Contact event staff for assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
}

