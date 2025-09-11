"use client";
import { useEffect, useState } from "react";
import api from "../../../lib/api";
import type { ApiOk, ProfileData } from "../../../lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MainColors = { orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function TeamCreatedPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState<string>("");
  const [teamCode, setTeamCode] = useState<string>("");
  const [qr, setQr] = useState<string | null>(null);
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        if (!mounted) return;
  const t = (res.data as ProfileData).user?.team;
        if (t) {
          setTeamName(t.name ?? "");
          setTeamCode(t.code ?? "");
        }
      } catch {}
      try {
        const qrRes = await api.get<ApiOk<string>>("/api/team/user/qr");
        if (mounted) setQr(qrRes.data);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const share = async () => {
    const message = `Join my squad on Cryptic Hunt: ${teamCode}`;
    if (typeof navigator !== "undefined" && 'share' in navigator) {
      try { await (navigator as Navigator & { share?: (data: { text: string }) => Promise<void> }).share?.({ text: message }); } catch {}
      return;
    }
    try {
      await (navigator as Navigator & { clipboard: Clipboard }).clipboard.writeText(message);
      setCopyOk(true); setTimeout(() => setCopyOk(false), 2000);
    } catch {}
  };

  const copyCode = async () => {
  try { await (navigator as Navigator & { clipboard: Clipboard }).clipboard.writeText(teamCode); setCopyOk(true); setTimeout(() => setCopyOk(false), 2000); } catch {}
  };

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/Images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/Images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />

      <div className="relative ch-container ch-container-narrow pt-10 pb-12 safe-bottom">
        <div className="text-center mb-6">
          <p className="font-area" style={{ color: MainColors.orange, fontSize: 22 }}>Squad Created!</p>
          <p className="font-qurova ch-text" style={{ fontSize: 28 }}>{teamName || ""}</p>
        </div>

        <div className="grid gap-2 mb-2">
          <p className="font-area" style={{ color: MainColors.subText, fontSize: 14, fontWeight: 600 }}>Squad Code</p>
          <div className="flex items-center gap-3 border rounded-lg px-3 py-2" style={{ borderColor: MainColors.orange }}>
            <div style={{ width: 25, height: 20 }} />
            <p className="flex-1 text-center font-qurova ch-text" style={{ fontSize: 20 }}>{teamCode || ""}</p>
            <button onClick={copyCode} className="p-1" aria-label="Copy code">
              <img src="/Images/copyIcon.svg" alt="copy" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Divider />
        <div className="w-full flex justify-center mb-2">
          <button onClick={share} className="flex items-center gap-2 px-4 py-2 rounded" style={{ background: 'transparent' }}>
            <img src="/Images/WhatsAppIcon.svg" alt="wa" className="w-5 h-5" />
            <span className="font-area ch-text" style={{ fontSize: 14 }}>Share code with your Teammates</span>
          </button>
        </div>
        <Divider />

        <p className="text-center font-area" style={{ color: MainColors.subText, fontSize: 14 }}>Ask your friends to scan this QR Code and join the squad.</p>
        <div className="flex items-center justify-center my-2">
          <div className="rounded-xl p-2" style={{ border: `1px solid ${MainColors.orange}` }}>
            {qr ? (
              <img src={`data:image/png;base64,${qr}`} alt="QR" className="rounded" style={{ width: 'clamp(160px, 48vw, 208px)', height: 'auto' }} />
            ) : (
              <div className="rounded bg-[var(--ch-subtext)] flex items-center justify-center" style={{ width: 'clamp(160px, 48vw, 208px)', height: 'clamp(160px, 48vw, 208px)' }}>
                <span className="text-sm" style={{ color: '#241f1a' }}>QR loading…</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center font-area" style={{ color: MainColors.orange, fontSize: 12 }}>Share codes only with your squadmates; you can find it anytime in team profile too.</p>

        <div className="mt-6 flex justify-center">
          <Link href="/team/lobby" className="border-2 rounded-xl px-5 py-3 font-qurova ch-text" style={{ borderColor: MainColors.orange }}>
            Proceed to Squad Lobby
          </Link>
        </div>

        {copyOk && <p className="text-center mt-2 text-green-400 text-sm">Copied!</p>}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-2" style={{ color: MainColors.subText }}>
      <div className="flex-1 h-px" style={{ backgroundColor: MainColors.subText }}></div>
      <span className="font-area text-sm" style={{ color: MainColors.subText }}>or</span>
      <div className="flex-1 h-px" style={{ backgroundColor: MainColors.subText }}></div>
    </div>
  );
}
