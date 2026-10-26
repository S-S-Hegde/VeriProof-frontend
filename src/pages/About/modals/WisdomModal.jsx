import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export const WISDOM_QUOTES = [
  { quote: "Your greatest power is to show Love, to receive Love and to be Love.", author: "Oprah Winfrey" },
  { quote: "Problems cannot be solved by thinking within the framework in which the problems were created.", author: "Albert Einstein" },
  { quote: "Those who are inspired by a model other than Nature, labor in vain.", author: "Leonardo da Vinci" },
  { quote: "Peace is the tranquility of order.", author: "Saint Thomas Aquinas" },
  { quote: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { quote: "A genuine leader is not a searcher for consensus but a molder of consensus.", author: "Martin Luther King, Jr." },
  { quote: "The best design is the simplest one that works.", author: "Albert Einstein" },
  { quote: "Every time you smile at someone, it is an action of Love, a gift to that person, a beautiful thing.", author: "Mother Teresa" },
  { quote: "Liberty, when it begins to take root, is a plant of rapid growth.", author: "George Washington" },
  { quote: "Only a Life lived for others is a Life worthwhile.", author: "Albert Einstein" },
  { quote: "Love alone is the basis of Harmony and the right use of all Life Energy.", author: "Saint Germain" },
  { quote: "Happiness is when what you think, what you say, and what you do are in Harmony.", author: "Mahatma Gandhi" },
  { quote: "Everything is Energy and that’s all there is to it.", author: "Albert Einstein" },
  { quote: "The art of progress is to preserve order amid change and to preserve change amid order.", author: "Alfred North Whitehead" },
  { quote: "Adopt the pace of Nature, her secret is patience.", author: "Ralph Waldo Emerson" },
  { quote: "Intuition will tell the thinking mind where to look next.", author: "Jonas Salk" },
  { quote: "Realize that everything connects to everything else.", author: "Leonardo da Vinci" },
  { quote: "Intuition does not denote something contrary to reason, but something outside of the province of reason.", author: "Carl Jung" },
  { quote: "Knowing what must be done does away with fear.", author: "Rosa Parks" },
  { quote: "Everything should be made as simple as possible, but not simpler.", author: "Albert Einstein" },
  { quote: "The noblest pleasure is the joy of understanding.", author: "Leonardo da Vinci" },
  { quote: "If you don't have clarity of ideas, you're just communicating sheer sound.", author: "Yo-Yo Ma" },
  { quote: "Peace cannot be kept by force; it can only be achieved by understanding.", author: "Albert Einstein" },
  { quote: "Details make perfection, and perfection is not a detail.", author: "Leonardo da Vinci" },
  { quote: "Make something wonderful and put it out there.", author: "Steve Jobs" },
  { quote: "The only real valuable thing is Intuition.", author: "Albert Einstein" },
  { quote: "The amount of happiness that you have depends on the amount of Freedom you have in your Heart.", author: "Thich Nhat Hanh" },
  { quote: "If you are always trying to be normal you will never know how amazing you can be.", author: "Maya Angelou" },
  { quote: "Nothing happens until you decide.", author: "Oprah Winfrey" },
  { quote: "Where there is Love there is Life.", author: "Mahatma Gandhi" },
  { quote: "All you need is Love.", author: "The Beatles" }
];

export default function WisdomModal({ isOpen, onClose }) {
  const [index, setIndex] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % WISDOM_QUOTES.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + WISDOM_QUOTES.length) % WISDOM_QUOTES.length);
  };

  const current = WISDOM_QUOTES[index];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#161226]/95 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h3 className="text-xl font-medium tracking-tight">
                VeriProof <span className="text-gradient-eterna">gives wisdom Life</span>
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quote Carousel Slide */}
          <div className="my-10 flex min-h-[160px] flex-col justify-center px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-4 text-center sm:text-left"
              >
                <p className="text-xl sm:text-2xl font-light leading-relaxed text-white/90">
                  "{current.quote}"
                </p>
                <p className="text-sm font-medium tracking-wider text-white/50 uppercase">
                  — {current.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
            <span>
              {index + 1} of {WISDOM_QUOTES.length}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15"
                aria-label="Previous quote"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/15"
                aria-label="Next quote"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
