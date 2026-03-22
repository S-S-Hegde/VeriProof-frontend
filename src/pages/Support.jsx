import React from "react";
import PageTransition from "../components/PageTransition";
import { HelpCircle } from "lucide-react";

const Support = () => {
  return (
    <PageTransition>
      <div className="glass-card p-12 text-center border-vp-teal/20 bg-white mt-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-6">
          Platform <span className="text-ibex-rose italic lowercase normal-case">Support</span>
        </h2>
        <p className="text-ibex-muted tracking-widest uppercase text-sm mb-8">
          Frequently asked questions, guides, and direct support lines.
        </p>
        <div className="text-vp-teal text-lg font-light tracking-wide lg:p-12 border border-vp-teal/10 rounded-xl bg-vp-teal/5">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-vp-teal/30" />
          Loading Knowledge Base...
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;
