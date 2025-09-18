"use client";
import HuntNav from "@/components/HuntNav";

export default function HuntLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      {children}
      <HuntNav />
    </div>
  );
}

