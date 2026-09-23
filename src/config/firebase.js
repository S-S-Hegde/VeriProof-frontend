import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
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

// Compute authDomain dynamically:
// On deployed production (Vercel / custom domain), /__/auth/* is reverse-proxied to firebaseapp.com.
// Setting authDomain to the current host makes the redirect handler and iframe same-origin,
// which prevents modern browsers from blocking credentials via third-party cookie/storage partitioning.
const getAuthDomain = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }
  return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "veriproof-76123.firebaseapp.com";
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: getAuthDomain(),
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
 * Clean helper to check popup preference or support.
 */
export const testPopupPermission = () => {
  if (typeof window === "undefined") return { allowed: false, reason: "No window object" };
  return { allowed: true };
};

/**
 * Perform mandatory Google OAuth login via Firebase popup.
 * Keeps React single-page app alive in memory to immediately dispatch token to backend.
 */
export const signInWithGoogle = async () => {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error(
      "Firebase environment variables are missing. Please configure VITE_FIREBASE_* in your Vercel Project Settings."
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (!result || !result.user) {
      throw new Error("No user returned from Google Authentication.");
    }

    const idToken = await result.user.getIdToken(true);
    return {
      user: result.user,
      idToken,
    };
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      const customErr = new Error(
        "Popup was blocked by your browser. Please allow popups for this site to sign in with Google."
      );
      customErr.code = error.code;
      customErr.isPopupBlocked = true;
      throw customErr;
    }

    if (error.code === "auth/popup-closed-by-user") {
      const customErr = new Error("Google Sign-In was closed before completing.");
      customErr.code = error.code;
      throw customErr;
    }

    if (error.code === "auth/cancelled-popup-request") {
      const customErr = new Error("Google Sign-In request was cancelled.");
      customErr.code = error.code;
      throw customErr;
    }

    if (error.code === "auth/unauthorized-domain") {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "your domain";
      const customErr = new Error(
        `Domain '${currentHost}' is not authorized in Firebase. Add '${currentHost}' to Firebase Console -> Authentication -> Settings -> Authorized Domains.`
      );
      customErr.code = error.code;
      console.error("[Firebase OAuth] Unauthorized domain error:", customErr.message);
      throw customErr;
    }

    console.error("[Firebase OAuth] Google Sign-In error:", error);
    throw error;
  }
};

/**
 * Perform Google OAuth login via full-page redirect.
 */
export const signInWithGoogleRedirect = async (role = "student", inviteCode = "") => {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error(
      "Firebase environment variables are missing. Please configure VITE_FIREBASE_* in your Vercel Project Settings."
    );
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(
      "veriproof_auth_pending",
      JSON.stringify({ role, inviteCode, timestamp: Date.now() })
    );
  }

  await signInWithRedirect(auth, googleProvider);
};

/**
 * Handle redirect result when user returns from Google OAuth redirect.
 * Uses a 3-tier resolution strategy:
 * 1. Native getRedirectResult
 * 2. auth.currentUser (if already restored in memory)
 * 3. onAuthStateChanged listener with timeout (if persistence restoration takes a moment)
 */
export const handleRedirectResult = async () => {
  try {
    // 1. Check getRedirectResult
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const idToken = await result.user.getIdToken(true);
      return {
        user: result.user,
        idToken,
      };
    }

    // 2. Check if auth.currentUser is already present
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      return {
        user: auth.currentUser,
        idToken,
      };
    }

    // 3. Fallback: wait for onAuthStateChanged in case persistence takes a moment
    const userFromStateChange = await new Promise((resolve) => {
      let resolved = false;
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && !resolved) {
          resolved = true;
          unsubscribe();
          resolve(user);
        }
      });
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsubscribe();
          resolve(null);
        }
      }, 3500);
    });

    if (userFromStateChange) {
      const idToken = await userFromStateChange.getIdToken(true);
      return {
        user: userFromStateChange,
        idToken,
      };
    }

    return null;
  } catch (error) {
    if (error.code === "auth/unauthorized-domain") {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "your domain";
      const customErr = new Error(
        `Domain '${currentHost}' is not authorized in Firebase. Add '${currentHost}' to Firebase Console -> Authentication -> Settings -> Authorized Domains.`
      );
      customErr.code = error.code;
      console.error("[Firebase OAuth Redirect Error]:", customErr.message);
      throw customErr;
    }
    console.error("[Firebase OAuth Redirect Error]:", error);
    throw error;
  }
};

export { app, auth, googleProvider };
