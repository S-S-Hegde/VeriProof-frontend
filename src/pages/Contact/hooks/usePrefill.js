import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";

/**
 * Hook to prefill name and email for authenticated candidates / recruiters,
 * with a quick "Not you?" override mechanism.
 */
export function usePrefill(setFieldValue) {
  const auth = useAuth?.() || {};
  const user = auth.user;

  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [cleared, setCleared] = useState(false);

  const authName = user?.name || user?.displayName || "";
  const authEmail = user?.email || "";

  useEffect(() => {
    if (!cleared && !hasPrefilled && (authName || authEmail)) {
      if (authName && setFieldValue) setFieldValue("name", authName);
      if (authEmail && setFieldValue) setFieldValue("email", authEmail);
      setHasPrefilled(true);
    }
  }, [user, authName, authEmail, cleared, hasPrefilled, setFieldValue]);

  const clearPrefill = () => {
    setCleared(true);
    setHasPrefilled(false);
    if (setFieldValue) {
      setFieldValue("name", "");
      setFieldValue("email", "");
    }
  };

  const isPrefilledActive = !cleared && Boolean(user && (authName || authEmail));

  return {
    isLoggedIn: Boolean(user),
    userName: authName,
    userEmail: authEmail,
    isPrefilledActive,
    clearPrefill,
  };
}

export default usePrefill;
