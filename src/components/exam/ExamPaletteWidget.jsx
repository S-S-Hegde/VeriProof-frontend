import React from "react";

const ExamPaletteWidget = ({ questions, answers, currentIndex, onJumpToQuestion }) => {
  return (
    <div className="glass-card rounded-2xl p-4 shadow-xl border border-slate-800">
      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
        Question Palette
      </h4>
      
      <div className="grid grid-cols-6 gap-2">
        {questions.map((q, idx) => {
          const qId = q._id || idx;
          const isAnswered = answers[qId] !== undefined && answers[qId] !== null;
          const isCurrent = currentIndex === idx;

          let btnStyle = "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800";
          if (isAnswered) {
            btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold";
          }
          if (isCurrent) {
            btnStyle = "bg-blue-600 border-blue-400 text-white font-black shadow-lg ring-2 ring-blue-400/50";
          }

          return (
            <button
              key={idx}
              onClick={() => onJumpToQuestion(idx)}
              className={`h-9 w-full rounded-lg border text-xs transition flex items-center justify-center ${btnStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-around text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Unvisited
        </span>
      </div>
    </div>
  );
};

export default ExamPaletteWidget;
