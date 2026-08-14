import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

const requiredVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingVars = requiredVars.filter((varName) => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.warn(
    `[Firebase Config Warning] Missing Firebase environment variables: ${missingVars.join(", ")}`
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Perform mandatory Google OAuth login via Firebase popup with automatic redirect fallback.
 * If the browser blocks the popup, it gracefully falls back to signInWithRedirect.
 */
export const signInWithGoogle = async (role = "student", inviteCode = "") => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return {
      user: result.user,
      idToken,
    };
  } catch (error) {
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.warn(
        `[Firebase OAuth] Popup blocked/closed (${error.code}). Falling back to signInWithRedirect...`
      );
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "veriproof_auth_pending",
          JSON.stringify({ role, inviteCode })
        );
      }
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    console.error("[Firebase OAuth] Google Sign-In error:", error);
    throw error;
  }
};

/**
 * Handle redirect result when user returns from Google OAuth redirect.
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const idToken = await result.user.getIdToken();
      return {
        user: result.user,
        idToken,
      };
    }
    return null;
  } catch (error) {
    console.error("[Firebase OAuth Redirect Error]:", error);
    throw error;
  }
};

export { app, auth, googleProvider };
