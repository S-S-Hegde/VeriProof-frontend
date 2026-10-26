import React from "react";
import { motion } from "framer-motion";
import { Users, Quote, Code2, Cpu, ShieldCheck } from "lucide-react";

export default function EternaFounders() {
  const founders = [
    {
      name: "Sridhar R.",
      role: "Founder & Chief Architect",
      quote: "Energy and persistence conquer all things. Well done is better than well said.",
      quoteAuthor: "Benjamin Franklin",
      icon: Code2,
      accent: "text-blue-400 border-blue-500/20 bg-blue-500/10"
    },
    {
      name: "VeriProof Forensic Engine",
      role: "Autonomous Analysis & AST Parser",
      quote: "Everything that is really great and inspiring is created by individuals who can labor in freedom.",
      quoteAuthor: "Albert Einstein",
      icon: Cpu,
      accent: "text-purple-400 border-purple-500/20 bg-purple-500/10"
    },
    {
      name: "Adaptive Evaluation Protocol",
      role: "Gemini Intelligence & Telemetry Core",
      quote: "The noblest pleasure is the joy of understanding. Details make perfection, and perfection is not a detail.",
      quoteAuthor: "Leonardo da Vinci",
      icon: ShieldCheck,
      accent: "text-amber-400 border-amber-500/20 bg-amber-500/10"
    }
  ];

  return (
    <section id="section-founders" className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <Users className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-medium tracking-wide text-white/80">Who We Are</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white">
          Meet the architects
        </h2>
      </div>

      {/* Clean Typographic Cards (No Images, No Heavy Grids) */}
      <div className="flex flex-col gap-5">
        {founders.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="glass-eterna-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Left Identity */}
              <div className="flex items-center gap-4 sm:gap-5 min-w-[260px]">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${f.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
                    {f.name}
                  </h3>
                  <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 mt-0.5">
                    {f.role}
                  </p>
                </div>
              </div>

              {/* Right Quote */}
              <div className="flex-1 sm:border-l sm:border-white/10 sm:pl-8 space-y-1.5">
                <p className="text-sm sm:text-base text-white/80 italic font-light leading-relaxed">
                  "{f.quote}"
                </p>
                <p className="text-xs font-mono tracking-wider uppercase text-white/40">
                  — {f.quoteAuthor}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
