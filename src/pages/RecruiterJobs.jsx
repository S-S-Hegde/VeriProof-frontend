import PageTransition from "../components/PageTransition";
import { Briefcase, PlusCircle } from "lucide-react";

const RecruiterJobs = () => {
  return (
    <PageTransition>
      <div className="md:flex md:items-center md:justify-between mb-12">
        <div className="flex-1 min-w-0">
          <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-2">
            Job <span className="text-ibex-rose italic lowercase normal-case">Roles</span>
          </h2>
          <div className="h-[2px] w-24 bg-ibex-gold mt-4" />
          <p className="mt-4 text-ibex-muted font-light tracking-wide text-sm max-w-2xl leading-relaxed">
            Manage your open positions and instantly match them with highly verified, top-tier engineering talent currently on the platform.
          </p>
        </div>
        <div className="mt-8 flex md:mt-0 md:ml-4">
          <button type="button" className="ibex-button-primary flex items-center justify-center gap-2">
            <PlusCircle className="w-4 h-4" /> Post New Role
          </button>
        </div>
      </div>
      
      <div className="text-center glass-card py-20 px-4 border border-ibex-surface/40 bg-white flex flex-col items-center">
        <Briefcase className="w-12 h-12 text-vp-teal/30 mb-4" />
        <h3 className="mt-2 text-xl font-serif text-vp-teal tracking-widest uppercase">
          No Active Jobs
        </h3>
        <p className="mt-4 text-sm text-ibex-muted font-light max-w-md mx-auto">
          You haven't posted any job roles yet. Create your first opening to automatically receive verified candidate recommendations.
        </p>
      </div>
    </PageTransition>
  );
};

export default RecruiterJobs;
