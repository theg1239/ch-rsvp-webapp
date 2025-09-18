"use client";
import Image from "next/image";

type Props = {
  phase?: number | string;
  title?: string;
  subtitle?: string;
  accent?: string; // hex color for border/text accents
};

export default function PhaseHeader({ phase, title, subtitle, accent = "#F5753B" }: Props) {
  return (
    <div className="relative w-full rounded-2xl ch-card ch-card--outlined p-4 overflow-hidden" style={{ borderColor: "rgba(255,255,255,.08)" }}>
      <div className="absolute -right-2 -bottom-2 opacity-40 select-none pointer-events-none">
        <Image src="/images/PhaseHeader/pintoo.svg" alt="pintoo" width={160} height={160} />
      </div>
      <div className="relative flex items-center gap-4">
        <div className="rounded-xl px-3 py-2 font-qurova" style={{ border: `1px solid ${accent}`, color: accent }}>
          Phase {phase ?? "—"}
        </div>
        <div className="min-w-0">
          <p className="font-qurova ch-text ch-h3 leading-tight">{title || "Cryptic Hunt"}</p>
          {subtitle && <p className="font-area ch-subtext text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

