"use client";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAppStore } from "../../store/appStore";

// Import existing pages as view components
import SignInPage from "../(auth)/signin/page";
import SignUpPage from "../(auth)/signup/page";
import OnboardingPage from "../onboarding/page";
import CheckInPage from "../checkin/page";
import TeamPage from "../team/page";
import QuestionsPage from "../questions/page";
import ProfilePage from "../profile/page";
import LeaderboardPage from "../leaderboard/page";

export default function SPAContainer() {
  const { user, initialized } = useAuth();
  const { view, setView, decideFromBackend } = useAppStore();

  useEffect(() => {
    if (!initialized) return;
    if (!user) { setView("signin"); return; }
    void decideFromBackend();
  }, [initialized, user, setView, decideFromBackend]);

  // Render based on global state
  switch (view) {
    case "signin": return <SignInPage />;
    case "signup": return <SignUpPage />;
    case "onboarding": return <OnboardingPage />;
    case "team": return <TeamPage />;
    case "checkin": return <CheckInPage />;
    case "questions": return <QuestionsPage />;
    case "profile": return <ProfilePage />;
    case "leaderboard": return <LeaderboardPage />;
    default: return null;
  }
}
