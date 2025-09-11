"use client";
export default function LoadingOverlay({ show, label }: { show: boolean; label?: string }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="ch-spinner" />
        {label && <p className="font-area ch-text text-sm">{label}</p>}
      </div>
      <style jsx>{`
        .ch-spinner {
          width: 56px; height: 56px;
          border: 4px solid rgba(255,255,255,0.25);
          border-top-color: #F5753B;
          border-radius: 50%;
          animation: chspin 0.8s linear infinite;
        }
        @keyframes chspin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

