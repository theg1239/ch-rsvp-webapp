import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getMessaging, isSupported, onMessage, getToken as getFcmToken } from "firebase/messaging";

export type FirebaseBundle = {
  app: ReturnType<typeof getApp>;
  auth: Auth;
};

let bundle: FirebaseBundle | null = null;

export function initFirebase(): FirebaseBundle {
  if (bundle) return bundle;

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  } as const;

  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  // Ensure session persists across refresh
  void setPersistence(auth, browserLocalPersistence).catch(() => {});
  bundle = { app, auth };
  return bundle;
}

export async function setupMessaging(onRefresh: () => void, onEvent?: (data: Record<string, string>) => void): Promise<void> {
  const supported = await isSupported().catch(()=>false);
  if (!supported) return;
  const { app } = initFirebase();
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/,'') || '';
  async function postWithAuthRetry(path: string, body: unknown): Promise<void> {
    try {
      const idToken = await getIdToken();
      const doPost = async (tokenOrNull: string | null) => fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(tokenOrNull ? { Authorization: `Bearer ${tokenOrNull}` } : {}) },
        body: JSON.stringify(body),
      });
      let res = await doPost(idToken);
      if (res.status === 401 || res.status === 403) {
        const fresh = await getIdToken(true);
        res = await doPost(fresh);
      }
    } catch { /* ignore */ }
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
    const messaging = getMessaging(app);
    const token = await getFcmToken(messaging, vapidKey ? { vapidKey } : undefined).catch(()=>null);
    if (token) {
      try { await postWithAuthRetry('/fcm/tokens/register', { token }); try { window.localStorage.setItem('fcm_token', token); } catch {} } catch {}
    }
    onMessage(messaging, (payload) => {
      const data = (payload && (payload.data || {})) as Record<string, string>;
      try { onEvent && onEvent(data); } catch {}
      const action = (data?.action || '').toLowerCase();
      const target = (data?.target || '').toLowerCase();
      if (action === 'refresh' && (target === '' || target.includes('main'))) {
        onRefresh();
      }
    });
  } catch {}
}

export async function signInWithGooglePopup(): Promise<User> {
  const { auth } = initFirebase();
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const { auth } = initFirebase();
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken(forceRefresh);
}

export async function signOutFirebase(): Promise<void> {
  const { auth } = initFirebase();
  await signOut(auth);
}

export function onAuth(cb: (user: User | null) => void) {
  const { auth } = initFirebase();
  return onAuthStateChanged(auth, cb);
}
