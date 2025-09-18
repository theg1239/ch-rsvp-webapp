// Central configuration for Guest/Demo Mode mock data.
// Adjust these structures to customize the no-backend experience.

export interface DemoQuestionPartContent {
  id: string;
  content: Array<string | { type?: string; data?: string; text?: string; url?: string }>;
}
export interface DemoQuestion {
  id: string;
  name: string;
  difficulty?: { level?: string };
  parts: DemoQuestionPartContent[];
  answers?: string[];
  points?: number;
}

export interface DemoAnnouncement {
  id: string;
  title: string;
  body?: string;
  created_at?: string;
}

export interface DemoLeaderboardItem { rank: number; team_name: string; points: number }

export const demoStartDate = new Date('2025-09-26T00:00:00.000Z');

export const demoQuestions: DemoQuestion[] = [
  {
    id: 'demo-1',
    name: 'Welcome to Guest Mode',
    difficulty: { level: 'Easy' },
    parts: [
      {
        id: 'p-demo-1',
        content: [
          'This is a demo question running fully client-side. No backend required.',
          'Type DEMO or GUEST as the answer to see a success flow.'
        ],
      },
    ],
    answers: ['DEMO', 'GUEST'],
    points: 10,
  },
  {
    id: 'demo-2',
    name: 'Try the Interface',
    difficulty: { level: 'Easy' },
    parts: [
      {
        id: 'p-demo-2',
        content: [
          'Interact with the UI (open/close, submit answers). Any non-empty answer counts here.',
        ],
      },
    ],
    answers: [], // empty => any non-empty answer is accepted
    points: 5,
  },
];

export const demoAnnouncements: DemoAnnouncement[] = [
  { id: 'a1', title: 'Welcome to Guest Mode', body: 'This is a simulated announcement.', created_at: new Date().toISOString() },
  { id: 'a2', title: 'Event Countdown', body: 'Hunt starts 26 Sept 2025 – stay tuned!', created_at: new Date().toISOString() },
];

export const demoLeaderboard: DemoLeaderboardItem[] = [
  { rank: 1, team_name: 'Alpha', points: 120 },
  { rank: 2, team_name: 'Beta', points: 110 },
  { rank: 3, team_name: 'Gamma', points: 90 },
  { rank: 4, team_name: 'Omega', points: 60 },
];

export function evaluateDemoAnswer(questionId: string, raw: string): { correct: boolean; points: number } {
  const q = demoQuestions.find(q => q.id === questionId);
  if (!q) return { correct: false, points: 0 };
  const normalized = raw.trim().toUpperCase();
  if (!normalized) return { correct: false, points: 0 };
  if (!q.answers || q.answers.length === 0) {
    // Any non-empty answer accepted
    return { correct: true, points: q.points ?? 0 };
  }
  const correct = q.answers.includes(normalized);
  return { correct, points: correct ? (q.points ?? 0) : 0 };
}
