import PageTransition from "../components/PageTransition";

const Talent = () => {
  return (
    <PageTransition>
      <div className="glass-card p-12 text-center border-vp-teal/20 bg-white mt-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-6">
          Candidate <span className="text-ibex-rose italic lowercase normal-case">Search</span>
        </h2>
        <div className="text-vp-teal text-lg font-light tracking-wide">
          Initializing Search Index...
        </div>
      </div>
    </PageTransition>
  );
};
export default Talent;
