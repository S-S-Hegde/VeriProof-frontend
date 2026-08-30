import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PlagiarismChecker from "../components/PlagiarismChecker";
import ProjectVerificationModal from "../components/ProjectVerificationModal";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code, Info, ShieldCheck, Cpu, RefreshCw } from "lucide-react";

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/api/projects/${id}`);
        setProject(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load project details");
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-10 h-10 border-2 border-ibex-gold/20 border-t-ibex-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif text-ibex-gold">{error}</h2>
        <Link
          to="/dashboard"
          className="text-vp-teal hover:text-ibex-rose mt-6 inline-block tracking-widest uppercase text-xs transition-colors font-medium border-b border-vp-teal"
        >
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const isVerified =
    project?.isVerified ||
    project?.status === "Verified" ||
    project?.verificationStatus === "Verified" ||
    Boolean(project?.githubStats?.commitsCount > 0) ||
    Boolean(project?.aiGenerated?.analyzedAt);

  const handleVerified = (updatedData) => {
    setProject((prev) => ({
      ...prev,
      isVerified: true,
      status: "Verified",
      verificationStatus: "Verified",
      matchScore: updatedData?.matchScore || 95,
      liveAuditReport: updatedData?.liveAuditReport || prev?.liveAuditReport,
    }));
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto py-8">
        <Link
          to="/project-archive"
          className="text-ibex-muted hover:text-ibex-gold flex items-center mb-12 tracking-widest uppercase text-xs transition-colors group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">
            ←
          </span>{" "}
          Return to Evidence Archive
        </Link>
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <header className="mb-16 md:flex md:justify-between md:items-end">
            <div className="md:w-3/4">
              <h1 className="text-5xl md:text-7xl font-serif text-vp-teal font-light tracking-wide leading-tight mb-6">
                {project.title}
              </h1>
              <div className="h-[1px] w-32 bg-ibex-gold/50 mb-8" />
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full border border-ibex-gold/40 flex items-center justify-center text-ibex-gold font-serif">
                  {project.user.name.charAt(0)}
                </div>
                <p className="text-ibex-muted font-light tracking-wide uppercase text-sm flex items-center">
                  A work by{" "}
                  <span className="text-vp-teal font-medium">
                    {project.user.name}
                  </span>{" "}
                  <span className="mx-2 text-ibex-gold">|</span> @
                  {project.user.githubUsername}
                </p>
              </div>
            </div>
            <div className="mt-8 md:mt-0 pb-2 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center px-4 py-2 border text-xs tracking-widest uppercase shadow-sm backdrop-blur-md ${isVerified ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-ibex-gold/30 text-ibex-gold bg-ibex-gold/5"}`}
              >
                {isVerified
                  ? "Verified Project ✅"
                  : "Verification Pending"}
              </span>
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{isVerified ? "Re-Verify Evidence" : "Run Live Verification"}</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <section className="mb-16">
                <h3 className="text-xs font-semibold text-ibex-gold mb-6 uppercase tracking-[0.2em] border-b border-ibex-gold/20 pb-4">
                  Concept & Synopsis
                </h3>
                <div className="glass-card p-10 lg:p-14 border-t-4 border-ibex-gold border-x-0 border-b-0 bg-white shadow-xl">
                  <p className="text-vp-teal text-lg font-light leading-loose whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </section>

              {project.images && project.images.length > 0 && (
                <section className="mb-16">
                  <h3 className="text-xs font-semibold text-ibex-gold mb-6 uppercase tracking-[0.2em] border-b border-ibex-gold/20 pb-4">
                    Visual Showcase
                  </h3>
                  <div className="grid grid-cols-1 gap-8">
                    {project.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group overflow-hidden border border-ibex-gold/20 p-2 bg-ibex-surface/30"
                      >
                        <img
                          src={img}
                          alt={`Project view ${idx + 1}`}
                          className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {user && (
                <section className="mt-10 bg-black/60 backdrop-blur border border-orange-500/12 rounded-2xl p-6">
                  <PlagiarismChecker projectId={id} />
                </section>
              )}
            </div>

            <div className="lg:col-span-4 space-y-12">
              <section>
                <h3 className="text-xs font-semibold text-ibex-gold mb-6 uppercase tracking-[0.2em] border-b border-ibex-gold/20 pb-4">
                  Medium
                </h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-4 py-1.5 text-xs font-light text-ibex-text border border-ibex-gold/20 hover:border-ibex-gold/60 transition-colors bg-ibex-surface/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-ibex-gold mb-6 uppercase tracking-[0.2em] border-b border-ibex-gold/20 pb-4">
                  Access & Verification
                </h3>
                <div className="flex flex-col space-y-6">
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group"
                  >
                    <div className="text-xs text-ibex-muted uppercase tracking-widest mb-1">
                      Source Repository
                    </div>
                    <div className="text-ibex-text group-hover:text-ibex-gold transition-colors flex items-center">
                      Explore Source Code{" "}
                      <span className="ml-2 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <div className="text-xs text-ibex-muted uppercase tracking-widest mb-1">
                        Live Project
                      </div>
                      <div className="text-ibex-text group-hover:text-ibex-gold transition-colors flex items-center">
                        View Interactive{" "}
                        <span className="ml-2 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              </section>

              {project.githubStats && project.githubStats.lastCommitDate && (
                <section className="bg-vp-teal/5 p-6 border border-vp-teal/10">
                  <h3 className="text-xs font-semibold text-ibex-gold mb-6 uppercase tracking-[0.2em] border-b border-ibex-gold/20 pb-4">
                    Provenance
                  </h3>
                  <div className="space-y-6">
                    <p className="text-sm font-light text-vp-teal">
                      <span className="text-xs text-ibex-muted uppercase tracking-widest block mb-1">
                        Status
                      </span>
                      {isVerified
                        ? "Verified ✅"
                        : "Pending Evaluation"}
                    </p>
                    <div>
                      <p className="text-sm text-ibex-muted uppercase tracking-widest mb-1">
                        Recent Metamorphosis
                      </p>
                      <p className="text-sm font-light text-vp-teal">
                        {new Date(
                          project.githubStats.lastCommitDate,
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {project.githubStats.languages &&
                      Object.keys(project.githubStats.languages).length > 0 && (
                        <div>
                          <p className="text-sm text-ibex-muted uppercase tracking-widest mb-2">
                            Dominant Linguistics
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(project.githubStats.languages)
                              .slice(0, 4)
                              .map((lang) => (
                                <span
                                  key={lang}
                                  className="text-sm uppercase font-light text-ibex-gold border border-ibex-gold/20 px-2 py-1"
                                >
                                  {lang}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {project.featuredSnippets && project.featuredSnippets.length > 0 && (
            <section className="mt-20 pt-20 border-t border-ibex-gold/20">
              <h3 className="text-xs font-semibold text-ibex-gold mb-10 uppercase tracking-[0.2em] flex items-center gap-3">
                <Code className="w-5 h-5" /> Technical Artifacts (Featured Code)
              </h3>
              <div className="space-y-16">
                {project.featuredSnippets.map((snippet, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-vp-teal uppercase tracking-[0.2em]">
                        {snippet.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-ibex-gold border border-ibex-gold/30 px-3 py-1 rounded-sm uppercase bg-ibex-gold/5">
                          {snippet.language}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-sm overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5 bg-[#0d0d0d]">
                      <SyntaxHighlighter
                        language={snippet.language}
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          padding: "2.5rem",
                          fontSize: "0.95rem",
                          lineHeight: "1.7",
                          backgroundColor: "#0d0d0d",
                        }}
                      >
                        {snippet.code}
                      </SyntaxHighlighter>
                    </div>
                    {snippet.explanation && (
                      <div className="mt-6 flex items-start gap-4 bg-vp-teal/5 p-6 border-l-2 border-ibex-gold/40 max-w-4xl">
                        <Info className="w-5 h-5 text-ibex-gold mt-1 shrink-0" />
                        <p className="text-base text-vp-teal/90 font-light italic leading-relaxed">
                          {snippet.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </motion.article>

        {/* Portaled Verification Modal */}
        <ProjectVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          project={project}
          onVerified={handleVerified}
        />
      </div>
    </PageTransition>
  );
};

export default ProjectDetails;
