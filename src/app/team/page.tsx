"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import type { ApiOk, ProfileData } from "../../lib/types";

const MainColors = {
  background: "#241f1a",
  orange: "#F5753B",
  text: "#ffffff",
  subText: "#cccccc",
};

type ProfileState = { loading: boolean; data: ProfileData | null; notInTeam: boolean; error: string | null };

export default function TeamPage() {
  const router = useRouter();
  const { user, initialized } = useAuth();
  const [state, setState] = useState<ProfileState>({ loading: true, data: null, notInTeam: false, error: null });
  const [qrB64, setQrB64] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/signin");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
        if (!mounted) return;
        setState({ loading: false, data: res.data, notInTeam: false, error: null });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to fetch profile";
        // Backend returns 400 when user is not part of any team
        if (msg.includes("User is not part of any team") || msg.includes("400")) {
          setState({ loading: false, data: null, notInTeam: true, error: null });
          return;
        }
        setState({ loading: false, data: null, notInTeam: false, error: msg });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [initialized, user, router]);

  useEffect(() => {
    if (!state.data) return;
    // Fetch QR only if in a team
    api
      .get<ApiOk<string>>("/api/team/user/qr")
      .then((r) => setQrB64(r.data))
      .catch(() => setQrB64(null));
  }, [state.data]);

  const content = useMemo(() => {
    if (state.loading) return <p className="text-sm" style={{ color: MainColors.subText }}>Loading…</p>;
    if (state.error) return <p className="text-sm text-red-400">{state.error}</p>;
    if (state.notInTeam) return <NoTeamView onSuccess={() => router.refresh()} />;
    if (state.data) return <TeamView data={state.data} qrB64={qrB64} onLeft={() => router.refresh()} />;
    return null;
  }, [state, qrB64, router]);

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/Images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/Images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />
      <div className="relative ch-container ch-container-narrow py-10 safe-bottom">
        <header className="text-center mb-6">
          <h1 className="font-qurova ch-gradient-text ch-h1">Create your Squad</h1>
        </header>
        {content}
      </div>
    </div>
  );
}

function NoTeamView({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const createTeam = async () => {
    setErr(null);
    if (!name.trim()) return setErr("Team name is required");
    setBusy("Creating team…");
    try {
      await api.post<ApiOk<string>>("/api/user/team/create", { name });
      router.push("/questions");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to create team");
    } finally {
      setBusy(null);
    }
  };

  const joinTeam = async () => {
    setErr(null);
    if (!code.trim()) return setErr("Team code is required");
    setBusy("Joining team…");
    try {
      await api.post<ApiOk<unknown>>("/api/user/team/join", { code });
      router.push("/questions");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to join team");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <h2 className="font-qurova ch-gradient-text ch-h2">Create a team</h2>
        <input
          className="w-full h-11 rounded-xl px-4 bg-neutral-800 text-white outline-none font-area"
          placeholder="Team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createTeam} className="h-11 rounded-xl font-qurova ch-btn">
          Create team
        </button>
      </section>

      <section className="grid gap-3">
        <h2 className="font-qurova ch-gradient-text ch-h2">Join with code</h2>
        <CodeInputs value={code} onChange={setCode} length={6} />
        <button onClick={joinTeam} className="h-11 rounded-xl font-qurova ch-btn">Join team</button>

        <div className="flex items-center gap-3 mt-2 opacity-80" style={{ color: MainColors.subText }}>
          <div className="flex-1 h-px" style={{ backgroundColor: MainColors.subText }} />
          <span className="font-area">OR</span>
          <div className="flex-1 h-px" style={{ backgroundColor: MainColors.subText }} />
        </div>
        <div className="w-full flex items-center justify-center">
          <button className="rounded-full px-8 py-3 bg-white flex items-center gap-3" type="button">
            <img src="/Images/JoinPage/scanning.svg" alt="scan" className="w-5 h-5" />
            <span className="font-area" style={{ color: '#2C2824' }}>Join using QR</span>
          </button>
        </div>
      </section>

      {busy && <p className="text-sm" style={{ color: MainColors.subText }}>{busy}</p>}
      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}

function TeamView({ data, qrB64, onLeft }: { data: ProfileData; qrB64: string | null; onLeft: () => void }) {
  const team = data.user.team as ProfileData["user"]["team"];
  const [leaving, setLeaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const leave = async () => {
    setErr(null);
    setLeaving(true);
    try {
      await api.post<ApiOk<unknown>>("/api/profile/leave_team", {});
      onLeft();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to leave team");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h2 className="text-2xl font-qurova ch-gradient-text">{team?.name}</h2>
        <p className="text-sm font-area" style={{ color: MainColors.subText }}>Code: {team?.code}</p>
      </div>

      <div className="grid gap-2">
        <h3 className="font-qurova ch-gradient-text">Members</h3>
        <ul className="list-disc pl-5 font-area ch-text">
          {team?.users?.map((u, idx: number) => (
            <li key={idx}>{u.name || u.email}</li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2">
        <h3 className="font-qurova ch-gradient-text">Join via QR</h3>
        {qrB64 ? (
          <img alt="Team join QR" src={`data:image/png;base64,${qrB64}`} className="h-48 w-48 rounded bg-white p-2" />
        ) : (
          <p className="text-sm font-area" style={{ color: MainColors.subText }}>Generating…</p>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={leave} disabled={leaving} className="h-11 rounded-xl px-4 font-qurova"
                style={{ backgroundColor: "#444", color: MainColors.text }}>
          {leaving ? "Leaving…" : "Leave team"}
        </button>
      </div>

      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}

function CodeInputs({ value, onChange, length }: { value: string; onChange: (v: string) => void; length: number }) {
  const chars = Array.from({ length }, (_, i) => value[i] || "");
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
      {chars.map((ch, i) => (
        <input
          key={i}
          inputMode="text"
          maxLength={1}
          value={ch}
          onChange={(e) => {
            const c = (e.target.value || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            const prefix = value.slice(0, i);
            const suffix = value.slice(i + 1);
            onChange((prefix + c + suffix).slice(0, length));
          }}
          className="text-center font-qurova"
          style={{
            height: 'clamp(44px, 9vw, 56px)',
            width: 'clamp(44px, 9vw, 56px)',
            borderWidth: 2,
            borderColor: MainColors.orange,
            borderRadius: 18,
            color: MainColors.orange,
            fontSize: 22,
            background: 'transparent',
          }}
        />
      ))}
    </div>
  );
}
