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
    id: 'binarycount',
    name: 'binaryCount',
    difficulty: { level: '1' },
    parts: [
      {
        id: 'p-binarycount-1',
        content: [
          'Amidst the tapestry of existence, numbers emerge as ethereal guides, revealing the cryptic harmony woven into the threads of life\'s grand design.',
          { type: 'FILE', data: '/Numbers.pdf' },
        ],
      },
    ],
    answers: ['2727'],
    points: 20,
  },
  {
    id: 'giffy',
    name: 'giffy',
    difficulty: { level: '2' },
    parts: [
      {
        id: 'p-giffy-1',
        content: [
          'Can you decode a hidden message and find a secret flag in this GIF that might be something more than just a GIF?',
          { type: 'IMAGE', data: '/11zon_created-GIF.gif' },
        ],
      },
    ],
    answers: ['GIFSAREFUN'],
    points: 25,
  },
  {
    id: 'meinfuhrer',
    name: 'meinFuhrer',
    difficulty: { level: '1' },
    parts: [
      {
        id: 'p-meinfuhrer-1',
        content: [
          'Unravel the secrets of forbidden knowledge hidden in the deepest depths. Crack the unbreakable codes and save the world from the clutches of the evil puppet-master lurking in the shadows with the help of an unknown HERO. Who is this person? Can they help you solve the mystery code?',
          { type: 'LINK', data: 'https://i.imgur.com/yQ9JVsf.jpeg' },
        ],
      },
    ],
    answers: ['HELLO WORLD','HELLOWORLD'],
    points: 15,
  },
  {
    id: 'trinitytest',
    name: 'trinityTest',
    difficulty: { level: '1' },
    parts: [
      {
        id: 'p-trinitytest-1',
        content: [
          'In the world of secrets and codes, deciphering a cipher is like defusing a bomb. One wrong move, and all truths explode into the open. Three magic words lead you to the answer you seek.',
          { type: 'LINK', data: 'https://i.imgur.com/BHIZLHi.png' },
        ],
      },
    ],
    answers: ['UNSHAVEN.ASSUMES.SKATING','UNSHAVEN ASSUMES SKATING'],
    points: 30,
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
  const normalize = (s: string) => s.trim().toUpperCase().replace(/\s+/g,'').replace(/\u200B/g,'');
  const normalized = normalize(raw);
  if (!normalized) return { correct: false, points: 0 };
  if (!q.answers || q.answers.length === 0) {
    return { correct: true, points: q.points ?? 0 };
  }
  const variants = new Set(q.answers.map(a => normalize(a)));
  const correct = variants.has(normalized);
  return { correct, points: correct ? (q.points ?? 0) : 0 };
}
