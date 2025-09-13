export default function FAQPage() {
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/faqMascot.svg" alt="FAQ" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">FAQ</h1>
        </div>
        <ul className="grid gap-3">
          <li className="ch-card ch-card--outlined p-4 rounded-xl">
            <p className="font-qurova ch-text">What is Cryptic Hunt?</p>
            <p className="font-area ch-subtext text-sm mt-1">A team-based puzzle adventure hosted by ACM-VIT.
            Solve multi-part questions across thematic phases with your squad.</p>
          </li>
          <li className="ch-card ch-card--outlined p-4 rounded-xl">
            <p className="font-qurova ch-text">How many members per team?</p>
            <p className="font-area ch-subtext text-sm mt-1">Follow the limits declared for the year; typically 3–5.</p>
          </li>
          <li className="ch-card ch-card--outlined p-4 rounded-xl">
            <p className="font-qurova ch-text">How do notifications work?</p>
            <p className="font-area ch-subtext text-sm mt-1">Enable push in your browser; we use Firebase Cloud Messaging
            to route you when phases start and responses land.</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

