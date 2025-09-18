import dynamic from "next/dynamic";

const RegistrationPrompt = dynamic(() => import("../RegistrationPrompt"), { ssr: false });

export default function ResourcesPage() {
  const items = [
    { href: "https://acmvit.in/", label: "ACM-VIT" },
    { href: "https://firebase.google.com/", label: "Firebase Cloud Messaging" },
    { href: "https://nextjs.org/", label: "Next.js" },
  ];
  return (
    <div className="min-h-dvh ch-bg">
      <div className="ch-container ch-container-narrow py-10 pb-28 safe-bottom">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/resources.svg" alt="Resources" className="w-10 h-10" />
          <h1 className="font-qurova ch-gradient-text ch-h2">Resources</h1>
        </div>
        <RegistrationPrompt view="resources" className="mb-6" />
        <ul className="grid gap-2">
          {items.map((it) => (
            <li key={it.href} className="ch-card ch-card--outlined p-4 rounded-xl">
              <a href={it.href} target="_blank" rel="noreferrer" className="font-qurova ch-text underline">{it.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
