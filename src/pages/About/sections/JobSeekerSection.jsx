import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, Code2, Sparkles, Trophy, Check, ArrowRight } from "lucide-react";

export default function JobSeekerSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const accordions = [
    {
      id: "real-work",
      icon: <Code2 className="w-5 h-5 text-sky-400" />,
      title: "Show your real work",
      desc: "Connect GitHub. We check that the commits are yours and read the code itself.",
    },
    {
      id: "fair-test",
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      title: "Take a fair test",
      desc: "A two-phase adaptive exam built around your own projects, with no memorisable trivia.",
    },
    {
      id: "merit",
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      title: "Get seen on merit",
      desc: "Recruiters rank candidates by evidence, so strong builders surface even with a modest resume.",
    },
  ];

  const checklistItems = [
    "You have real projects on GitHub and want them to count.",
    "You would rather show a Skill Tree than list buzzwords.",
    "You do not have a famous college or company on your resume.",
    "You can explain and debug the code you wrote.",
    "You want recruiters to see evidence, not just keywords.",
  ];

  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10">
      {/* ── Section Header ── */}
      <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <span className="eterna-pill-badge">For job seekers</span>
        </motion.div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.15]">
          Need a job?
          <br />
          <span className="text-gradient-blue-violet font-medium">
            Let your work speak first.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-white/65 font-light leading-relaxed max-w-2xl mx-auto pt-2">
          Recruiters see evidence, not keywords. Build a verified profile and let your code, your exam and your Skill Tree make the case.
        </p>
      </div>

      {/* ── Accordion Rows (One open at a time) ── */}
      <div className="space-y-4 max-w-3xl mx-auto mb-20">
        {accordions.map((item, idx) => {
          const isOpen = openIdx === idx;

          return (
            <div key={item.id} className="jobseeker-accordion-item overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-violet-400/40 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-normal text-white group-hover:text-violet-200 transition-colors">
                    {item.title}
                  </h3>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ChevronDown className="w-5 h-5 text-white/50 group-hover:text-white" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-white/70 font-light leading-relaxed pl-20">
                      <p>{item.desc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Large Candidate Card (Glowing Pink & Violet Gradients from Bottom Corners) ── */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="jobseeker-candidate-card p-8 sm:p-12 lg:p-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Panel */}
          <div className="lg:col-span-6 space-y-6">
            <span className="eterna-pill-badge text-[11px] font-semibold text-pink-300 border-pink-500/20 bg-pink-500/10">
              Built for candidates
            </span>

            <h3 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white leading-[1.12]">
              Get hired <br />
              <span className="text-gradient-eterna">on your proof.</span>
            </h3>

            <div className="pt-2">
              <Link
                to="/register"
                className="btn-eterna-gradient inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm sm:text-base font-medium text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <span>Create your verified profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Panel: "Sound like you?" Checklist */}
          <div className="lg:col-span-6 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 space-y-5">
            <h4 className="text-lg sm:text-xl font-normal text-white">
              Sound like you?
            </h4>

            <ul className="space-y-3.5">
              {checklistItems.map((text, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-white/75 font-light leading-relaxed">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
