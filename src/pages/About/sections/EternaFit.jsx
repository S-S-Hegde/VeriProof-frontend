import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { WordSlideUp, FadeInParagraph } from "../components/WordReveal";

export default function EternaFit() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 mb-14">
        <span className="eterna-pill-badge">
          For Both Sides
        </span>
        <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight">
          <WordSlideUp text="Built for developers and recruiters alike." delay={0.1} />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Candidates Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-10 rounded-3xl flex flex-col justify-between"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 100%, #2a2245, #141026 85%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-300">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-normal text-white">Candidates</h3>
            <p className="text-base text-white/70 font-light leading-relaxed">
              Show verified skills instead of asserting them. Build a Dynamic Skill Tree where each node is unlocked by a repository or an assessment.
            </p>
          </div>

          <div className="pt-8">
            <Link
              to="/student-dashboard"
              className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>Explore Candidate Hub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* Recruiters Column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="p-8 sm:p-10 rounded-3xl flex flex-col justify-between"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 100%, #2a2245, #141026 85%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600/20 text-cyan-300">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-normal text-white">Recruiters</h3>
            <p className="text-base text-white/70 font-light leading-relaxed">
              Paste a job description and get weighted competencies, ranked candidates, a hiring policy of your choice (Startup, Enterprise, Intern, Senior) and an exportable dossier.
            </p>
          </div>

          <div className="pt-8">
            <Link
              to="/bulk-screening"
              className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Explore Recruiter Hub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
