/**
 * Centralized Copy for VeriProof Contact Experience
 * Follows the physical intake tag concept and honest, quiet tone.
 */
export const contactCopy = {
  eyebrow: "[ CONTACT ]",
  headline: {
    line1: "Bring questions.",
    line2: "Bring receipts.",
  },
  intro:
    "Hiring teams, candidates, researchers, fellow builders: write to the VeriProof team and tell us what you need. Pick a topic so your message reaches the right person.",

  otherWays: {
    heading: "Other ways to reach us",
    emailLabel: "Official email",
    securityEmailLabel: "Security disclosures",
    officeHoursLabel: "Office hours",
    responseTimeLabel: "Expected response",
    pgpLabel: "PGP fingerprint",
    copySuccess: "Email copied",
    copyAria: "Copy email address to clipboard",
  },

  tag: {
    header: "EVIDENCE TAG // MESSAGE TO VERIPROOF",
    subHeader: "LOG ENTRY · HTTPS INTAKE",
    tearInstruction: "TEAR OFF RECEIPT UPON FILING",
    receivedStamp: "RECEIVED",
    labels: {
      from: "From",
      replyTo: "Reply to",
      topic: "Re:",
      details: "Details",
    },
    placeholders: {
      name: "Your name",
      email: "you@company.com",
      message:
        "What do you need, or what did you find? Links, screenshots descriptions and steps to reproduce help.",
    },
    prefill: {
      prefix: "Sending as",
      notYou: "Not you?",
      resetAria: "Clear prefilled credentials and type as another sender",
    },
    button: {
      idle: "Send message",
      submitting: "Sending...",
      helper: "Sent over HTTPS to the VeriProof team.",
    },
  },

  topics: [
    {
      id: "question",
      label: "Question about VeriProof",
      stampText: "GENERAL // 01",
    },
    {
      id: "hiring",
      label: "Hiring team / recruiter",
      stampText: "RECRUIT // 02",
      extraField: {
        id: "companyAndRoles",
        label: "Company and hiring scale",
        placeholder: "e.g. Acme Corp, roughly 5 engineering roles per quarter",
      },
    },
    {
      id: "candidate",
      label: "Candidate support",
      stampText: "SUPPORT // 03",
      extraField: {
        id: "pageVisited",
        label: "Which page were you on?",
        placeholder: "e.g. Candidate Evidence Submission or Verification Portal",
      },
    },
    {
      id: "bug",
      label: "Bug or feedback",
      stampText: "TELEMETRY // 04",
      checkbox: {
        id: "includeEnvironment",
        label: "Include my browser and app version",
      },
    },
    {
      id: "security",
      label: "Security issue",
      stampText: "SECURITY // 05",
      securityNotice:
        "Describe the issue and how to reproduce it. Do not include passwords, tokens or other live secrets.",
    },
    {
      id: "collaboration",
      label: "Academic / collaboration",
      stampText: "RESEARCH // 06",
    },
  ],

  success: {
    heading: (firstName) => `Filed. Thanks, ${firstName || "friend"}.`,
    body: "Your message is with the team.",
    responseTime: (time) => `We usually reply within ${time}.`,
    buttons: {
      newTag: "Send another",
      home: "Back to home",
    },
  },

  error: {
    message: "That didn't go through. Your text is still here, nothing was lost.",
    retry: "Retry sending",
  },
};

export default contactCopy;
