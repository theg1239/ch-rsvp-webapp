"use client";
import { useEffect, useRef, useState } from "react";
import { usePhase } from "@/context/PhaseContext";

export default function PhaseTransition() {
  const { phase, status } = usePhase();
  const prev = useRef<number | undefined>(undefined);
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    if (phase && prev.current !== undefined && phase !== prev.current) {
      setLabel(`Phase ${phase} has started`);
      setShow(true);
      const t = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(t);
    }
    prev.current = phase;
  }, [phase]);

  if (!show) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[55]">
      <div className="rounded-2xl px-4 py-2 ch-card ch-glass ch-gradient text-white font-qurova shadow-[0_10px_30px_rgba(0,0,0,.35)]" style={{ border: '1px solid rgba(255,255,255,.2)' }}>
        {label}
      </div>
    </div>
  );
}

