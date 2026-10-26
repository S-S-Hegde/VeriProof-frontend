import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { contactCopy } from "./copy";
import { contactConfig } from "./contact.config";
import { useFormState } from "./hooks/useFormState";
import { usePrefill } from "./hooks/usePrefill";
import { useContactReducedMotion } from "./hooks/useReducedMotion";
import { Ruler } from "./components/Ruler";
import { OtherWays } from "./components/OtherWays";
import { IntakeTag } from "./components/IntakeTag";

/**
 * Redesigned VeriProof Contact Experience
 * Concept: "The Intake Tag" — physical evidence tag filing workflow
 */
export default function ContactPage() {
  const { isDarkMode } = useTheme();
  const formState = useFormState();
  const prefillState = usePrefill(formState.setFieldValue);
  const prefersReduced = useContactReducedMotion();

  const { status, values, activeField, submissionMeta, resetForm, setFieldValue } =
    formState;

  const isSuccess = status === "success";

  // Calculate form completion progress for mobile indicator (0 to 1)
  const formProgress = useMemo(() => {
    let score = 0;
    if (values.name.trim()) score += 0.25;
    if (values.email.trim()) score += 0.25;
    if (values.topic) score += 0.25;
    if (values.message.trim().length >= 10) score += 0.25;
    return score;
  }, [values]);

  const handleSelectSecurityTopic = () => {
    setFieldValue("topic", "security");
    // Scroll smoothly to tag if on mobile
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const tagElement = document.getElementById("intake-tag-section");
      tagElement?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main
      className={`relative min-h-screen transition-colors duration-300 overflow-x-hidden ${
        isDarkMode
          ? "bg-[#050816] text-[#e9eef5]"
          : "bg-[#f4f7fb] text-[#0a0f24]"
      }`}
    >
      {/* Decorative vertical ruler on desktop / top line on mobile */}
      <Ruler activeField={activeField} progress={formProgress} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-24 sm:pt-28 sm:pb-32">
        {/* Asymmetric 55/45 grid on desktop, single column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* ─── LEFT COLUMN (55%, Sticky on desktop) ─── */}
          <div className="lg:col-span-7 lg:sticky lg:top-28 lg:self-start lg:pr-6 z-10">
            {/* The single bracket-style mono label on the entire page */}
            <div className="mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#0a0f24]/60 dark:text-slate-400">
                {contactCopy.eyebrow}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                /* Standard Narrative View */
                <motion.div
                  key="narrative-form"
                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Oversized Headline with line-rising mask animation */}
                  <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black italic tracking-tight uppercase leading-[0.95] mb-6">
                    <span className="block overflow-hidden">
                      <motion.span
                        className="block"
                        initial={
                          prefersReduced
                            ? { y: 0 }
                            : { y: "100%", opacity: 0 }
                        }
                        animate={{ y: "0%", opacity: 1 }}
                        transition={{
                          duration: 0.7,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {contactCopy.headline.line1}
                      </motion.span>
                    </span>
                    <span className="block overflow-hidden mt-1">
                      <motion.span
                        className="block"
                        initial={
                          prefersReduced
                            ? { y: 0 }
                            : { y: "100%", opacity: 0 }
                        }
                        animate={{ y: "0%", opacity: 1 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        Bring{" "}
                        <span className="bg-gradient-to-r from-[#00d4ff] to-[#6366f1] bg-clip-text text-transparent">
                          receipts.
                        </span>
                      </motion.span>
                    </span>
                  </h1>

                  {/* Intro text */}
                  <p className="text-base sm:text-lg font-sans text-[#0a0f24]/80 dark:text-slate-300 leading-relaxed max-w-xl">
                    {contactCopy.intro}
                  </p>

                  {/* Plain typography alternative routes (hidden on mobile until below tag) */}
                  <div className="hidden lg:block">
                    <OtherWays onSelectSecurityTopic={handleSelectSecurityTopic} />
                  </div>
                </motion.div>
              ) : (
                /* Success View */
                <motion.div
                  key="narrative-success"
                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6 max-w-xl"
                >
                  <h1 className="text-4xl sm:text-5xl font-black italic tracking-tight leading-tight">
                    {contactCopy.success.heading(submissionMeta?.firstName)}
                  </h1>

                  <p className="text-lg font-sans text-[#0a0f24]/80 dark:text-slate-300 leading-relaxed">
                    {contactCopy.success.body}
                  </p>

                  {/* Optional response time rendered ONLY if config has it */}
                  {contactConfig.responseTime && (
                    <p className="text-sm font-mono text-[#00d4ff] dark:text-[#00d4ff]">
                      {contactCopy.success.responseTime(
                        contactConfig.responseTime
                      )}
                    </p>
                  )}

                  {/* Submission Receipt Details */}
                  <div className="p-5 border border-[#0a0f24]/15 dark:border-white/10 rounded-sm font-mono text-xs space-y-2 bg-[#0a0f24]/[0.02] dark:bg-white/[0.02]">
                    <div className="flex justify-between items-baseline text-[#0a0f24]/50 dark:text-slate-400">
                      <span>FILED AS</span>
                      <strong className="text-[#0a0f24] dark:text-slate-200 font-bold">
                        {submissionMeta?.refId || "LOGGED"}
                      </strong>
                    </div>
                    <div className="flex justify-between items-baseline text-[#0a0f24]/50 dark:text-slate-400">
                      <span>TIMESTAMP</span>
                      <span className="text-[#0a0f24] dark:text-slate-200">
                        {submissionMeta?.submittedAt}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[#0a0f24]/50 dark:text-slate-400">
                      <span>CATEGORY</span>
                      <span className="uppercase text-[#0a0f24] dark:text-slate-200">
                        {submissionMeta?.topic}
                      </span>
                    </div>
                  </div>

                  {/* Success Actions */}
                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-bold bg-[#00d4ff] text-[#050816] rounded-sm hover:bg-[#38bdf8] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00d4ff]"
                    >
                      {contactCopy.success.buttons.newTag}
                    </button>
                    <Link
                      to="/"
                      className="px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-medium border border-[#0a0f24]/20 dark:border-white/20 hover:border-[#0a0f24]/40 dark:hover:border-white/40 text-[#0a0f24] dark:text-slate-200 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[#00d4ff]"
                    >
                      {contactCopy.success.buttons.home}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── RIGHT COLUMN (45%, The Intake Tag) ─── */}
          <div
            id="intake-tag-section"
            className="lg:col-span-5 lg:-ml-10 relative z-20 flex justify-center"
          >
            <IntakeTag
              formState={formState}
              prefillState={prefillState}
              isDarkMode={isDarkMode}
              onReset={resetForm}
            />
          </div>

          {/* Mobile alternative ways section (appears after tag on smaller screens) */}
          <div className="lg:hidden col-span-1 pt-6">
            <OtherWays onSelectSecurityTopic={handleSelectSecurityTopic} />
          </div>

        </div>
      </div>
    </main>
  );
}
