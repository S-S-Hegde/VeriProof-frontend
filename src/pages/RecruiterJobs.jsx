import { useEffect, useRef, useState } from "react";
import PageTransition from "../components/PageTransition";
import { Briefcase, FileUp, PlusCircle } from "lucide-react";
import api from "../utils/api";

const RecruiterJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", targetSkills: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const loadJobs = async () => {
    const { data } = await api.get("/api/verify/my-jobs");
    setJobs(data);
  };
  useEffect(() => { loadJobs().catch(() => setMessage("Unable to load job roles.")); }, []);

  const createJob = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      await api.post("/api/verify/job", {
        ...form,
        targetSkills: form.targetSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
      });
      setForm({ title: "", description: "", targetSkills: "" });
      setMessage("Job role created.");
      await loadJobs();
    } catch (error) { setMessage(error.response?.data?.message || "Job creation failed."); }
    finally { setSaving(false); }
  };

  const uploadDescription = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving(true); setMessage("");
    const data = new FormData();
    data.append("jobDescription", file);
    if (form.title.trim()) data.append("title", form.title.trim());
    try {
      await api.post("/api/verify/job/from-file", data);
      setForm({ title: "", description: "", targetSkills: "" });
      setMessage("Job description uploaded and target skills extracted.");
      await loadJobs();
    } catch (error) { setMessage(error.response?.data?.message || "Job-description upload failed."); }
    finally { setSaving(false); event.target.value = ""; }
  };

  return <PageTransition><div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
    <div className="mb-10 border-b border-[var(--color-border)] pb-8">
      <p className="vp-label-accent mb-3">Recruiter_Workspace</p>
      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Job <span className="text-[var(--color-accent)] not-italic">Roles.</span></h2>
    </div>
    {message && <p className="mb-6 border border-[var(--color-border)] p-3 text-sm">{message}</p>}
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={createJob} className="vp-surface-1 border border-[var(--color-border)] p-6 space-y-5">
        <h3 className="font-bold uppercase tracking-widest flex gap-3"><PlusCircle className="w-5" /> Create role</h3>
        <input className="w-full bg-transparent border border-[var(--color-border)] p-3" placeholder="Job title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="w-full bg-transparent border border-[var(--color-border)] p-3 min-h-40" placeholder="Job description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="w-full bg-transparent border border-[var(--color-border)] p-3" placeholder="React, Node.js, MongoDB" required value={form.targetSkills} onChange={(e) => setForm({ ...form, targetSkills: e.target.value })} />
        <button disabled={saving} className="w-full bg-[var(--color-accent)] text-white p-3 font-bold uppercase tracking-widest">{saving ? "Processing..." : "Create job"}</button>
        <div className="border-t border-[var(--color-border)] pt-5">
          <input ref={fileRef} type="file" hidden accept=".pdf,.docx,.txt" onChange={uploadDescription} />
          <button type="button" disabled={saving} onClick={() => fileRef.current?.click()} className="w-full border border-[var(--color-border)] p-3 uppercase tracking-widest text-xs flex justify-center gap-2"><FileUp className="w-4" /> Upload job description</button>
          <p className="text-xs opacity-50 mt-2">PDF, DOCX, or TXT. Skills are extracted automatically.</p>
        </div>
      </form>
      <section className="space-y-4">
        <h3 className="font-bold uppercase tracking-widest">Active roles ({jobs.length})</h3>
        {!jobs.length && <div className="border border-dashed border-[var(--color-border)] p-12 text-center opacity-60"><Briefcase className="w-10 mx-auto mb-3" />No roles yet.</div>}
        {jobs.map((job) => <article key={job._id} className="border border-[var(--color-border)] p-5">
          <h4 className="font-bold text-lg">{job.title}</h4>
          <p className="text-sm opacity-60 my-3 line-clamp-3">{job.description}</p>
          <div className="flex flex-wrap gap-2">{job.targetSkills.map((skill) => <span key={skill} className="text-xs border border-[var(--color-border)] px-2 py-1">{skill}</span>)}</div>
        </article>)}
      </section>
    </div>
  </div></PageTransition>;
};

export default RecruiterJobs;
