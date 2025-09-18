"use client";
import { useState } from "react";
import QRScannerOverlay from "@/components/QRScannerOverlay";
import NFCScannerOverlay from "@/components/NFCScannerOverlay";

export default function ScannerPage() {
  const [qr, setQr] = useState(false);
  const [nfc, setNfc] = useState(false);
  const [last, setLast] = useState<string>("");
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom grid gap-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/images/QRScanner/Overlay.svg" alt="QR" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">Scanner</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={() => setQr(true)} className="h-12 rounded-xl font-qurova ch-btn">Open QR Scanner</button>
          <button onClick={() => setNfc(true)} className="h-12 rounded-xl font-qurova ch-btn">Open NFC Scanner</button>
        </div>
        {last && (
          <div className="rounded-xl ch-card ch-card--outlined p-4">
            <p className="font-qurova ch-text">Last Scan</p>
            <p className="font-area ch-subtext mt-1 break-words">{last}</p>
          </div>
        )}
      </div>
      <QRScannerOverlay open={qr} onClose={() => setQr(false)} onDetect={(v)=> { setLast(String(v)); setQr(false); }} />
      <NFCScannerOverlay open={nfc} onClose={() => setNfc(false)} onRead={(t)=> { setLast(String(t)); setNfc(false); }} />
    </div>
  );
}

