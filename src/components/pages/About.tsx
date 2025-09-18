export default function AboutPage() {
  return (
    <div className="min-h-dvh ch-bg relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none select-none" style={{ backgroundImage: "url('/images/bgworldmap.svg')", backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'top center' }} />
      <div className="relative ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/owlOnPlane.png" alt="About" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">About Cryptic Hunt</h1>
        </div>
        <p className="font-area ch-subtext leading-relaxed">
          Cryptic Hunt is ACM-VIT’s annual puzzle adventure. Form squads, solve creative riddles across themed
          phases, and race to the leaderboard. This web experience mirrors the mobile app with push notifications,
          responsive UI, and quick access to team and questions.
        </p>
      </div>
    </div>
  );
}

