"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", icon: "/Images/NavBar/home.svg" },
  { href: "/team", label: "Team", icon: "/Images/NavBar/add-square.svg" },
  { href: "/profile", label: "Profile", icon: "/Images/NavBar/profile.svg" },
  { href: "/#announcements", label: "Announcements", icon: "/Images/NavBar/note.svg" },
  { href: "/#leaderboard", label: "Leaderboard", icon: "/Images/NavBar/cup.svg" },
  { href: "/#resources", label: "Resources", icon: "/Images/NavBar/resources.svg" },
  { href: "/#faq", label: "FAQ", icon: "/Images/NavBar/FAQ.svg" },
];

import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const pathname = usePathname();
  const { user, initialized } = useAuth();
  if (!initialized || !user) return null;
  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-2xl px-4 py-2 flex items-center gap-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link key={it.href} href={it.href} className="flex flex-col items-center gap-1 px-2 py-1">
              <img src={it.icon} alt={it.label} className="w-5 h-5" />
              <span className="text-[11px]" style={{ color: active ? '#F5753B' : '#ccc' }}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
