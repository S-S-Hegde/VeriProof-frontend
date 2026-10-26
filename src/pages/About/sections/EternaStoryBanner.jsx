import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function EternaStoryBanner({ onOpenStory }) {
  return (
    <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}
        className="space-y-10"
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white/95 leading-[1.25]">
          We set out to create the ideal hiring scenario. The one that turns isolated moments of excellence into a seamless, repeatable experience.
        </h2>

        <div>
          <button
            onClick={onOpenStory}
            className="btn-eterna-gradient inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm sm:text-base font-medium text-white shadow-xl"
          >
            <BookOpen className="h-4 w-4" />
            <span>Read our story</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
