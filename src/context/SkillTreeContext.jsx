/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const SkillTreeContext = createContext(null);

export const useSkillTree = () => useContext(SkillTreeContext);

export const SkillTreeProvider = ({ children }) => {
  const { user } = useAuth();
  const [skillTree, setSkillTree] = useState(null);
  const [progress, setProgress] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  const refreshSkillTree = useCallback(async ({ quiet = false } = {}) => {
    if (!user) return null;
    try {
      if (!quiet) setLoading(true);
      setError("");
      const { data } = await api.get("/api/skill-tree");
      setSkillTree(data.skillTree);
      setProgress(data.progress);
      setCatalog(data.catalog || []);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Unable to load skill progression";
      setError(message);
      return null;
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [user]);

  const recordSkillEvent = useCallback(async (payload) => {
    const { data } = await api.post("/api/skill-tree/event", payload);
    setSkillTree(data.skillTree);
    setProgress(data.progress);
    return data;
  }, []);

  const userId = user?._id || user?.id || null;

  useEffect(() => {
    if (!userId) {
      setSkillTree(null);
      setProgress(null);
      setCatalog([]);
      return undefined;
    }

    refreshSkillTree();
  }, [userId, refreshSkillTree]);

  const value = useMemo(() => ({
    skillTree,
    progress,
    catalog,
    loading,
    error,
    refreshSkillTree,
    recordSkillEvent,
  }), [skillTree, progress, catalog, loading, error, refreshSkillTree, recordSkillEvent]);

  return (
    <SkillTreeContext.Provider value={value}>
      {children}
    </SkillTreeContext.Provider>
  );
};
