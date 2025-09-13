"use client";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import QuestionsIndex from "@/components/pages/QuestionsIndex";
import LeaderboardPage from "@/components/pages/Leaderboard";
import ProfilePage from "@/components/pages/Profile";
import TeamPage from "@/components/pages/Team";
import CheckInPage from "@/components/pages/CheckIn";
import OnboardingPage from "@/components/pages/Onboarding";
import AnnouncementsPage from "@/components/pages/Announcements";
import RulesPage from "@/components/pages/Rules";
import ResourcesPage from "@/components/pages/Resources";
import SponsorsPage from "@/components/pages/Sponsors";
import AboutPage from "@/components/pages/About";
import FAQPage from "@/components/pages/FAQ";
import TimelinePage from "@/components/pages/Timeline";
import ArchivePage from "@/components/pages/Archive";
import ScannerPage from "@/components/pages/Scanner";
import NFCPage from "@/components/pages/NFC";
import HuntingPassPage from "@/components/pages/HuntingPass";
import BlacklistedPage from "@/components/pages/Blacklisted";
import { useAppStore } from "@/store/appStore";

export default function HuntIndex() {
  const { user, initialized } = useAuth();
  const { view, decideFromBackend } = useAppStore();

  useEffect(() => {
    if (!initialized) return;
    if (!user) return;
    void decideFromBackend();
  }, [initialized, user, decideFromBackend]);

  if (!initialized || !user) return <SplashScreen label="Signing you in…" />;

  switch (view) {
    case 'questions': return <QuestionsIndex />;
    case 'leaderboard': return <LeaderboardPage />;
    case 'profile': return <ProfilePage />;
    case 'team': return <TeamPage />;
    case 'checkin': return <CheckInPage />;
    case 'onboarding': return <OnboardingPage />;
    case 'announcements': return <AnnouncementsPage />;
    case 'rules': return <RulesPage />;
    case 'resources': return <ResourcesPage />;
    case 'faq': return <FAQPage />;
    case 'sponsors': return <SponsorsPage />;
    case 'about': return <AboutPage />;
    case 'timeline': return <TimelinePage />;
    case 'archive': return <ArchivePage />;
    case 'scanner': return <ScannerPage />;
    case 'nfc': return <NFCPage />;
    case 'hunting-pass': return <HuntingPassPage />;
    case 'blacklisted': return <BlacklistedPage />;
    default: return <QuestionsIndex />;
  }
}
