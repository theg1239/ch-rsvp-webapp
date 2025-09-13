"use client";
import { create } from "zustand";
import api from "../lib/api";
import type { MainGeneric } from "../lib/types";

export type AppView =
  | "signin"
  | "signup"
  | "onboarding"
  | "checkin"
  | "team"
  | "questions"
  | "profile"
  | "leaderboard";

type AppStore = {
  view: AppView;
  busy: boolean;
  error: string | null;
  setView: (v: AppView) => void;
  decideFromBackend: () => Promise<void>;
  hideNav: boolean;
  setHideNav: (v: boolean) => void;
};

export const useAppStore = create<AppStore>((set, get) => ({
  view: "signin",
  busy: false,
  error: null,
  setView: (v) => set({ view: v }),
  hideNav: false,
  setHideNav: (v) => set({ hideNav: v }),
  decideFromBackend: async () => {
    if (get().busy) return; // avoid overlap
    set({ busy: true, error: null });
    try {
      const res = await api.get<MainGeneric>("/api/main");
      const msg = (res.message || "").toUpperCase();
      if (msg === "ONBOARDING_INCOMPLETE") { set({ view: "onboarding" }); return; }
      if (msg === "NO_TEAM" || msg === "ATTENDANCE_MARKED") { set({ view: "team" }); return; }
      if (msg === "TEAM_NOT_CHECKED_IN") { set({ view: "checkin" }); return; }
      if (msg === "PHASE_ACTIVE" || msg === "PHASE_NOT_STARTED") { set({ view: "questions" }); return; }
      if (msg === "TEAM_BLACKLISTED") { set({ view: "profile" }); return; }
      if (msg === "EVENT_ENDED") { set({ view: "leaderboard" }); return; }
      set({ view: "questions" });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : "Failed to determine app state" });
      set({ view: "team" });
    } finally {
      set({ busy: false });
    }
  },
}));
