"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initFirebase, onAuth, signInWithGooglePopup, signOutFirebase, getIdToken } from "../lib/firebase";
import api from "../lib/api";

type AuthContextType = {
  user: { uid: string; email: string | null; name: string | null } | null;
  idToken: string | null;
  initialized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  idToken: null,
  initialized: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initFirebase();
    const unsub = onAuth(async (u) => {
      if (!u) {
        setUser(null);
        setIdToken(null);
        setInitialized(true);
        return;
      }
      setUser({ uid: u.uid, email: u.email, name: u.displayName });
      const token = await u.getIdToken(false);
      setIdToken(token ?? null);
      setInitialized(true);
    });
    return () => unsub();
  }, []);

  const actions = useMemo(() => ({
    signInWithGoogle: async () => {
      await signInWithGooglePopup();
      const token = await getIdToken(true);
      setIdToken(token);
      try { window.localStorage.setItem('show_welcome', '1'); } catch {}
      try { await api.post("/app/onboarding", { phone: "9999999999", gender: "OTHER" }); } catch {}
    },
    signOut: async () => {
      await signOutFirebase();
      setIdToken(null);
    },
  }), []);

  useEffect(() => {
    if (!idToken) return;
    (async () => { try { await api.post("/app/onboarding", { phone: "9999999999", gender: "OTHER" }); } catch {} })();
  }, [idToken]);

  const value: AuthContextType = { user, idToken, initialized, ...actions };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
