"use client";
import { useState } from "react";
import NFCScannerOverlay from "@/components/NFCScannerOverlay";

export default function NFCPage() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState<string>("");
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/QuestionsPage/nfc.svg" alt="NFC" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">NFC Scanner</h1>
        </div>
        <div className="rounded-2xl ch-card ch-card--outlined p-6 grid gap-4">
          <p className="font-area ch-subtext">Tap the button to scan an NFC tag. On supported Android Chrome devices, Web NFC will read text or URL records.</p>
          <button className="h-11 rounded-xl font-qurova ch-btn w-full" onClick={() => setOpen(true)}>Scan NFC</button>
          {last && (
            <div className="rounded-xl ch-card ch-card--outlined p-4">
              <p className="font-qurova ch-text">Last Read</p>
              <p className="font-area ch-subtext break-words mt-1">{last}</p>
            </div>
          )}
        </div>
      </div>
      <NFCScannerOverlay open={open} onClose={() => setOpen(false)} onRead={(t)=> { setLast(String(t)); setOpen(false); }} />
    </div>
  );
}

