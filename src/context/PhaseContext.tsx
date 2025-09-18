"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import type { MainGeneric } from "@/lib/types";

type PhaseState = {
  status: string; // PHASE_ACTIVE | PHASE_NOT_STARTED | EVENT_ENDED | TEAM_NOT_CHECKED_IN | etc.
  phase?: number;
  currentTime?: string;
  nextTime?: string;
  refresh: () => Promise<void>;
};

const Ctx = createContext<PhaseState | null>(null);

export function PhaseProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<string>("");
  const [phase, setPhase] = useState<number | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState<string | undefined>(undefined);
  const [nextTime, setNextTime] = useState<string | undefined>(undefined);
  const inflight = useRef<Promise<void> | null>(null);
  const guestMode = (process.env.NEXT_PUBLIC_GUEST_MODE === '1') || (process.env.GUEST_MODE === '1');

  const refresh = useCallback(async () => {
    if (inflight.current) return inflight.current;
    const p = (async () => {
      try {
        if (guestMode) {
          const start = new Date('2025-09-26T00:00:00.000Z').getTime();
            // Use user's local time to determine state
          const now = Date.now();
          if (now < start) {
            setStatus('PHASE_NOT_STARTED');
            setPhase(undefined);
            setCurrentTime(new Date().toISOString());
            setNextTime(new Date(start).toISOString());
          } else {
            setStatus('PHASE_ACTIVE');
            setPhase(1);
            setCurrentTime(new Date().toISOString());
            setNextTime(new Date(now + 60 * 60 * 1000).toISOString());
          }
        } else {
          const res = await api.get<MainGeneric>("/api/main");
          setStatus(res.message || "");
          const d: any = res.data || {};
          setPhase(d.active_phase);
          setCurrentTime(d.current_phase_time);
          setNextTime(d.next_phase_time);
        }
      } catch (e) {
        // keep prior values; do not throw
      } finally { inflight.current = null; }
    })();
    inflight.current = p;
    return p;
  }, [guestMode]);

  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 60_000); return () => clearInterval(id); }, [refresh]);

  const value = useMemo<PhaseState>(() => ({ status, phase, currentTime, nextTime, refresh }), [status, phase, currentTime, nextTime, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePhase() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePhase must be used within PhaseProvider");
  return v;
}

