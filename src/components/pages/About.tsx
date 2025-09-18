import Link from 'next/link';
import dynamic from 'next/dynamic';

const RegistrationPrompt = dynamic(() => import('../RegistrationPrompt'), { ssr: false });

export default function AboutPage() {
  return (
    <div className="min-h-dvh ch-bg relative">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none select-none"
        style={{
          backgroundImage: "url('/images/bgworldmap.svg')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
        }}
      />
      <div className="relative ch-container ch-container-narrow py-10 pb-28 safe-bottom space-y-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            {/* <img src="/images/owlOnPlane.png" alt="About" className="w-10 h-10" /> */}
            <h1 className="font-qurova ch-gradient-text ch-h2">About Cryptic Hunt</h1>
          </div>
          <p className="font-area ch-subtext leading-relaxed">
            Cryptic Hunt is VIT's largest scavenger hunt, offering a truly unique experience. Across 36 hours, participants race across campus scanning QR codes and solving text-based puzzles through our custom-built app. Teams crack riddles, chase clues, and battle to secure their spot at the top of the leaderboard.
          </p>
        </div>

        <section className="relative space-y-6">
          <RegistrationPrompt view="about" allowMarketing className="max-w-xl" align="left" />
          {/* Subdued glass card inspired by RegistrationPrompt */}
          <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10">
            {/* Subtle background pattern */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 1px)",
                backgroundSize: '18px 18px',
              }}
            />

            <div className="absolute -top-24 -left-12 hidden w-48 rotate-6 opacity-40 md:block">
            <img src="/images/balloons.png" alt="Celebration balloons swirling" className="w-full" />
          </div>
            <div className="absolute -bottom-16 -right-8 hidden w-56 opacity-30 lg:block">
            <img src="/images/map-asset.svg" alt="Map trails" className="w-full" />
          </div>

            <div className="relative mx-auto max-w-5xl space-y-12">
              <div className="space-y-7 text-left">
              {/* <span className="inline-flex items-center gap-2 self-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-qurova uppercase tracking-[0.3em] text-white/80 lg:self-start">
                Join The Hunt
              </span>
                <h2 className="font-qurova text-3xl text-white sm:text-4xl">
                  Ready to register your crew and conquer the campus?
                </h2>
                <p className="font-area text-base leading-relaxed text-white/80 sm:text-lg max-w-3xl">
                  Assemble your dream team, unlock exclusive puzzles, and race other seekers across VIT. Spots fill up fast every year, so lock in your registration now and start planning your winning strategy.
                </p> */}
              {/* <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:p-5 lg:p-6">
                  <img src="/images/map.svg" alt="Campus map icon" className="mt-1 h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                  <div>
                    <p className="font-qurova text-lg text-white lg:text-xl">36-hour campus quest</p>
                    <p className="font-area text-sm text-white/70 lg:text-base lg:leading-relaxed">
                      Navigate iconic hotspots, decode live drops, and keep the leaderboard vibing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:p-5 lg:p-6">
                  <img src="/images/resources.svg" alt="Rewards icon" className="mt-1 h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
                  <div>
                    <p className="font-qurova text-lg text-white lg:text-xl">Exclusive goodies</p>
                    <p className="font-area text-sm text-white/70 lg:text-base lg:leading-relaxed">
                      Score limited-edition merch, sponsor perks, and bragging rights that last all year.
                    </p>
                  </div>
                </div>
              </div> */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="https://gravitas.vit.ac.in/events/3df08aa2-22c9-42ff-8640-de501218780f"
                    className="inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-sm sm:text-base font-qurova tracking-[0.12em] text-white/90 transition hover:bg-white/24"
                  >
                    Register Now
                    <span aria-hidden className="text-white/70">→</span>
                  </Link>
                </div>
              </div>

            {/* <div className="relative mx-auto w-full max-w-[420px]">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2.75rem] border border-white/15 bg-gradient-to-br from-[#17112e]/80 via-[#271b49]/60 to-[#ff9e5d]/30 p-5 shadow-[0_25px_70px_rgba(17,11,39,0.5)]">
                <div className="absolute inset-0 bg-[url('/images/bgwhitemap.svg')] bg-cover bg-center opacity-25" />
                <div className="absolute -top-10 -left-8 h-32 w-32 rounded-full bg-white/25 blur-3xl" />
                <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#ff9e5d]/30 blur-3xl" />
                <div className="absolute inset-x-0 bottom-6 mx-auto h-24 w-[85%] rounded-full bg-gradient-to-t from-[#0f0a22]/80 to-transparent blur-2xl" />
                <div className="relative flex h-full w-full items-center justify-center">
                  <img
                    src="/mainowls.svg"
                    alt="Cryptic Hunt owl crew cheering"
                    className="w-[92%] max-w-[360px] drop-shadow-[0_25px_45px_rgba(17,11,39,0.55)]"
                  />
                </div>
              </div>
            </div> */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
