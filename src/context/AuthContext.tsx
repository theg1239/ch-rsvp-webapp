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
  const guestMode = (process.env.NEXT_PUBLIC_GUEST_MODE === '1') || (process.env.GUEST_MODE === '1');

  useEffect(() => {
    if (guestMode) {
      // Immediately establish a synthetic guest user
      setUser({ uid: 'guest', email: null, name: 'Guest' });
      setIdToken(null);
      setInitialized(true);
      return; // Skip firebase auth wiring entirely
    }
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
  }, [guestMode]);

  const actions = useMemo(() => {
    if (guestMode) {
      return {
        signInWithGoogle: async () => { /* no-op in guest mode */ },
        signOut: async () => { setUser({ uid: 'guest', email: null, name: 'Guest' }); setIdToken(null); },
      };
    }
    return {
      signInWithGoogle: async () => {
        await signInWithGooglePopup();
        const token = await getIdToken(true);
        setIdToken(token);
        try { window.localStorage.setItem('show_welcome', '1'); } catch {}
      },
      signOut: async () => {
        try {
          const t = typeof window !== 'undefined' ? window.localStorage.getItem('fcm_token') : null;
          if (t) {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/,'') || '';
            const doPost = async (tokenOrNull: string | null) => fetch(`${base}/fcm/tokens/unregister`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(tokenOrNull ? { Authorization: `Bearer ${tokenOrNull}` } : {}) },
              body: JSON.stringify({ token: t }),
            });
            let res = await doPost(await getIdToken());
            if (res.status === 401 || res.status === 403) {
              res = await doPost(await getIdToken(true));
            }
          }
        } catch {}
        await signOutFirebase();
        setIdToken(null);
      },
    };
  }, [guestMode]);

  // No-op effect for idToken; onboarding happens via dedicated screen and real user input
  useEffect(() => { /* idToken available */ }, [idToken]);

  const value: AuthContextType = { user, idToken, initialized, signInWithGoogle: actions.signInWithGoogle, signOut: actions.signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
