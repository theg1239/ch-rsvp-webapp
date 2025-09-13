"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetect: (value: string, photoUrl?: string) => void;
};

export default function QRScannerOverlay({ open, onClose, onDetect }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean>(false);

  const stop = useCallback(() => {
    const s = streamRef.current; streamRef.current = null;
    if (s) s.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => { if (!open) stop(); }, [open, stop]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const constraints: MediaStreamConstraints = { video: { facingMode: { ideal: 'environment' } } };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) { s.getTracks().forEach(t=>t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(()=>{});
        }
        // Torch availability
        const track = s.getVideoTracks?.()[0];
        const capabilities = (track && (track.getCapabilities?.() as any)) || {};
        setSupported(!!(window as any).BarcodeDetector || false);
        if (torchOn && capabilities.torch) {
          await (track.applyConstraints as any)({ advanced: [{ torch: true }] }).catch(()=>{});
        }
        // Detection loop using BarcodeDetector if available
        if ((window as any).BarcodeDetector) {
          const det = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const tick = async () => {
            if (cancelled || !videoRef.current || !open) return;
            try {
              const v = videoRef.current;
              if (v.videoWidth && v.videoHeight && ctx) {
                canvas.width = v.videoWidth; canvas.height = v.videoHeight;
                ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
                const bitmap = await createImageBitmap(canvas);
                const codes = await det.detect(bitmap);
                if (codes && codes.length > 0) {
                  const raw = codes[0].rawValue || codes[0].raw || '';
                  if (raw) { onDetect(String(raw)); return; }
                }
              }
            } catch {}
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      } catch (e: any) {
        setError(e?.message || 'Camera access failed');
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [open, torchOn, onDetect, stop]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      {/* App-like frame */}
      <div className="relative w-full max-w-md aspect-[9/16] ch-card ch-card--outlined" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
        {/* Overlay graphics */}
        <img src="/images/QRScanner/Overlay.svg" alt="overlay" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />

        {/* Top bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <button aria-label="Close" onClick={onClose} className="rounded-full p-2 bg-[rgba(0,0,0,.35)]">
            <img src="/images/QRScanner/Close.svg" alt="close" className="w-6 h-6" />
          </button>
          <span className="px-3 py-1 rounded-full font-qurova ch-text ch-card ch-glass">Scan QR</span>
          <button aria-label="Torch" onClick={() => setTorchOn(v=>!v)} className="rounded-full p-2 bg-[rgba(0,0,0,.35)]">
            <img src={torchOn ? "/images/QRScanner/FlashOn.svg" : "/images/QRScanner/FlashOff.svg"} alt="flash" className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom action: manual fallback */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          {!supported && <p className="font-area ch-subtext text-xs bg-[rgba(0,0,0,.4)] px-3 py-1 rounded">Live scan not supported on this browser. Use manual entry.</p>}
        </div>
      </div>
    </div>
  );
}

