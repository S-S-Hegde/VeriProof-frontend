import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "veriproof-76123.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Ensure session persists across page reloads (default is local, but be explicit)
setPersistence(auth, browserLocalPersistence).catch(() => {});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * POPUP sign-in. Returns { user, idToken } on success.
 * Throws on error — caller handles errors.
 */
export const signInWithGooglePopup = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  if (!result?.user) throw new Error("No user returned from Google popup.");
  const idToken = await result.user.getIdToken(true);
  return { user: result.user, idToken };
};

/**
 * Start a full-page redirect sign-in.
 * Stores role/inviteCode in localStorage so we can read it back after redirect.
 */
export const signInWithGoogleRedirect = async (role = "student", inviteCode = "") => {
  // Stamp exactly what we need so the returning page can recover it
  localStorage.setItem(
    "veriproof_auth_pending",
    JSON.stringify({ role, inviteCode, timestamp: Date.now() })
  );
  await signInWithRedirect(auth, googleProvider);
  // Page navigates away — nothing executes after this
};

/**
 * Call this on app mount ONLY when veriproof_auth_pending exists in localStorage.
 * Waits for Firebase to resolve the redirect result, with a generous timeout.
 * Returns { user, idToken } or null.
 *
 * Strategy:
 * 1. Try getRedirectResult() — works when Firebase restores state synchronously
 * 2. Wait up to 8s on onAuthStateChanged — handles async IndexedDB hydration
 */
export const resolveRedirectResult = async () => {
  try {
    // Attempt 1: getRedirectResult (synchronous if Firebase state already restored)
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const idToken = await result.user.getIdToken(true);
      return { user: result.user, idToken };
    }

    // Attempt 2: Wait for onAuthStateChanged — Firebase may still be reading IndexedDB
    const user = await new Promise((resolve) => {
      let settled = false;

      // Check if already available
      if (auth.currentUser) {
        resolve(auth.currentUser);
        return;
      }

      const unsub = onAuthStateChanged(auth, (u) => {
        if (!settled) {
          settled = true;
          unsub();
          resolve(u);
        }
      });

      // 8 second timeout — more than enough for IndexedDB hydration
      setTimeout(() => {
        if (!settled) {
          settled = true;
          unsub();
          resolve(null);
        }
      }, 8000);
    });

    if (user) {
      const idToken = await user.getIdToken(true);
      return { user, idToken };
    }

    return null;
  } catch (error) {
    console.error("[Firebase resolveRedirectResult error]:", error);
    return null;
  }
};

/**
 * Sign out from Firebase (call this on app logout so IndexedDB is cleared).
 */
export const firebaseSignOut = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    // silence
  }
};

export { app, auth, googleProvider };
