export type DemoState = {
  points: number;
  solved: string[]; // question ids
};

const KEY = 'ch_demo_state_v1';

export function readDemoState(): DemoState {
  if (typeof window === 'undefined') return { points: 0, solved: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { points: 0, solved: [] };
    const parsed = JSON.parse(raw);
    const pts = Number(parsed?.points) || 0;
    const solved = Array.isArray(parsed?.solved) ? parsed.solved.filter((x: any) => typeof x === 'string') : [];
    return { points: pts, solved };
  } catch {
    return { points: 0, solved: [] };
  }
}

export function writeDemoState(next: DemoState) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
}

export function addDemoSolve(questionId: string, points: number) {
  const cur = readDemoState();
  if (!cur.solved.includes(questionId)) {
    cur.solved.push(questionId);
    cur.points = (cur.points || 0) + Math.max(0, Number(points) || 0);
    writeDemoState(cur);
    try { window.dispatchEvent(new CustomEvent('ch-demo-progress', { detail: { type: 'solve', questionId, points: cur.points } })); } catch {}
  }
  return cur;
}

export function resetDemoProgress() {
  writeDemoState({ points: 0, solved: [] });
  try { window.dispatchEvent(new CustomEvent('ch-demo-progress', { detail: { type: 'reset' } })); } catch {}
}