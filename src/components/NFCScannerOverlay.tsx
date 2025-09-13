"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onRead: (text: string) => void;
};

export default function NFCScannerOverlay({ open, onClose, onRead }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => { setSupported(typeof (window as any).NDEFReader !== 'undefined'); }, []);

  useEffect(() => {
    if (!open) { if (controllerRef.current) { controllerRef.current.abort(); controllerRef.current = null; } return; }
    let cancelled = false;
    (async () => {
      setError(null);
      if (typeof (window as any).NDEFReader === 'undefined') { setError('Web NFC not supported on this device/browser'); return; }
      try {
        const NDEFReader: any = (window as any).NDEFReader;
        const reader = new NDEFReader();
        const ctrl = new AbortController(); controllerRef.current = ctrl;
        await reader.scan({ signal: ctrl.signal });
        reader.onreading = (event: any) => {
          try {
            const records = event.message?.records || [];
            let text = '';
            for (const r of records) {
              if (r.recordType === 'text') {
                const dec = new TextDecoder(r.encoding || 'utf-8');
                text = dec.decode(r.data);
                break;
              }
              if (r.recordType === 'url' || r.mediaType === 'text/plain') {
                const dec = new TextDecoder('utf-8');
                text = dec.decode(r.data);
                break;
              }
            }
            if (text) { onRead(text); }
          } catch {}
        };
        reader.onreadingerror = () => { setError('NFC read failed, try again'); };
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to start NFC scan');
      }
    })();
    return () => { cancelled = true; if (controllerRef.current) { controllerRef.current.abort(); controllerRef.current = null; } };
  }, [open, onRead]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="relative w-full max-w-md aspect-[9/16] ch-card ch-card--outlined" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/images/QuestionsPage/nfc.svg" alt="nfc" className="w-24 h-24 opacity-90" />
        </div>
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <button aria-label="Close" onClick={onClose} className="rounded-full p-2 bg-[rgba(0,0,0,.35)]">
            <img src="/images/QRScanner/Close.svg" alt="close" className="w-6 h-6" />
          </button>
          <span className="px-3 py-1 rounded-full font-qurova ch-text ch-card ch-glass">Scan NFC</span>
          <span className="px-2 py-1 rounded-full font-area ch-subtext text-xs bg-[rgba(0,0,0,.35)]">{supported ? 'Ready' : 'Unsupported'}</span>
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          {error && <p className="font-area ch-subtext text-center text-sm bg-[rgba(0,0,0,.4)] px-3 py-2 rounded">{error}</p>}
          {!error && <p className="font-area ch-subtext text-center text-sm opacity-90">Hold your device near the tag…</p>}
        </div>
      </div>
    </div>
  );
}

