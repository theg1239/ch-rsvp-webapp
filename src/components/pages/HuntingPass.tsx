"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { ApiOk, ProfileData } from "@/lib/types";

export default function HuntingPassPage() {
  const [team, setTeam] = useState<ProfileData["user"]["team"] | null>(null);
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        setTeam(res.data.user.team || null);
      } catch {}
      try {
        const qrRes = await api.get<ApiOk<string>>("/api/team/user/qr");
        setQr(qrRes.data);
      } catch {}
    })();
  }, []);

  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-8 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/HuntingTicket/Owl-1.svg" alt="Ticket" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">Hunting Pass</h1>
        </div>
        <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15))', border: '1px solid rgba(255,255,255,.08)' }}>
          <div className="absolute -top-10 -right-10 opacity-40 select-none">
            <img src="/images/HuntingTicket/HuntingWorld.svg" alt="world" className="w-56 h-56" />
          </div>
          <div className="p-5 grid gap-4">
            <div className="flex items-center justify-between">
              <img src="/images/HuntingTicket/ACM logo.svg" alt="ACM" className="h-8 w-auto" />
              <img src="/images/cryptichunt.svg" alt="CH" className="h-7 w-auto" />
            </div>
            <div className="grid gap-1">
              <p className="font-area ch-subtext text-xs">Team</p>
              <p className="font-qurova ch-text text-xl">{team?.name || '—'}</p>
            </div>
            <div className="grid gap-1">
              <p className="font-area ch-subtext text-xs">Code</p>
              <div className="flex items-center gap-2">
                <img src="/images/HuntingTicket/Icon.svg" alt="icon" className="w-5 h-5" />
                <p className="font-qurova ch-text text-lg tracking-widest">{team?.code || '—'}</p>
              </div>
            </div>
            <div className="grid place-items-center">
              {qr ? (
                <img src={`data:image/png;base64,${qr}`} alt="QR" className="w-48 h-48 object-contain rounded-xl bg-white p-2" />
              ) : (
                <div className="w-48 h-48 rounded-xl ch-card ch-card--outlined grid place-items-center font-area ch-subtext">QR pending…</div>
              )}
            </div>
            <div className="grid gap-2">
              <img src="/images/HuntingTicket/Barcode.svg" alt="barcode" className="w-full h-14 object-contain" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/images/HuntingTicket/Map Asset.svg" alt="map" className="w-6 h-6" />
                  <span className="font-area ch-subtext text-xs">VIT Vellore Campus</span>
                </div>
                <img src="/images/HuntingTicket/Icon (1).svg" alt="icon1" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

