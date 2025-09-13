"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import type { PostUserDetailsReq, PostUserDetailsRes } from "../../lib/types";
import { Gender } from "../../lib/types";
import { useAppStore } from "../../store/appStore";

const MainColors = { background: "#241f1a", orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const { setView, setHideNav } = useAppStore();
  const SPA = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SPA === '1';

  // Hide NavBar on onboarding view
  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (initialized && !user) router.replace("/signin"); }, [initialized, user, router]);

  const canSubmit = useMemo(() => phone.trim().length === 10 && /^\d{10}$/.test(phone), [phone]);

  const submit = async () => {
    setErr(null);
    if (!canSubmit) { setErr("Enter a valid 10-digit phone number"); return; }
    setBusy(true);
    try {
      const body: PostUserDetailsReq = { phone: phone.trim(), gender: gender === "Male" ? Gender.MALE : Gender.FEMALE };
      const res = await api.post<PostUserDetailsRes>("/app/onboarding/", body);
      if (res.status === "success") {
        if (SPA) setView('team'); else router.replace("/team");
      } else {
        setErr(res.message || "Failed to submit details");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to submit details");
    } finally { setBusy(false); }
  };

  if (!initialized || !user) return null;

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/images/onboarding1worldmapbg.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />

      <div className="relative ch-container ch-container-narrow pt-12 pb-36 safe-bottom">
        <header className="text-center">
          <h1 className="font-qurova ch-gradient-text ch-title ch-h1">cryptic hunt</h1>
        </header>

        <div className="mt-3 text-center">
          <p className="leading-snug font-area ch-text ch-tagline">
            Please provide the following details to continue.
          </p>
        </div>

        <section className="mt-8 grid gap-6">
          <div className="grid gap-3">
            <h2 className="font-qurova ch-gradient-text ch-h2">Gender</h2>
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => setGender("Male")} className="flex-1 h-11 rounded-xl font-qurova" style={{ border: `2px solid ${MainColors.orange}`, background: gender === "Male" ? MainColors.orange : "transparent", color: gender === "Male" ? "#000" : MainColors.text }}>Male</button>
              <button onClick={() => setGender("Female")} className="flex-1 h-11 rounded-xl font-qurova" style={{ border: `2px solid ${MainColors.orange}`, background: gender === "Female" ? MainColors.orange : "transparent", color: gender === "Female" ? "#000" : MainColors.text }}>Female</button>
            </div>
          </div>

          <div className="grid gap-3">
            <h2 className="font-qurova ch-gradient-text ch-h2">Phone Number</h2>
            <div className="flex items-center gap-2">
              <div className="rounded-xl h-11 px-4 flex items-center" style={{ border: `2px solid ${MainColors.orange}`, color: MainColors.orange }}>+91</div>
              <input
                className="flex-1 h-11 rounded-xl px-4 bg-neutral-800 text-white outline-none font-area"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <p className="font-area text-xs" style={{ color: MainColors.subText }}>Used only for event coordination.</p>
          </div>

          {err && <p className="text-sm text-red-400">{err}</p>}
        </section>
      </div>

      {/* Bottom sticky action */}
      <div className="fixed left-0 right-0 nav-safe-offset px-5" style={{ bottom: '2vh' }}>
        <div className="ch-card ch-glass rounded-2xl p-3">
          <button onClick={submit} disabled={!canSubmit || busy} className="w-full h-12 rounded-xl flex items-center justify-center gap-3 btn-ripple ch-btn">
            <span className="font-qurova">{busy ? 'Submitting…' : 'Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
