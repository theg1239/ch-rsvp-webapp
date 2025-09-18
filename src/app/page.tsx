"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../store/appStore";
import SplashScreen from "../components/SplashScreen";

export default function RootRedirector() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { decideFromBackend, setHideNav } = useAppStore();

  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);

  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace('/signin'); return; }

    let active = true;
    (async () => {
      try {
        await decideFromBackend();
      } finally {
        if (!active) return;
        router.replace('/hunt');
      }
    })();
    return () => { active = false; };
  }, [initialized, user, router, decideFromBackend]);

  return <SplashScreen label="Resolving where to take you…" />;
}
