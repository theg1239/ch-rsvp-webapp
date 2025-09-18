"use client";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useAppStore } from "../../../store/appStore";

const MainColors = { background: "#241f1a", orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function SignInPage() {
  const router = useRouter();
  const { signInWithGoogle, user, initialized } = useAuth();
  const { decideFromBackend, setHideNav } = useAppStore();
  const guestMode = (process.env.NEXT_PUBLIC_GUEST_MODE === '1') || (process.env.GUEST_MODE === '1');

  // Hide Nav while on SignIn
  useEffect(() => { setHideNav(true); return () => setHideNav(false); }, [setHideNav]);

  const handleSignIn = async () => {
    if (guestMode) { router.replace('/hunt'); return; }
    await signInWithGoogle();
    await decideFromBackend();
    router.replace('/hunt');
  };

  // If already signed in, skip page
  useEffect(() => {
    if (!initialized) return;
    if (user || guestMode) { router.replace('/hunt'); }
  }, [initialized, user, guestMode, router]);

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
          <div className="auth-hero">
            <img src="/images/six-owls.svg" alt="Six owls" />
          </div>

        <section className="mt-10">
          <div className="mx-auto max-w-xl">
            <h2 className="text-left font-qurova ch-gradient-text mb-2" style={{ bottom: '5vh' }}>Log in</h2>
            <p className="text-left mb-6 font-area ch-text">
              Use the same email for login as during registration.
            </p>
          </div>
        </section>
      </div>

      {/* Bottom sticky action like the phone version */}
      {!guestMode && (
        <div className="fixed left-0 right-0 nav-safe-offset px-5" style={{ bottom: '2vh' }}>
          <div className="ch-card ch-glass rounded-2xl p-3">
            <button
              onClick={handleSignIn}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-3 btn-ripple ch-btn"
            >
              <Image src="/images/google-logo.svg" alt="Google" width={20} height={20} />
              <span className="font-qurova">Log in with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
