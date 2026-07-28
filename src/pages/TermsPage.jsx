import React from "react";
import PageTransition from "../components/PageTransition";

const Terms = () => {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto vp-surface-1 p-8 md:p-16 border border-[var(--color-border)] mt-12 mb-20">
        <h1 className="text-4xl font-serif text-[var(--color-text)] tracking-wide uppercase mb-12 text-center">
          Terms &{" "}
          <span className="text-[var(--color-accent)] italic lowercase normal-case">
            Conditions
          </span>
        </h1>

        <div className="space-y-12 text-[var(--color-muted)] font-light leading-loose">
          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing VeriProof, you agree to be bound by these definitive
              terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              2. User Roles
            </h2>
            <p>
              The platform distinctly governs Candidate and Recruiter privileges
              differently. Impersonation strictly breaches platform fidelity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              3. Data Accuracy
            </h2>
            <p>
              Candidates must guarantee cryptographic exactness of their
              submitted Git and document records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              4. Verification Process
            </h2>
            <p>
              Recruiter evaluations are final. Misrepresentation of verified
              badges will lead to immediate deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              5. Privacy & Security
            </h2>
            <p>
              VeriProof complies with all international Data Protection mandates
              securing candidate portfolios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              6. Intellectual Property
            </h2>
            <p>
              Users retain IP over their source code; VeriProof retains IP over
              the verification network schema.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              7. Liability Disclaimer
            </h2>
            <p>
              VeriProof acts as the verifier, not the employer. We hold no
              liability over external employment contracts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              8. Termination of Accounts
            </h2>
            <p>
              Fraudulent activity warrants immediate, un-appealable termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[var(--color-text)] uppercase tracking-widest mb-4">
              9. Governing Law
            </h2>
            <p>
              These terms are governed by regional and international corporate
              law.
            </p>
          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Terms;
