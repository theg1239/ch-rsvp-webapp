"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setupMessaging } from "../lib/firebase";
import { usePhase } from "../context/PhaseContext";
import { useAppStore } from "../store/appStore";
import api from "../lib/api";
import type { MainGeneric, ApiOk, ProfileData } from "../lib/types";
import { useAuth } from "../context/AuthContext";

export default function FCMBridge() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user, initialized } = useAuth();
  const { decideFromBackend, setView, guestMode } = useAppStore() as any;
  const phase = usePhase();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const qs = new URLSearchParams();
        const cfg: Record<string, string | undefined> = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
        };
        for (const [k, v] of Object.entries(cfg)) if (v) qs.set(k, v);
        const url = `/firebase-messaging-sw.js${qs.toString() ? `?${qs.toString()}` : ''}`;
        navigator.serviceWorker.register(url).catch(()=>{});
      } catch {
        navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(()=>{});
      }
    }
  }, []);

  useEffect(() => {
    if (!initialized || !user) return;
    if (guestMode) return; // Skip FCM-driven backend routing in guest mode
    const refreshRoute = async () => {
      if (SPA && pathname.startsWith('/hunt')) { await decideFromBackend(); return; }
      try {
        const main = await api.get<MainGeneric>("/api/main");
        const msg = (main.message || '').toUpperCase();
        if (pathname.startsWith('/hunt')) {
          if (msg === 'ONBOARDING_INCOMPLETE') { setView('onboarding'); return; }
          if (msg === 'NO_TEAM' || msg === 'ATTENDANCE_MARKED') { setView('team'); return; }
          if (msg === 'TEAM_NOT_CHECKED_IN') { setView('checkin'); return; }
          if (msg === 'TEAM_BLACKLISTED') { setView('profile'); return; }
          if (msg === 'EVENT_ENDED') { setView('leaderboard'); return; }
          if (msg === 'PHASE_ACTIVE' || msg === 'PHASE_NOT_STARTED') { setView('questions'); return; }
        } else {
          if (msg === 'ONBOARDING_INCOMPLETE') { router.replace('/hunt/onboarding'); return; }
          if (msg === 'NO_TEAM' || msg === 'ATTENDANCE_MARKED') { router.replace('/hunt/team'); return; }
          if (msg === 'TEAM_NOT_CHECKED_IN') { router.replace('/hunt/checkin'); return; }
          if (msg === 'TEAM_BLACKLISTED') { router.replace('/hunt/profile'); return; }
          if (msg === 'EVENT_ENDED') { router.replace('/hunt/leaderboard'); return; }
          if (msg === 'PHASE_ACTIVE' || msg === 'PHASE_NOT_STARTED') { router.replace('/hunt/questions'); return; }
        }
      } catch {}
      try {
        const prof = await api.get<ApiOk<ProfileData>>('/api/profile/');
        const team = (prof.data as ProfileData)?.user?.team;
        if (pathname.startsWith('/hunt')) setView(team ? 'questions' : 'team');
        else router.replace(team ? '/hunt/questions' : '/hunt/team');
      } catch { if (pathname.startsWith('/hunt')) setView('team'); else router.replace('/hunt/team'); }
    };
    const handleEvent = (data: Record<string, string>) => {
      const action = (data?.action || '').toLowerCase();
      const target = (data?.target || '').toLowerCase();
      const eventType = (data?.eventType || data?.event_type || '').toLowerCase();
      // Always refresh main if requested
      if (action === 'refresh' && (target === '' || target.includes('main'))) { void Promise.all([refreshRoute(), phase.refresh()]); }
      // Route to questions when indicated
      if (target.includes('question') || eventType === 'response_completed') { if (pathname.startsWith('/hunt')) setView('questions'); else router.replace('/hunt/questions'); }
      // Team events: route to team if not already there, then refresh
      if (eventType === 'team_join' || eventType === 'team_leave') { if (pathname.startsWith('/hunt')) setView('team'); else router.replace('/hunt/team'); }
    };

    // Bridge onMessage (foreground)
  void setupMessaging(refreshRoute, handleEvent);

    // Bridge SW -> page messages (background clicks/background message relay)
    const onSwMessage = (ev: MessageEvent) => {
      if (ev && ev.data && typeof ev.data === 'object' && ev.data.__fcm === true) {
        handleEvent(ev.data.payload || {} as any);
      }
    };
    navigator.serviceWorker?.addEventListener?.('message', onSwMessage as any);
    return () => {
      navigator.serviceWorker?.removeEventListener?.('message', onSwMessage as any);
    };
  }, [initialized, user, SPA, router, pathname, decideFromBackend, phase, setView, guestMode]);
  return null;
}
