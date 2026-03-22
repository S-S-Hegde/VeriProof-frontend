import PageTransition from "../components/PageTransition";

const Settings = () => {
  return (
    <PageTransition>
      <div className="glass-card p-12 text-center border-vp-teal/20 bg-white mt-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-6">
          Profile <span className="text-ibex-rose italic lowercase normal-case">Settings</span>
        </h2>
        <div className="text-vp-teal text-lg font-light tracking-wide">
          Loading Configurations...
        </div>
      </div>
    </PageTransition>
  );
};
export default Settings;
