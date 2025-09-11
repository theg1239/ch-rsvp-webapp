import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";

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
