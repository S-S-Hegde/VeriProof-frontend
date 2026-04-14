import { useState, useCallback } from "react";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Trash2, Calculator, RefreshCw } from "lucide-react";

/* ─── VTU Grading System ───────────────────────────────────────
   VTU (Visvesvaraya Technological University) uses a 10-point
   grade point scale. SGPA = Σ(grade_point × credits) / Σcredits
   CGPA = Σ(sgpa × total_credits_in_sem) / Σ(total_credits_in_sem)
──────────────────────────────────────────────────────────────── */
const VTU_GRADES = [
  { label: "O  – Outstanding (90–100)",  points: 10 },
  { label: "A+  – Excellent (80–89)",    points: 9  },
  { label: "A   – Very Good (70–79)",    points: 8  },
  { label: "B+  – Good (60–69)",         points: 7  },
  { label: "B   – Above Average (55–59)",points: 6  },
  { label: "C   – Average (50–54)",      points: 5  },
  { label: "P   – Pass (40–49)",         points: 4  },
  { label: "F   – Fail (< 40)",          points: 0  },
  { label: "Ab  – Absent",              points: 0  },
];

const freshSubject = () => ({ id: Date.now(), name: "", credits: "", grade: "10" });
const freshSem     = (idx) => ({
  id: Date.now() + idx,
  name: `Semester ${idx + 1}`,
  subjects: [freshSubject(), freshSubject(), freshSubject()],
});

const calcSGPA = (subjects) => {
  let totalCredits = 0, totalPoints = 0;
  subjects.forEach(({ credits, grade }) => {
    const c = parseFloat(credits) || 0;
    const g = parseFloat(grade)   || 0;
    totalCredits += c;
    totalPoints  += c * g;
  });
  if (!totalCredits) return { sgpa: 0, totalCredits: 0 };
  return { sgpa: totalPoints / totalCredits, totalCredits };
};

const badge = (value) => {
  if (value >= 9)   return "text-emerald-400";
  if (value >= 8)   return "text-green-400";
  if (value >= 7)   return "text-orange-400";
  if (value >= 6)   return "text-yellow-500";
  if (value >= 5)   return "text-orange-600";
  return "text-red-500";
};

const inputCls = "bg-black/50 border border-orange-500/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 w-full";

export default function VTUCalculator() {
  const [semesters, setSemesters] = useState([freshSem(0)]);

  const addSem      = () => setSemesters((p) => [...p, freshSem(p.length)]);
  const removeSem   = (sid) => setSemesters((p) => p.filter((s) => s.id !== sid));
  const resetAll    = () => setSemesters([freshSem(0)]);

  const updateSem   = (sid, key, val) =>
    setSemesters((p) => p.map((s) => s.id === sid ? { ...s, [key]: val } : s));

  const addSubject  = (sid) =>
    setSemesters((p) => p.map((s) =>
      s.id === sid ? { ...s, subjects: [...s.subjects, freshSubject()] } : s));

  const removeSubject = (sid, subId) =>
    setSemesters((p) => p.map((s) =>
      s.id === sid ? { ...s, subjects: s.subjects.filter((sb) => sb.id !== subId) } : s));

  const updateSubject = (sid, subId, key, val) =>
    setSemesters((p) => p.map((s) =>
      s.id === sid
        ? { ...s, subjects: s.subjects.map((sb) => sb.id === subId ? { ...sb, [key]: val } : sb) }
        : s));

  // Compute SGPA for each semester
  const semResults = semesters.map((s) => ({ ...calcSGPA(s.subjects), semId: s.id }));

  // CGPA = weighted average of SGPAs by total credits in each semester
  const totalCreditSum   = semResults.reduce((acc, r) => acc + r.totalCredits, 0);
  const weightedSGPASum  = semResults.reduce((acc, r) => acc + r.sgpa * r.totalCredits, 0);
  const cgpa = totalCreditSum > 0 ? weightedSGPASum / totalCreditSum : 0;

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto pb-24">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <GraduationCap className="w-8 h-8 text-orange-500" />
            <h1 className="text-4xl font-black text-white uppercase tracking-wide">
              VTU <span className="text-orange-500">SGPA / CGPA</span> Calculator
            </h1>
          </div>
          <div className="h-[2px] w-32 bg-orange-600 mt-4" />
          <p className="mt-4 text-gray-400 text-sm max-w-2xl">
            Official VTU 10-point grading system. Add subjects per semester, assign credits and grade points.
            SGPA and CGPA are computed automatically as per VTU norms.
          </p>
        </div>

        {/* CGPA Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-2xl bg-black/70 border border-orange-500/20 flex flex-wrap items-center gap-6"
        >
          <div className="flex-1 min-w-[160px]">
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Overall CGPA</p>
            <p className={`text-5xl font-black ${badge(cgpa)}`}>{cgpa.toFixed(2)}</p>
            <p className="text-gray-600 text-xs mt-1">across {semesters.length} semester{semesters.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {semesters.map((s, i) => {
              const r = semResults[i];
              return (
                <div key={s.id} className="text-center px-4 py-3 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-gray-600 text-sm uppercase tracking-widest mb-0.5">{s.name}</p>
                  <p className={`text-xl font-black ${badge(r.sgpa)}`}>{r.sgpa.toFixed(2)}</p>
                  <p className="text-gray-700 text-xs">{r.totalCredits} cr</p>
                </div>
              );
            })}
          </div>
          <button onClick={resetAll} className="ml-auto flex items-center gap-2 text-gray-600 hover:text-orange-400 text-xs uppercase tracking-widest transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </motion.div>

        {/* Semesters */}
        <div className="space-y-6">
          {semesters.map((sem, si) => {
            const r = semResults[si];
            return (
              <motion.div
                key={sem.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.04 }}
                className="bg-black/70 backdrop-blur-xl border border-orange-500/12 rounded-2xl overflow-hidden"
              >
                {/* Semester header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
                  <input
                    className="bg-transparent text-white font-black text-base focus:outline-none tracking-wide flex-1"
                    value={sem.name}
                    onChange={(e) => updateSem(sem.id, "name", e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">SGPA:</span>
                    <span className={`text-lg font-black ${badge(r.sgpa)}`}>{r.sgpa.toFixed(2)}</span>
                    <span className="text-xs text-gray-700 ml-1">({r.totalCredits} cr)</span>
                  </div>
                  {semesters.length > 1 && (
                    <button onClick={() => removeSem(sem.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Subjects table */}
                <div className="p-5 space-y-3">
                  {/* Column headers */}
                  <div className="grid grid-cols-12 gap-3 px-1">
                    <div className="col-span-6 text-sm text-gray-600 uppercase tracking-widest">Subject</div>
                    <div className="col-span-2 text-sm text-gray-600 uppercase tracking-widest">Credits</div>
                    <div className="col-span-3 text-sm text-gray-600 uppercase tracking-widest">Grade</div>
                    <div className="col-span-1" />
                  </div>

                  {sem.subjects.map((sub) => (
                    <div key={sub.id} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-6">
                        <input className={inputCls} placeholder="Subject name (optional)"
                          value={sub.name} onChange={(e) => updateSubject(sem.id, sub.id, "name", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <input className={inputCls} type="number" min="0" max="10" step="0.5" placeholder="Cr"
                          value={sub.credits} onChange={(e) => updateSubject(sem.id, sub.id, "credits", e.target.value)} />
                      </div>
                      <div className="col-span-3">
                        <select className={inputCls} value={sub.grade}
                          onChange={(e) => updateSubject(sem.id, sub.id, "grade", e.target.value)}>
                          {VTU_GRADES.map((g) => (
                            <option key={g.points + g.label} value={g.points} className="bg-black text-white">
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {sem.subjects.length > 1 && (
                          <button onClick={() => removeSubject(sem.id, sub.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button onClick={() => addSubject(sem.id)}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-orange-400 transition-colors uppercase tracking-widest mt-2">
                    <Plus className="w-3.5 h-3.5" /> Add Subject
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add semester + grade table reference */}
        <div className="flex flex-wrap gap-4 mt-6 items-start">
          <button onClick={addSem}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black tracking-widest uppercase text-sm shadow-[0_0_18px_rgba(255,69,0,0.4)] transition-all">
            <Plus className="w-4 h-4" /> Add Semester
          </button>

          {/* Grade reference table */}
          <div className="flex-1 min-w-[260px] bg-black/50 border border-white/5 rounded-xl p-5">
            <p className="text-gray-500 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calculator className="w-3 h-3" /> VTU Grade Reference
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {VTU_GRADES.filter((g) => g.points > 0).map((g) => (
                <div key={g.points} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{g.label.split("–")[0].trim()}</span>
                  <span className={`font-black ${badge(g.points)}`}>{g.points}.0</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
