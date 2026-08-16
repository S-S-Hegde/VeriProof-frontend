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
