import { useEffect, useRef, useState } from "react";
import PageTransition from "../components/PageTransition";
import { Activity, UploadCloud } from "lucide-react";
import api from "../utils/api";

const RecruiterResumes = () => {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const load = async () => {
    const [jobResponse, applicantResponse] = await Promise.all([
      api.get("/api/verify/my-jobs"), api.get("/api/verify/applicants"),
    ]);
    setJobs(jobResponse.data);
    setApplicants(applicantResponse.data);
    setJobId((current) => current || jobResponse.data[0]?._id || "");
  };
  useEffect(() => { load().catch(() => setMessage("Unable to load recruiter screening data.")); }, []);

  const upload = async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length || !jobId) { setMessage("Create and select a job before uploading resumes."); return; }
    setBusy(true); setMessage("");
    const data = new FormData();
    data.append("jobId", jobId);
    files.forEach((file) => data.append("resumes", file));
    try {
      const response = await api.post("/api/verify/applicants/upload", data);
      const failed = response.data.filter((item) => item.status === "Failed").length;
      setMessage(`${response.data.length - failed} resume(s) screened${failed ? `; ${failed} failed` : ""}.`);
      await load();
    } catch (error) { setMessage(error.response?.data?.message || "Bulk upload failed."); }
    finally { setBusy(false); event.target.value = ""; }
  };

  return <PageTransition><div className="max-w-6xl mx-auto px-6 py-12 min-h-screen">
    <div className="mb-10 border-b border-[var(--color-border)] pb-8">
      <p className="vp-label-accent mb-3">Mass_Intelligence_Upload</p>
      <h2 className="text-5xl font-black italic uppercase tracking-tighter">Bulk <span className="text-[var(--color-accent)] not-italic">Screening.</span></h2>
    </div>
    {message && <p className="mb-6 border border-[var(--color-border)] p-3 text-sm">{message}</p>}
    <section className="border border-dashed border-[var(--color-border)] p-8 text-center mb-10">
      <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border)] p-3 mb-5">
        {!jobs.length && <option value="">No job roles available</option>}
        {jobs.map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}
      </select>
      <input ref={inputRef} type="file" multiple hidden accept=".pdf,.docx,.txt" onChange={upload} />
      <button disabled={busy || !jobId} onClick={() => inputRef.current?.click()} className="mx-auto px-8 py-4 bg-[var(--color-accent)] text-white uppercase font-bold tracking-widest flex gap-3 disabled:opacity-40"><UploadCloud className="w-5" />{busy ? "Screening..." : "Choose up to 10 resumes"}</button>
      <p className="text-xs opacity-50 mt-4">PDF, DOCX, or TXT · 5MB each · claims retained per upload</p>
    </section>
    <section className="overflow-x-auto border border-[var(--color-border)]">
      <table className="w-full text-left"><thead><tr className="border-b border-[var(--color-border)]"><th className="p-4">Applicant file</th><th className="p-4">Job</th><th className="p-4">Alignment</th><th className="p-4">Matched claims</th><th className="p-4">Status</th></tr></thead>
      <tbody>{applicants.map((item) => <tr key={item._id} className="border-b border-[var(--color-border)] text-sm"><td className="p-4">{item.originalFileName}</td><td className="p-4">{item.jobId?.title}</td><td className="p-4 font-bold">{item.alignmentScore}%</td><td className="p-4">{item.matchedSkills?.join(", ") || "—"}</td><td className="p-4"><span className="flex gap-2 items-center"><Activity className="w-3" />{item.status}</span>{item.error && <small className="block text-red-500 mt-1">{item.error}</small>}</td></tr>)}</tbody></table>
      {!applicants.length && <p className="p-10 text-center opacity-50">No applicant resumes screened yet.</p>}
    </section>
  </div></PageTransition>;
};

export default RecruiterResumes;
