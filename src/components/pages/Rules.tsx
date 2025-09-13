export default function RulesPage() {
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/rulesPageMascot.svg" alt="Rules" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">Rules</h1>
        </div>
        <ol className="grid gap-3 list-decimal ml-5">
          <li className="font-area ch-subtext">Respect other teams and event staff.</li>
          <li className="font-area ch-subtext">No sharing of answers across teams.</li>
          <li className="font-area ch-subtext">Follow on‑site instructions and time limits.</li>
          <li className="font-area ch-subtext">Use of hints may reduce points; decide wisely.</li>
        </ol>
      </div>
    </div>
  );
}

