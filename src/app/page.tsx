"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import type { MainGeneric, ApiOk, ProfileData } from "../lib/types";
import { useAppStore } from "../store/appStore";
import SplashScreen from "../components/SplashScreen";

export default function RootRedirector() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { setView, decideFromBackend, setHideNav } = useAppStore();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';

  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { if (SPA) { setView('signin'); router.replace('/signin'); } else { router.replace('/signin'); } return; }

    let active = true;
    (async () => {
      try {
        if (SPA) {
          await decideFromBackend();
          router.replace('/spa');
          return;
        }
        const main = await api.get<MainGeneric>("/api/main");
        if (!active) return;
        const msg = (main.message || '').toUpperCase();
        router.replace('/hunt'); return;
      } catch {}
      try {
        const prof = await api.get<ApiOk<ProfileData>>('/api/profile/');
        const team = (prof.data as ProfileData)?.user?.team;
        router.replace('/hunt');
      } catch { router.replace('/hunt'); }
    })();
    return () => { active = false; };
  }, [initialized, user, router, SPA, setView, decideFromBackend]);

  return <SplashScreen label="Resolving where to take you…" />;
}
