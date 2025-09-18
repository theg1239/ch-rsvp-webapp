import dynamic from "next/dynamic";

const RegistrationPrompt = dynamic(() => import("../RegistrationPrompt"), { ssr: false });

export default function FAQPage() {
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
      <div className="relative ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/faqMascot.svg" alt="FAQ" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">FAQ</h1>
        </div>
        <RegistrationPrompt view="faq" allowMarketing className="mb-6" />
        <ul className="grid gap-3">
          <li className="ch-card ch-card--outlined p-4 rounded-xl">
            <p className="font-qurova ch-text">How many members will each team consist?</p>
            <p className="font-area ch-subtext text-sm mt-1">Teams will be formed with exactly 5 members.</p>
          </li>
          <li className="ch-card ch-card--outlined p-4 rounded-xl">
            <p className="font-qurova ch-text">What if I don&apos;t have a team?</p>
            <p className="font-area ch-subtext text-sm mt-1">You just need to show up at the venue during the opening ceremony and we will find the right team for you.</p>
          </li>
          <li className="ch-card ch-card--outlined p-4 rounded-xl">
            <p className="font-qurova ch-text">Am I allowed to use the internet?</p>
            <p className="font-area ch-subtext text-sm mt-1">Yes, you can use all the resources at your disposal.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
