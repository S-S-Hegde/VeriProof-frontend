import React from "react";
import PageTransition from "../components/PageTransition";
import { HelpCircle } from "lucide-react";

const Support = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto vp-surface-1 p-12 text-center border border-[var(--color-border)] mt-12">
        <h2 className="text-4xl font-serif text-[var(--color-text)] font-light tracking-wider uppercase mb-6">
          Platform{" "}
          <span className="text-[var(--color-accent)] italic lowercase normal-case">
            Support
          </span>
        </h2>
        <p className="text-[var(--color-muted)] tracking-widest uppercase text-sm mb-8">
          Frequently asked questions, guides, and direct support lines.
        </p>
        <div className="text-[var(--color-text)] text-lg font-light tracking-wide lg:p-12 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg-sunken)]/50">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[var(--color-accent)] opacity-60" />
          Loading Knowledge Base...
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;
