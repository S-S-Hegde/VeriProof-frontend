import React from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

const ExamQuestionView = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onPrev,
  onSubmit,
}) => {
  if (!question) return null;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[420px] shadow-2xl border border-slate-800">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
            {question.category || question.skill || "Technical"}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-6 leading-relaxed">
          {question.text || question.questionText}
        </h3>

        <div className="space-y-3">
          {question.options &&
            question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const optionLetters = ["A", "B", "C", "D"];
              return (
                <div
                  key={idx}
                  onClick={() => onSelectOption(idx)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {optionLetters[idx] || idx + 1}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </div>
                  {isSelected && <CheckCircle className="w-5 h-5 text-blue-400" />}
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/20"
          >
            Submit Exam
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamQuestionView;
