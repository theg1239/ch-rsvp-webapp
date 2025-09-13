"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import type { ApiOk, ProfileData } from "../../../lib/types";

const MainColors = { background: "#241f1a", orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleSignUp = async () => {
    await signInWithGoogle();
    try {
      const res = await api.get<ApiOk<ProfileData>>("/api/profile/");
      const team = (res.data as ProfileData)?.user?.team;
      router.push(team ? "/questions" : "/team");
    } catch {
      router.push("/team");
    }
  };

  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />
      <div className="relative ch-container ch-container-narrow pt-12 pb-36 safe-bottom">
        <header className="text-center">
          <h1 className="font-qurova ch-gradient-text ch-title ch-h1">cryptic hunt</h1>
        </header>

        <div className="mt-3 text-center">
          <p className="leading-snug font-area ch-text ch-tagline">
            We are not just another event.
            <br />
            We are the conspiracy that actually works.
          </p>
        </div>

        {/* Mobile/desktop hero (six owls), cropped; larger + higher on desktop */}
        <div className="mt-8">
          <div className="auth-hero">
            <img src="/images/six-owls.svg" alt="Six owls" />
          </div>
        </div>

        <section className="mt-10">
          <div className="mx-auto max-w-xl">
            <h2 className="text-left font-qurova ch-gradient-text mb-2 ch-h2">Sign up</h2>
            <p className="text-left mb-6 font-area ch-text">
              Use your Google account to get started.
            </p>
          </div>
        </section>
      </div>

      {/* Bottom sticky action like the phone version */}
      <div className="fixed left-0 right-0 nav-safe-offset px-5">
        <div className="ch-card ch-glass rounded-2xl p-3">
          <button
            onClick={handleSignUp}
            className="w-full h-12 rounded-xl flex items-center justify-center gap-3 btn-ripple ch-btn"
          >
            <Image src="/images/google-logo.svg" alt="Google" width={20} height={20} />
            <span className="font-qurova">Sign up with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
