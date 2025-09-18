import { getIdToken } from "../lib/firebase";
import { demoQuestions, demoAnnouncements, demoLeaderboard, evaluateDemoAnswer } from "./demoConfig";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ch.acm.today";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const GUEST_MODE = (process.env.NEXT_PUBLIC_GUEST_MODE === '1') || (process.env.GUEST_MODE === '1');

function guestDelay(ms = 150) { return new Promise((r) => setTimeout(r, ms)); }
const transparentPngB64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
// (legacy removed) inline guestQuestions/parts now provided via demoConfig

async function guestRequest<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const p = path.replace(/\?.*$/, '');
  await guestDelay();
  // /api/main
  if (method === 'GET' && p === '/api/main') {
    return {
      status: 'success',
      message: 'PHASE_ACTIVE',
      data: {
        active_phase: 1,
        current_phase_time: new Date().toISOString(),
        next_phase_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        questions: demoQuestions.map(q => ({ id: q.id, name: q.name, difficulty: q.difficulty })),
        solved_questions: [],
      },
    } as any as T;
  }
  // Profile
  if (method === 'GET' && p === '/api/profile/') {
    return {
      status: 'success',
      message: 'OK',
      data: {
        user: { id: 'guest', name: 'Guest', email: 'guest@example.com', team: { id: 'guest-team', name: 'Guest Team', code: 'GUEST', users: [{ name: 'Guest', email: 'guest@example.com' }] } },
        team_members: ['Guest'],
        correct_responses_count: 0,
        team_rank: 0,
        points: 0,
      },
    } as any as T;
  }
  // QR code
  if (method === 'GET' && p === '/api/team/user/qr') {
    return { status: 'success', message: 'OK', data: transparentPngB64 } as any as T;
  }
  // Leaderboard
  if (method === 'GET' && p === '/api/leaderboard/team') {
    return {
      status: 'success',
      message: 'OK',
      data: {
        team_ranking: demoLeaderboard,
        user_team: { rank: 999, team_name: 'GUEST TEAM', points: 0 },
      },
    } as any as T;
  }
  // Question detail
  const qMatch = /^\/api\/questions\/(.+)$/.exec(p);
  if (method === 'GET' && qMatch) {
    const qid = qMatch[1];
    const q = demoQuestions.find(q => q.id === qid) || demoQuestions[0];
    const d = {
      question_name: q.name,
      question_parts_count: q.parts.length,
      difficulty: q.difficulty?.level || 'EASY',
      question_parts: q.parts.map(part => ({ id: part.id, content: part.content })),
    };
    return { status: 'success', message: 'OK', data: d } as any as T;
  }
  // Announcements
  if (method === 'GET' && p === '/api/app/announcements/') {
    return { status: 'success', message: 'OK', data: demoAnnouncements } as any as T;
  }
  // Submit response
  if (method === 'POST' && p === '/api/response/') {
    const body: any = (() => { try { return JSON.parse(String((options as any).body || '{}')); } catch { return {}; } })();
    const partId: string = typeof body?.question_part_id === 'string' ? body.question_part_id : '';
    const inferredQ = demoQuestions.find(q => q.parts.some(pt => pt.id === partId)) || demoQuestions[0];
    const { correct, points } = evaluateDemoAnswer(inferredQ.id, String(body?.data || ''));
    return { status: 'success', message: correct ? 'Correct' : 'Incorrect', data: { response: { is_correct: correct }, points } } as any as T;
  }
  // Team create/join/leave no-ops
  if (method === 'POST' && (p === '/api/user/team/create' || p === '/api/user/team/join' || p === '/api/profile/leave_team')) {
    return { status: 'success', message: 'OK', data: {} } as any as T;
  }
  // Fallback
  return { status: 'success', message: 'OK', data: {} } as any as T;
}

async function request<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  if (GUEST_MODE) {
    return guestRequest<T>(path, options);
  }
  const url = path.startsWith("http") ? path : `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    let token = await getIdToken();
    if (!token) {
      const start = Date.now();
      const maxWait = 1200; // ms
      while (!token && Date.now() - start < maxWait) {
        await new Promise((r) => setTimeout(r, 150));
        token = await getIdToken();
      }
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });
  let text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : {}; }
  catch { data = { message: text || "" }; }
  if (!res.ok) {
    const message = (data?.message || res.statusText || "").toString();
    const msgLow = message.toLowerCase();
    // Retry once with a fresh token if auth header was missing/expired
    const looksAuthError =
      msgLow.includes("authorization") ||
      msgLow.includes("unauthorized") ||
      msgLow.includes("unauth") ||
      msgLow.includes("forbidden") ||
      msgLow.includes("token") ||
      msgLow.includes("expired") ||
      msgLow.includes("jwt");
    if (options.auth && (res.status === 401 || res.status === 403 || looksAuthError)) {
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Content-Type", "application/json");
      const fresh = await getIdToken(true);
      if (fresh) retryHeaders.set("Authorization", `Bearer ${fresh}`);
      res = await fetch(url, { ...options, headers: retryHeaders });
      text = await res.text();
      try { data = text ? JSON.parse(text) : {}; }
      catch { data = { message: text || "" }; }
      if (!res.ok) {
        const message2 = data?.message || res.statusText;
        throw new Error(message2);
      }
      return data as T;
    }
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = true) => request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}), auth }),
};

export default api;
