"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

const MainColors = { background: "#241f1a", orange: "#F5753B", text: "#ffffff", subText: "#cccccc" } as const;

export default function SignUpPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleSignUp = async () => {
    await signInWithGoogle();
    router.push("/");
  };

  return (
    <div className="min-h-dvh ch-bg">
      <div className="absolute inset-0 pointer-events-none select-none opacity-30" style={{ backgroundImage: "url('/Images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <img src="/Images/JoinPage/cryptichuntcorner.svg" alt="cryptic" className="absolute top-3 left-3 w-24 h-auto opacity-90" />
      <div className="relative max-w-3xl mx-auto px-6 pt-12">
        <header className="text-center">
          <h1 className="font-qurova ch-orange ch-title" style={{ fontSize: "42px" }}>cryptic hunt</h1>
        </header>

        <div className="mt-4 text-center">
          <p className="leading-snug font-area ch-text ch-tagline">
            We are not just another event.
            <br />
            We are the conspiracy that actually works.
          </p>
        </div>

        <div className="mt-8 h-[220px]" />

        <section className="mt-10">
          <div className="mx-auto max-w-xl">
            <h2 className="text-left font-qurova ch-gradient-text mb-2" style={{ fontSize: "32px" }}>Sign up</h2>
            <p className="text-left mb-6 font-area ch-text">
              Use your Google account to get started.
            </p>

            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={handleSignUp}
                className="w-full max-w-xl h-12 rounded-xl flex items-center justify-center gap-3"
                style={{ backgroundColor: MainColors.orange }}
              >
                <Image src="/cryptic-assets/google-logo.svg" alt="Google" width={20} height={20} />
                <span className="font-qurova" style={{ color: MainColors.text }}>Sign up with Google</span>
              </button>
              {/* Apple Sign-up may be added later when configured for web */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
