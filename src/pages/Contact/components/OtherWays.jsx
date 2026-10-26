import React from "react";
import { contactConfig } from "../contact.config";
import { contactCopy } from "../copy";
import { CopyEmail } from "./CopyEmail";

/**
 * Plain typography section for alternative communication routes.
 * Renders config items ONLY when they have a non-empty value.
 * Strictly adheres to honesty rules: no cards, no fake stats, no fake guarantees.
 */
export function OtherWays({ onSelectSecurityTopic }) {
  const { email, securityEmail, responseTime, officeHours, pgp } = contactConfig;

  return (
    <section
      aria-labelledby="other-ways-heading"
      className="mt-12 pt-8 border-t border-[#0a0f24]/10 dark:border-white/10 space-y-6 text-[#0a0f24] dark:text-slate-200"
    >
      <h2
        id="other-ways-heading"
        className="text-xs font-mono uppercase tracking-widest text-[#0a0f24]/50 dark:text-slate-400"
      >
        {contactCopy.otherWays.heading}
      </h2>

      <div className="space-y-5">
        {/* Primary official email */}
        {email && (
          <CopyEmail
            email={email}
            label={contactCopy.otherWays.emailLabel}
          />
        )}

        {/* Distinct security disclosure channel */}
        {securityEmail && (
          <div className="pt-2">
            <span className="block text-xs uppercase tracking-wider font-mono text-[#0a0f24]/60 dark:text-slate-400 mb-1">
              {contactCopy.otherWays.securityEmailLabel}
            </span>
            <div className="flex flex-wrap items-baseline gap-2">
              <a
                href={`mailto:${securityEmail}`}
                className="text-sm font-mono text-[#0a0f24] dark:text-slate-200 hover:text-[#00d4ff] underline decoration-[#0a0f24]/20 dark:decoration-white/20 underline-offset-4 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
              >
                {securityEmail}
              </a>
              <span className="text-xs text-[#0a0f24]/40 dark:text-slate-500 font-mono">
                or select
              </span>
              <button
                type="button"
                onClick={onSelectSecurityTopic}
                className="text-xs font-mono text-[#00d4ff] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00d4ff] px-1 py-0.5 rounded"
              >
                Security issue on the tag →
              </button>
            </div>
          </div>
        )}

        {/* Optional office hours — rendered ONLY if present */}
        {officeHours && (
          <div className="pt-1">
            <span className="block text-xs uppercase tracking-wider font-mono text-[#0a0f24]/60 dark:text-slate-400 mb-0.5">
              {contactCopy.otherWays.officeHoursLabel}
            </span>
            <p className="text-sm font-sans text-[#0a0f24]/80 dark:text-slate-300">
              {officeHours}
            </p>
          </div>
        )}

        {/* Optional response time — rendered ONLY if present */}
        {responseTime && (
          <div className="pt-1">
            <span className="block text-xs uppercase tracking-wider font-mono text-[#0a0f24]/60 dark:text-slate-400 mb-0.5">
              {contactCopy.otherWays.responseTimeLabel}
            </span>
            <p className="text-sm font-sans text-[#0a0f24]/80 dark:text-slate-300">
              {responseTime}
            </p>
          </div>
        )}

        {/* Optional PGP fingerprint — rendered ONLY if present */}
        {pgp && (
          <div className="pt-1">
            <span className="block text-xs uppercase tracking-wider font-mono text-[#0a0f24]/60 dark:text-slate-400 mb-0.5">
              {contactCopy.otherWays.pgpLabel}
            </span>
            <code className="text-xs font-mono text-[#0a0f24]/70 dark:text-slate-400 break-all select-all">
              {pgp}
            </code>
          </div>
        )}
      </div>
    </section>
  );
}

export default OtherWays;
