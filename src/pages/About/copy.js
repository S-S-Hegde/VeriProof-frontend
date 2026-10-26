/**
 * copy.js — Source of truth for VeriProof About Page
 * Adheres strictly to honesty guidelines:
 * - Uses "verifiable", "evidence-based", "auditable", "forensic" (no "zero-knowledge", "immutable", "blockchain")
 * - No webcam or video proctoring mentions
 * - All simulated trial statistics clearly labeled "from 100 simulated trials"
 * - Monospace bracket labels with human, precise prose
 */

export const ABOUT_COPY = {
  s0_hero: {
    eyebrow: "[ ABOUT_VERIPROOF ]",
    headlineLine1: "Resumes claim.",
    headlineLine2: "Code proves.",
    sub: "VeriProof checks what candidates say against what they have actually built and how they actually think, then gives hiring teams a trust score they can audit.",
    primaryCta: "Start the audit",
    secondaryCta: "See how it works",
    scrollCue: "SCROLL",
  },

  s1_problem: {
    eyebrow: "[ THE_PROBLEM ]",
    headline: "Technical hiring has a truth problem.",
    lead: "Resumes are marketing documents. Take-home tests can be solved by a chatbot. Public repos can be cloned in a minute. Recruiters spend hours trying to tell real skill from good packaging.",
    cards: [
      {
        id: "borrowed-code",
        title: "Borrowed code",
        description: "Candidates claim experience from cloned or template repositories without authoring the underlying architecture.",
        tag: "AUTHORSHIP_DEFICIT",
      },
      {
        id: "ai-assisted-answers",
        title: "AI-assisted answers",
        description: "Generic multiple-choice tests are easy to look up or paste into an LLM in a secondary tab.",
        tag: "LLM_LEAKAGE",
      },
      {
        id: "blunt-proctoring",
        title: "Blunt proctoring",
        description: "Pass/fail flags miss the subtle signals: guessing, overconfidence, and rapid tab hopping.",
        tag: "SIGNAL_EROSION",
      },
    ],
    pullQuote: "If you can prove it, we can verify it. If you can verify it, you can trust it.",
  },

  s2_pipeline: {
    eyebrow: "[ THE_PIPELINE ]",
    headline: "From claim to verdict in six checks.",
    sub: "A continuous, auditable evidence chain that converts unverifiable resume claims into reproducible proof.",
    stations: [
      {
        num: "01",
        title: "Connect your GitHub",
        copy: "Candidates link their account with OAuth. We read commit history, languages and structure across all repositories.",
        detail: "OAuth Ingestion • Language Ratios • Repository Topography",
      },
      {
        num: "02",
        title: "Check who wrote it",
        copy: "We match commit emails to the candidate, require meaningful authorship (at least 30%), and flag bulk imports where history was pushed in minutes (<600s intervals).",
        detail: "Authorship Threshold >= 30% • Rapid Commit Detection (<600s)",
      },
      {
        num: "03",
        title: "Read the code, not the README",
        copy: "AST analysis confirms real contribution and separates original work from boilerplate scaffolds and forks.",
        detail: "Abstract Syntax Tree Parser • Fork De-duplication • Scaffold Isolation",
      },
      {
        num: "04",
        title: "Fuse the evidence",
        copy: "Resume claims are cross-checked against what the code shows. Contradictions (-15 pts) and missing sources (-5 pts) are flagged.",
        detail: "Cross-Modal Matrix • Claim Reconciliation • Penalty Weighting",
      },
      {
        num: "05",
        title: "Test what they just proved",
        copy: "A two-phase adaptive exam: Phase 1 calibrates a Skill DNA, followed by an intermission where Phase 2 is dynamically compiled from their own codebase.",
        detail: "Skill DNA Profiling • Codebase Context Injection • Scenario Trade-offs",
      },
      {
        num: "06",
        title: "Score the trust",
        copy: "Behavior and evidence are combined into one auditable Forensic Trust Score (0 to 100), with a full dossier for the recruiter.",
        detail: "Forensic Trust Score • Four-Signal Breakdown • Dossier Generation",
      },
    ],
  },

  s3_purgatory: {
    eyebrow: "[ PURGATORY_PROTOCOL ]",
    headline: "A pause that does real work.",
    copy: "Between the two exam phases, candidates wait in a timed holding state (5 to 15 minutes, set by the recruiter). While they wait, our engine builds Phase 2 from their own repositories. There is nothing conceptual to look up, so the pause cannot be used to search for answers.",
    footnote: "If the timer expires or the candidate leaves, the exam closes with a 0.3x score penalty.",
    timerDefault: "10:00",
    engineStatus: "SYNTHESIZING_PHASE_2_SCENARIOS",
  },

  s4_trustScore: {
    eyebrow: "[ FORENSIC_TRUST ]",
    headline: "A score with a paper trail.",
    copy: "Instead of a single pass/fail flag, every session produces a 0 to 100 trust score built from signals a recruiter can see and question.",
    caption: "Illustrative model of how the score responds. Weights are configurable per deployment.",
    formulaText: "100 - (2.5 * min(tabs, 10) + 18 * traps + 5 * overconf + 10 * guess)",
    signals: [
      {
        id: "tabs",
        label: "Tab switches",
        desc: "2.5 pts each (capped at 10 switches)",
        min: 0,
        max: 10,
        step: 1,
        weight: 2.5,
      },
      {
        id: "traps",
        label: "Deceptive traps failed",
        desc: "18 pts each (engineered honeypot options)",
        min: 0,
        max: 3,
        step: 1,
        weight: 18,
      },
      {
        id: "overconf",
        label: "Overconfident wrong answers",
        desc: "5 pts each (high certainty on incorrect choices)",
        min: 0,
        max: 5,
        step: 1,
        weight: 5,
      },
      {
        id: "guess",
        label: "Guess-detection flag",
        desc: "10 pts (median answer speed < 3s on complex items)",
        type: "boolean",
        weight: 10,
      },
    ],
  },

  s5_questionQuality: {
    eyebrow: "[ QUESTION_QUALITY ]",
    headline: "No tells. No lucky guesses.",
    copy: "AI-written multiple-choice questions often give themselves away: the right answer is longer, the wrong ones are silly, everything is hedged. Every question passes three passes before a candidate sees it.",
    passes: [
      {
        step: "01",
        title: "Draft the scenario & answer",
        desc: "Gemini drafts practical scenario debugging and system architecture trade-offs with no memorizable definitions.",
      },
      {
        step: "02",
        title: "Write look-alike distractors",
        desc: "Generates plausible alternative approaches reflecting common architectural mistakes rather than nonsense options.",
      },
      {
        step: "03",
        title: "Run the forensic quality gates",
        desc: "Enforces distractor length parity within 15%, jargon parity index (0.70 to 1.30), removes hedging words, and shuffles positions.",
      },
    ],
  },

  s6_triangulation: {
    eyebrow: "[ TRIANGULATION ]",
    headline: "Three sources. One honest picture.",
    copy: "We compare what a candidate says, what their code shows, and how they perform live. Where the three agree, you can hire with confidence. Where they disagree, you know exactly where to look.",
    sources: [
      { name: "Resume claims", desc: "Declared skills, previous roles, and project references." },
      { name: "Repository evidence", desc: "Commit timelines, AST contributions, and language ratios." },
      { name: "Live assessment", desc: "Adaptive scenario debugging, timing telemetry, and trust score." },
    ],
    outcomes: [
      {
        id: "verified-talent",
        title: "Verified Talent",
        desc: "Claims, code and test all strong. Full alignment across all forensic sources.",
        badge: "STRONG_HIRE",
        color: "text-emerald-400",
        border: "border-emerald-500/40",
      },
      {
        id: "hidden-gem",
        title: "Hidden Gem",
        desc: "Modest resume, strong code and test. The high-caliber builders keyword filters miss.",
        badge: "HIGH_POTENTIAL",
        color: "text-cyan-400",
        border: "border-cyan-500/40",
      },
      {
        id: "overstated-profile",
        title: "Overstated Profile",
        desc: "Big claims, little evidence. Resume lists skills unrepresented in repository ASTs.",
        badge: "DISCREPANCY",
        color: "text-amber-400",
        border: "border-amber-500/40",
      },
      {
        id: "anomalous-evidence",
        title: "Anomalous Evidence",
        desc: "Strong score but suspicious telemetry, rapid tab hopping, or bulk-imported repositories.",
        badge: "AUDIT_REQUIRED",
        color: "text-rose-400",
        border: "border-rose-500/40",
      },
    ],
  },

  s7_skillTree: {
    eyebrow: "[ VERIFIED_SKILLS ]",
    headline: "A portfolio that earns its badges.",
    copy: "Candidates build a Dynamic Skill Tree where every node is unlocked by evidence: a verified repository, a passed assessment, a confirmed claim. Recruiters see tiers, XP and the proof behind each one.",
    tiers: [
      { name: "Foundational", desc: "Core language grammar, standard libraries, and basic I/O." },
      { name: "Intermediate", desc: "Concurrency patterns, state pipelines, and component boundaries." },
      { name: "Advanced", desc: "System scalability, AST transformations, and architectural trade-offs." },
    ],
  },

  s8_recruiterHub: {
    eyebrow: "[ RECRUITER_HUB ]",
    headline: "Shortlists you can defend.",
    copy: "Paste a job description. VeriProof turns it into weighted competencies, runs every applicant through the same evidence pipeline, and ranks them against the hiring policy you choose: Startup, Enterprise, Intern or Senior. Each recommendation, from Strong Hire to Reject, comes with an exportable dossier.",
    policies: ["Startup (Speed & Ownership)", "Enterprise (Architecture & Security)", "Intern (Fundamentals & Trajectory)", "Senior (Trade-offs & Scalability)"],
    recommendations: ["Strong Hire", "Hire", "Borderline", "Hold", "Reject"],
  },

  s9_numbers: {
    eyebrow: "[ MEASURED_RESULTS ]",
    metrics: [
      {
        val: "18 to 22",
        label: "Questions needed vs 30 in a fixed test",
        sub: "Adaptive stopping cuts evaluation length while maintaining measurement precision.",
      },
      {
        val: "~33%",
        label: "Less assessment fatigue",
        sub: "Candidates solve problems at their calibrated frontier rather than redundant items.",
      },
      {
        val: "10",
        label: "End-to-end functional test cases passed",
        sub: "Full-stack validation across frontend, backend, database and Python analytics engines.",
      },
      {
        val: "4",
        label: "Independent signals in the trust score",
        sub: "Tab activity, trap response, confidence calibration, and guess timing metrics.",
      },
    ],
    footnote: "Figures from 100 simulated trials across four candidate cohorts. Not a claim about live customer outcomes.",
  },

  s10_principles: {
    eyebrow: "[ PRINCIPLES ]",
    cards: [
      {
        num: "01",
        title: "Evidence over assertion",
        desc: "Nothing counts until it is backed by code or a live result. Unproven claims carry zero evaluation weight.",
      },
      {
        num: "02",
        title: "Merit over marketing",
        desc: "Strong builders surface regardless of how polished their resume is or how aggressively they optimize keywords.",
      },
      {
        num: "03",
        title: "Signal over noise",
        desc: "Recruiters get a few trustworthy, auditable numbers and dossiers, not an unmanageable pile of bloated PDFs.",
      },
      {
        num: "04",
        title: "Privacy-light integrity",
        desc: "Integrity checks run in the browser as lightweight event telemetry. No webcam video surveillance, no screen recording.",
      },
    ],
  },

  s11_team: {
    eyebrow: "[ ARCHITECTS_&_SYSTEMS ]",
    coreMembers: [
      {
        initials: "SR",
        name: "Sridhar R.",
        role: "Founder & Architect",
        bio: "Full-stack engineer building verifiable evidence infrastructure and forensic telemetry pipelines for technical hiring.",
      },
      {
        initials: "FE",
        name: "VeriProof Forensic Engine",
        role: "Core Analysis Service",
        bio: "A Python analysis service that reads commit trees, ASTs and dependency graphs, and fuses them with exam telemetry into one auditable score.",
      },
    ],
    studentTeam: [
      { name: "Shridhar S Hegde", role: "Architecture & Forensic Systems" },
      { name: "Eshan S N", role: "Full Stack & Verification Pipeline" },
      { name: "Sai Dhanush", role: "Data Models & Telemetry Analytics" },
      { name: "Tejaswi Ananth Bhat", role: "Interface Engineering & State Workflows" },
    ],
    techStack: [
      { name: "React", category: "Client Framework" },
      { name: "Node.js", category: "Application Runtime" },
      { name: "MongoDB", category: "Forensic Data Store" },
      { name: "FastAPI", category: "Python Analysis Engine" },
      { name: "Google Gemini", category: "Adaptive Generation" },
      { name: "Three.js", category: "3D Visualization" },
    ],
  },

  s12_finalCta: {
    eyebrow: "[ VERIFICATION_PORTAL ]",
    headline: "VERIFY THE TRUTH.",
    sub: "Stop guessing which resume is real. Let the evidence speak.",
    ctaText: "Start the audit ->",
  },
};
