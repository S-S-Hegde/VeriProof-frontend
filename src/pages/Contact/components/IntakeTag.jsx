import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { contactCopy } from "../copy";
import { contactConfig } from "../contact.config";
import { RuledField } from "./RuledField";
import { TopicStamps } from "./TopicStamps";
import { TearStrip } from "./TearStrip";
import { ReceivedStamp } from "./ReceivedStamp";
import { useContactReducedMotion } from "../hooks/useReducedMotion";

/**
 * The Intake Tag: A physical evidence tag made of cool pale paper (#e9eef5)
 * with navy ink (#0a0f24), punched hole, cord loop, ruled fields, and rubber stamps.
 */
export function IntakeTag({
  formState,
  prefillState,
  isDarkMode = true,
  onReset,
}) {
  const {
    values,
    errors,
    activeField,
    status,
    submissionMeta,
    setFieldValue,
    handleFocus,
    handleBlur,
    handleSubmit,
    retrySubmit,
  } = formState;

  const { isPrefilledActive, userName, clearPrefill } = prefillState;
  const prefersReduced = useContactReducedMotion();

  // Desktop mouse sway tracking
  const [mouseSway, setMouseSway] = useState(0);
  const tagRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) return;
    const handleMouseMove = (e) => {
      if (window.innerWidth < 1024) return;
      if (!tagRef.current) return;
      const rect = tagRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      // Clamp sway between -1 and +1 deg
      setMouseSway(Math.max(-1, Math.min(1, deltaX * 1.2)));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReduced]);

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";
  const isError = status === "error";

  // Base rotation
  const baseRotation = activeField ? 0 : -1.5;
  const currentRotation = prefersReduced ? 0 : baseRotation + (activeField ? 0 : mouseSway);

  // Compute text for barcode hash
  const combinedText = `${values.name}${values.email}${values.topic}${values.message}`;

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none flex flex-col items-center">
      {/* String Cord Hanging from above */}
      <div
        aria-hidden="true"
        className="relative w-full flex justify-center -mb-3 z-10 pointer-events-none select-none"
      >
        <svg
          width="40"
          height="54"
          viewBox="0 0 40 54"
          fill="none"
          className="overflow-visible"
        >
          {/* Hanging string cord */}
          <path
            d="M 20 0 C 18 18, 14 36, 20 46 C 26 36, 22 18, 20 0"
            stroke={isDarkMode ? "#c8d3e2" : "#8a9ab0"}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="3 2"
          />
          {/* String knot around hole */}
          <ellipse
            cx="20"
            cy="46"
            rx="4"
            ry="2.5"
            fill={isDarkMode ? "#8a9ab0" : "#4a5b73"}
          />
        </svg>
      </div>

      {/* ─── PHYSICAL INTAKE TAG CONTAINER ─── */}
      <motion.div
        ref={tagRef}
        id="intake-tag-container"
        initial={
          prefersReduced
            ? { opacity: 0 }
            : { y: -80, opacity: 0, rotate: 2 }
        }
        animate={
          isSuccess
            ? prefersReduced
              ? { opacity: 0 }
              : {
                  x: 320,
                  opacity: 0,
                  rotate: 4,
                  transition: { delay: 1.2, duration: 0.6, ease: "easeInOut" },
                }
            : isError
            ? {
                x: [-6, 6, -4, 4, 0],
                rotate: currentRotation,
                opacity: 1,
                y: 0,
                transition: { duration: 0.35 },
              }
            : {
                y: 0,
                opacity: 1,
                rotate: currentRotation,
                transition: prefersReduced
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 220, damping: 22 },
              }
        }
        onAnimationComplete={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("intake-tag-animation-complete"));
          }
        }}
        className={`relative w-full rounded-sm p-6 sm:p-9 text-[#0a0f24] transition-shadow duration-300 ${
          isDarkMode
            ? "bg-[#e9eef5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_1px_rgba(255,255,255,0.1)]"
            : "bg-white border border-[#0a0f24]/15 shadow-[0_20px_40px_-15px_rgba(10,15,36,0.12),0_0_1px_rgba(10,15,36,0.2)]"
        }`}
      >
        {/* Punched Hole at Top Center */}
        <div
          aria-hidden="true"
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#050816] dark:bg-[#050816] light:bg-[#f4f7fb] border border-[#0a0f24]/30 shadow-inner flex items-center justify-center pointer-events-none"
        >
          {/* Inner brass rim */}
          <div className="w-4 h-4 rounded-full border border-[#0a0f24]/20" />
        </div>

        {/* Diagonal clipped corner trims typical of evidence tags */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 w-3 h-3 border-r border-b border-[#0a0f24]/20 pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-3 h-3 border-l border-b border-[#0a0f24]/20 pointer-events-none"
        />

        {/* ─── PRINTED TAG HEADER ─── */}
        <header className="pt-2 pb-5 border-b border-[#0a0f24]/20 mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xs sm:text-sm font-mono font-bold tracking-widest text-[#0a0f24] uppercase">
              {contactCopy.tag.header}
            </h2>
            <p className="text-[10px] font-mono tracking-wider text-[#0a0f24]/50 uppercase mt-0.5">
              {contactCopy.tag.subHeader}
            </p>
          </div>
          <div className="text-[10px] font-mono tracking-widest text-[#0a0f24]/40 font-medium">
            FORM VP-09
          </div>
        </header>

        {/* ─── THE FORM ─── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Honeypot field for bot suppression (hidden & untabbable) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="_hp"
              tabIndex={-1}
              autoComplete="off"
              value={values._hp}
              onChange={(e) => setFieldValue("_hp", e.target.value)}
            />
          </div>

          {/* SENDER NAME (From) */}
          <RuledField
            id="contact-sender-name"
            label={contactCopy.tag.labels.from}
            value={values.name}
            onChange={(val) => setFieldValue("name", val)}
            onFocus={() => handleFocus("name")}
            onBlur={handleBlur}
            placeholder={contactCopy.tag.placeholders.name}
            error={errors.name}
            isFocused={activeField === "name"}
            disabled={isSubmitting || isSuccess}
            extraHeaderRight={
              isPrefilledActive ? (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#0a0f24]/60">
                  <span>
                    {contactCopy.tag.prefill.prefix}{" "}
                    <strong className="text-[#0a0f24] font-bold">
                      {userName}
                    </strong>
                    .
                  </span>
                  <button
                    type="button"
                    onClick={clearPrefill}
                    aria-label={contactCopy.tag.prefill.resetAria}
                    className="text-[#008ba3] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00d4ff] px-0.5 rounded"
                  >
                    {contactCopy.tag.prefill.notYou}
                  </button>
                </div>
              ) : null
            }
          />

          {/* REPLY EMAIL (Reply to) */}
          <RuledField
            id="contact-sender-email"
            type="email"
            label={contactCopy.tag.labels.replyTo}
            value={values.email}
            onChange={(val) => setFieldValue("email", val)}
            onFocus={() => handleFocus("email")}
            onBlur={handleBlur}
            placeholder={contactCopy.tag.placeholders.email}
            error={errors.email}
            isFocused={activeField === "email"}
            disabled={isSubmitting || isSuccess}
          />

          {/* TOPIC STAMPS (Re:) */}
          <TopicStamps
            selectedTopic={values.topic}
            onSelectTopic={(t) => setFieldValue("topic", t)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            error={errors.topic}
          />

          {/* ─── ADAPTIVE TOPIC FIELDS (Smooth height animation) ─── */}
          <AnimatePresence mode="wait">
            {values.topic === "hiring" && (
              <motion.div
                key="topic-hiring-extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <RuledField
                  id="contact-company-roles"
                  label="Company and hiring scale (optional)"
                  value={values.companyAndRoles}
                  onChange={(val) => setFieldValue("companyAndRoles", val)}
                  onFocus={() => handleFocus("companyAndRoles")}
                  onBlur={handleBlur}
                  placeholder="e.g. Acme Corp, hiring roughly 5 engineers"
                  isFocused={activeField === "companyAndRoles"}
                  disabled={isSubmitting || isSuccess}
                />
              </motion.div>
            )}

            {values.topic === "candidate" && (
              <motion.div
                key="topic-candidate-extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <RuledField
                  id="contact-page-visited"
                  label="Which page were you on? (optional)"
                  value={values.pageVisited}
                  onChange={(val) => setFieldValue("pageVisited", val)}
                  onFocus={() => handleFocus("pageVisited")}
                  onBlur={handleBlur}
                  placeholder="e.g. Candidate Dashboard or Verification Link"
                  isFocused={activeField === "pageVisited"}
                  disabled={isSubmitting || isSuccess}
                />
              </motion.div>
            )}

            {values.topic === "bug" && (
              <motion.div
                key="topic-bug-extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden pt-1"
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={values.includeEnvironment}
                    onChange={(e) =>
                      setFieldValue("includeEnvironment", e.target.checked)
                    }
                    disabled={isSubmitting || isSuccess}
                    className="w-4 h-4 rounded border-[#0a0f24]/30 text-[#008ba3] focus:ring-[#00d4ff] bg-transparent"
                  />
                  <span className="text-xs font-mono text-[#0a0f24]/80">
                    Include my browser and app version in telemetry
                  </span>
                </label>
              </motion.div>
            )}

            {values.topic === "security" && (
              <motion.div
                key="topic-security-extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden p-3 rounded-sm bg-[#b91c1c]/10 border-l-2 border-[#b91c1c] text-xs font-mono text-[#7f1d1d]"
              >
                <p className="leading-relaxed">
                  <strong>Security Note:</strong> Describe the issue and how to
                  reproduce it. Do not include passwords, tokens or other live
                  secrets.
                </p>
                {contactConfig.securityEmail && (
                  <p className="mt-1 text-[11px] text-[#991b1b]">
                    Direct disclosures:{" "}
                    <a
                      href={`mailto:${contactConfig.securityEmail}`}
                      className="underline font-bold hover:text-black"
                    >
                      {contactConfig.securityEmail}
                    </a>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* DETAILS (Message) */}
          <RuledField
            id="contact-message-details"
            isMultiline
            rows={4}
            label={contactCopy.tag.labels.details}
            value={values.message}
            onChange={(val) => setFieldValue("message", val)}
            onFocus={() => handleFocus("message")}
            onBlur={handleBlur}
            placeholder={contactCopy.tag.placeholders.message}
            error={errors.message}
            isFocused={activeField === "message"}
            disabled={isSubmitting || isSuccess}
          />

          {/* Error Banner on submission failure */}
          {isError && (
            <div
              role="alert"
              className="p-3 bg-[#b91c1c]/10 border border-[#b91c1c]/30 rounded-sm text-xs font-mono text-[#7f1d1d] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <span>{contactCopy.error.message}</span>
              <button
                type="button"
                onClick={retrySubmit}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#b91c1c] text-white rounded-sm hover:bg-[#991b1b] transition-colors shrink-0"
              >
                {contactCopy.error.retry}
              </button>
            </div>
          )}

          {/* SUBMIT BUTTON & HELPER */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className={`w-full py-3 px-4 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-200 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00d4ff] ${
                isSubmitting
                  ? "bg-[#0a0f24]/10 border-[#0a0f24]/20 text-[#0a0f24]/50 cursor-wait"
                  : "bg-[#0a0f24] hover:bg-[#141b38] border-[#0a0f24] text-[#e9eef5] active:translate-y-[1px]"
              }`}
            >
              {isSubmitting
                ? contactCopy.tag.button.submitting
                : contactCopy.tag.button.idle}
            </button>

            <p className="mt-2 text-center text-[11px] font-mono text-[#0a0f24]/50">
              {contactCopy.tag.button.helper}
            </p>
          </div>
        </form>

        {/* ─── PERFORATED TEAR STRIP & BARCODE ─── */}
        <TearStrip textForHash={combinedText} isTorn={isSuccess} />

        {/* ─── RECEIVED STAMP OVERLAY (Thuds upon success) ─── */}
        <AnimatePresence>
          {isSuccess && (
            <ReceivedStamp
              refId={submissionMeta?.refId}
              submittedAt={submissionMeta?.submittedAt}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default IntakeTag;
