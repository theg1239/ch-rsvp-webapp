import { getIdToken } from "../lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ch.acm.today";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
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
