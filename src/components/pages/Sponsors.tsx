export default function SponsorsPage() {
  const sponsors = [
    { name: 'IBM', logo: '/images/ibm.svg' },
    { name: 'GitHub', logo: '/images/github.svg' },
  ];
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <h1 className="font-qurova ch-gradient-text ch-h2 mb-6">Sponsors</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {sponsors.map(s => (
            <div key={s.name} className="rounded-xl ch-card ch-card--outlined p-4 flex items-center justify-center">
              <img src={s.logo} alt={s.name} className="max-h-10 w-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

