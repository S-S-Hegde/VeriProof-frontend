import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SaveProjectButton = ({ isSaved, onToggle, busy = false }) => {
  const { user } = useAuth();

  if (user?.role !== "recruiter") {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={busy}
      className={`inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.25em] transition-all ${
        isSaved
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      } ${busy ? "opacity-60" : ""}`}
    >
      {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {isSaved ? "Saved" : "Save"}
    </button>
  );
};

export default SaveProjectButton;
