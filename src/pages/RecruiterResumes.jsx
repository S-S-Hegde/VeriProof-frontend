import PageTransition from "../components/PageTransition";
import { UploadCloud } from "lucide-react";

const RecruiterResumes = () => {
  return (
    <PageTransition>
      <div className="mb-12">
        <h2 className="text-4xl font-serif text-vp-teal font-light tracking-wider uppercase mb-2">
          Bulk <span className="text-ibex-rose italic lowercase normal-case">Resumes</span>
        </h2>
        <div className="h-[2px] w-24 bg-ibex-gold mt-4" />
        <p className="mt-4 text-ibex-muted font-light tracking-wide text-sm max-w-2xl leading-relaxed">
          Upload large batches of resumes or individual candidate documents to parse and match them against the VeriProof database of verified skills.
        </p>
      </div>
      
      <div className="glass-card p-12 lg:p-24 border border-ibex-surface/40 bg-white flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-vp-teal/30 cursor-pointer border-dashed">
        <div className="bg-vp-teal/5 p-6 rounded-full mb-6 text-vp-teal shadow-sm">
          <UploadCloud className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-serif text-vp-teal mt-4 mb-2 tracking-wide">
          Drag & Drop Resumes
        </h3>
        <p className="text-ibex-muted font-light text-sm mb-8 leading-relaxed max-w-md">
          Supported formats: PDF, DOCX. Our AI engine will automatically extract skills and cross-reference them against verified project repositories on the platform.
        </p>
        <button className="ibex-button-primary !px-12 shadow-[0_0_20px_rgba(10,186,181,0.3)]">Browse Files</button>
      </div>
    </PageTransition>
  );
};

export default RecruiterResumes;
