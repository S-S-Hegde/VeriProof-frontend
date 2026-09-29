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

// Force local persistence so the Firebase session survives across tabs and reloads
setPersistence(auth, browserLocalPersistence).catch(() => {});

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ---------------------------------------------------------------------------
// Auth Methods: Popup with automated Redirect fallback
// ---------------------------------------------------------------------------

/**
 * Opens Google Sign-In popup.
 * Returns { user, idToken } on success.
 * Throws Firebase error if blocked or cancelled.
 */
export const signInWithGooglePopup = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  if (!result?.user) throw new Error("No user returned from Google popup.");
  const idToken = await result.user.getIdToken(/* forceRefresh */ true);
  return { user: result.user, idToken };
};

/**
 * Starts full-page redirect sign-in.
 * Used when popups are blocked by browser policy without requiring user configuration.
 */
export const signInWithGoogleRedirect = async (role = "student", inviteCode = "") => {
  localStorage.setItem(
    "veriproof_auth_pending",
    JSON.stringify({ role, inviteCode, timestamp: Date.now() })
  );
  await signInWithRedirect(auth, googleProvider);
};

/**
 * Resolves redirect result when returning from Google.
 * Attempts getRedirectResult first, followed by currentUser and onAuthStateChanged hydration.
 */
export const resolveRedirectResult = async () => {
  try {
    // 1. First attempt: standard getRedirectResult
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        const idToken = await result.user.getIdToken(true);
        return { user: result.user, idToken };
      }
    } catch (e) {
      console.warn("[Firebase] getRedirectResult note:", e?.message);
    }

    // 2. Check if auth.currentUser is already populated
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(true);
      return { user: auth.currentUser, idToken };
    }

    // 3. Wait on onAuthStateChanged up to 6 seconds for IndexedDB hydration
    const user = await new Promise((resolve) => {
      let resolved = false;
      const unsub = onAuthStateChanged(auth, (u) => {
        if (!resolved && u) {
          resolved = true;
          unsub();
          resolve(u);
        }
      });
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          unsub();
          resolve(null);
        }
      }, 6000);
    });

    if (user) {
      const idToken = await user.getIdToken(true);
      return { user, idToken };
    }

    return null;
  } catch (err) {
    console.error("[Firebase resolveRedirectResult error]:", err);
    return null;
  }
};

/**
 * Sign out of Firebase so IndexedDB and cached auth states are cleared.
 */
export const firebaseSignOut = async () => {
  try {
    await auth.signOut();
  } catch (_) {}
};

export { app, auth, googleProvider };
