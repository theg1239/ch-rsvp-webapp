"use client";
import React from "react";

export default function Modal({ open, onClose, title, children, success }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode; success?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }}>
      <div className="rounded-2xl p-6 fade-in" style={{ width: 420, maxWidth:'calc(100% - 32px)', background: 'var(--ch-bg)', border:'1px solid rgba(255,255,255,.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-qurova ch-text text-lg">{title || (success ? 'Nice!' : 'Heads up')}</h3>
          <button onClick={onClose} className="font-qurova text-sm" style={{ color:'var(--ch-subtext)' }}>Close</button>
        </div>
        <div className="font-area ch-text text-sm">{children}</div>
      </div>
    </div>
  );
}

