import { getIdToken } from "../lib/firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ch.acm.today";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    const token = await getIdToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });
  let text = await res.text();
  let data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = (data?.message || res.statusText || "").toString();
    const msgLow = message.toLowerCase();
    // Retry once with a fresh token if auth header was missing/expired
    if (options.auth && (res.status === 401 || msgLow.includes("authorization") || msgLow.includes("unauthorized"))) {
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Content-Type", "application/json");
      const fresh = await getIdToken(true);
      if (fresh) retryHeaders.set("Authorization", `Bearer ${fresh}`);
      res = await fetch(url, { ...options, headers: retryHeaders });
      text = await res.text();
      data = text ? JSON.parse(text) : {};
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
