import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

// ---------------------------------------------------------------------------
// Firebase initialisation (singleton safe)
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "veriproof-76123.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Force local persistence so the Firebase session survives page reloads
setPersistence(auth, browserLocalPersistence).catch(() => {});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ---------------------------------------------------------------------------
// Popup-only sign-in — simple, reliable, no redirect complexity
// ---------------------------------------------------------------------------

/**
 * Opens the Google sign-in popup.
 * Returns { user, idToken } on success.
 * Throws a Firebase AuthError on failure — let the caller handle it.
 */
export const signInWithGooglePopup = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  if (!result?.user) throw new Error("No user returned from Google popup.");
  const idToken = await result.user.getIdToken(/* forceRefresh */ true);
  return { user: result.user, idToken };
};

/**
 * Sign out of Firebase so IndexedDB is cleared.
 * Call this whenever the user logs out.
 */
export const firebaseSignOut = async () => {
  try {
    await auth.signOut();
  } catch (_) {
    // silence — we still clear the app session
  }
};

export { app, auth, googleProvider };
