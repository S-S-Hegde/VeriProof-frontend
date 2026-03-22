import PageTransition from "../components/PageTransition";

const Discover = () => {
  return (
    <PageTransition>
      <div className="glass-card p-12 border border-ibex-gold/20 text-center mt-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-6">
          Discover <span className="text-ibex-rose italic lowercase normal-case">Hub</span>
        </h2>
        <div className="glass-card p-12 text-center border-vp-teal/20 bg-white">
          <p className="text-vp-teal text-lg font-light tracking-wide">
            Public feed of all verified projects coming soon...
          </p>
        </div>
      </div>
    </PageTransition>
  );
};
export default Discover;
