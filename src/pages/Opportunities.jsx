import React from "react";
import PageTransition from "../components/PageTransition";
import { Compass } from "lucide-react";

const Opportunities = () => {
  return (
    <PageTransition>
      <div className="glass-card p-12 text-center border-vp-teal/20 bg-white mt-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-6">
          <Compass className="inline-block w-8 h-8 mr-4 mb-2 text-ibex-rose" />
          Career <span className="text-ibex-rose italic lowercase normal-case">Opportunities</span>
        </h2>
        <p className="text-ibex-muted tracking-widest uppercase text-sm mb-8">
          Hackathons, hiring challenges, and exclusive job postings matching your verified skills.
        </p>
        <div className="text-vp-teal text-lg font-light tracking-wide lg:p-12 border border-vp-teal/10 rounded-xl bg-vp-teal/5">
          Curating personalized matches...
        </div>
      </div>
    </PageTransition>
  );
};

export default Opportunities;
