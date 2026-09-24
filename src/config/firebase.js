import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
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

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Try popup first. If popup is blocked, fall back to full-page redirect.
 * Returns { user, idToken } on popup success, or null if redirect was initiated.
 */
export const signInWithGoogle = async (role = "student", inviteCode = "") => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (!result?.user) throw new Error("No user returned from Google.");
    const idToken = await result.user.getIdToken(true);
    return { user: result.user, idToken };
  } catch (error) {
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      // Fall back to full-page redirect — browser will return to same URL
      localStorage.setItem(
        "veriproof_auth_pending",
        JSON.stringify({ role, inviteCode, timestamp: Date.now() })
      );
      await signInWithRedirect(auth, googleProvider);
      return null; // page navigates away
    }
    throw error;
  }
};

/**
 * Explicitly start a full-page redirect (used when popup is explicitly not wanted).
 */
export const signInWithGoogleRedirect = async (role = "student", inviteCode = "") => {
  localStorage.setItem(
    "veriproof_auth_pending",
    JSON.stringify({ role, inviteCode, timestamp: Date.now() })
  );
  await signInWithRedirect(auth, googleProvider);
};

/**
 * Check if Google returned a redirect result on the current page load.
 * Returns { user, idToken } or null.
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const idToken = await result.user.getIdToken(true);
      return { user: result.user, idToken };
    }

    // Also check already-signed-in user (Firebase restores from persistence)
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      return { user: auth.currentUser, idToken };
    }

    // Wait briefly for onAuthStateChanged hydration
    const user = await new Promise((resolve) => {
      let done = false;
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u && !done) {
          done = true;
          unsub();
          resolve(u);
        }
      });
      setTimeout(() => {
        if (!done) {
          done = true;
          unsub();
          resolve(null);
        }
      }, 3000);
    });

    if (user) {
      const idToken = await user.getIdToken(true);
      return { user, idToken };
    }

    return null;
  } catch (error) {
    console.error("[Firebase handleRedirectResult error]:", error);
    throw error;
  }
};

export { app, auth, googleProvider };
