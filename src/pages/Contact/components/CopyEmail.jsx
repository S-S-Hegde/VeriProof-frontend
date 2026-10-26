import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { contactCopy } from "../copy";

/**
 * Plain typography email display with accessible clipboard copy action
 * and unambiguous feedback.
 */
export function CopyEmail({ email, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = email;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs uppercase tracking-wider font-mono text-[#0a0f24]/60 dark:text-slate-400">
          {label}
        </span>
      )}
      <div className="flex items-center gap-3">
        <a
          href={`mailto:${email}`}
          className="text-base sm:text-lg font-mono text-[#0a0f24] dark:text-slate-100 hover:text-[#00d4ff] dark:hover:text-[#00d4ff] transition-colors underline decoration-[#0a0f24]/20 dark:decoration-white/20 underline-offset-4 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
        >
          {email}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={contactCopy.otherWays.copyAria}
          className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono rounded border border-[#0a0f24]/20 dark:border-white/15 bg-transparent hover:bg-[#0a0f24]/5 dark:hover:bg-white/5 text-[#0a0f24] dark:text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {contactCopy.otherWays.copySuccess}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 opacity-70" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Screen reader announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? contactCopy.otherWays.copySuccess : ""}
      </span>
    </div>
  );
}

export default CopyEmail;
