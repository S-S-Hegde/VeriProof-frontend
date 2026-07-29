import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Users,
} from "lucide-react";

const BulkScreening = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleScreeningSubmit = () => {
    setIsProcessing(true);
    // Placeholder for API integration: await api.post('/api/verify/bulk', formData)
    setTimeout(() => {
      setIsProcessing(false);
      setFiles([]);
      alert("Bulk screening initiated successfully.");
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[var(--color-text)]">
            Bulk{" "}
            <span className="text-[var(--color-accent)] not-italic">
              Screening
            </span>
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Upload candidate resumes for batch AI verification
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] bg-[var(--vp-glass-bg)]">
          <Users className="w-4 h-4 text-[var(--color-accent)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text)]">
            Batch_Mode_Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dropzone */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`vp-glass p-10 border-2 border-dashed rounded-[var(--radius-xl)] transition-colors duration-300 flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px] ${
              isDragging
                ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text)]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.docx"
            />
            <motion.div
              animate={{ y: isDragging ? -10 : 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <UploadCloud className="w-16 h-16 text-[var(--color-muted)] mb-4 mx-auto" />
            </motion.div>
            <p className="font-bold text-lg text-[var(--color-text)] mb-2">
              Drag & Drop Resumes Here
            </p>
            <p className="text-sm text-[var(--color-muted)] mb-6">
              Supports .PDF and .DOCX up to 5MB each
            </p>
            <button className="vp-btn vp-btn-secondary text-xs px-6 py-2">
              Browse Files
            </button>
          </div>
        </div>

        {/* Selected Files Panel */}
        <div className="vp-glass p-6 rounded-[var(--radius-xl)] h-[500px] flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-[var(--color-border)] pb-3 mb-4">
            Staged Files ({files.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            <AnimatePresence>
              {files.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full text-[var(--color-muted)]"
                >
                  <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs uppercase tracking-widest text-center">
                    No files staged
                  </p>
                </motion.div>
              ) : (
                files.map((file, idx) => (
                  <motion.div
                    key={`${file.name}-${idx}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
                      <p className="text-xs truncate font-mono text-[var(--color-text)]">
                        {file.name}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] mt-auto">
            <button
              disabled={files.length === 0 || isProcessing}
              onClick={handleScreeningSubmit}
              className="vp-btn vp-btn-primary w-full py-3 text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {isProcessing ? "Processing Batch..." : "Initiate Screening"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkScreening;
