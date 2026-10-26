import { useState, useRef, useCallback } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_TIME_TO_SUBMIT_MS = 1800;

export function useFormState() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    topic: "question",
    message: "",
    companyAndRoles: "",
    pageVisited: "",
    includeEnvironment: false,
    _hp: "", // Honeypot field
  });

  const [errors, setErrors] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'
  const [submissionMeta, setSubmissionMeta] = useState(null);

  const mountTimeRef = useRef(Date.now());

  const setFieldValue = useCallback((field, val) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    // Clear error for field as user edits
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const handleFocus = useCallback((field) => {
    setActiveField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setActiveField(null);
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!values.name.trim()) {
      newErrors.name = "Please state your name.";
    }

    if (!values.email.trim()) {
      newErrors.email = "Reply address required.";
    } else if (!EMAIL_REGEX.test(values.email.trim())) {
      newErrors.email = "Valid email address required.";
    }

    if (!values.topic) {
      newErrors.topic = "Select a topic.";
    }

    if (!values.message.trim()) {
      newErrors.message = "Details field cannot be blank.";
    } else if (values.message.trim().length < 10) {
      newErrors.message = "A few more details help us answer faster.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const executeSubmission = useCallback(async () => {
    // 1. Honeypot check (silently drop bot spam)
    if (values._hp) {
      await new Promise((r) => setTimeout(r, 600));
      setStatus("success");
      return;
    }

    // 2. Minimum human submit time check
    const elapsed = Date.now() - mountTimeRef.current;
    if (elapsed < MINIMUM_TIME_TO_SUBMIT_MS) {
      setErrors((prev) => ({
        ...prev,
        message: "Please review your message before sending.",
      }));
      return;
    }

    setStatus("submitting");

    try {
      // Dispatch payload to intake endpoint (or simulated secure transmission)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Generate verifiable receipt reference
      const entropy = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestamp = new Date();
      const formattedDate = timestamp.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = timestamp.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });

      const firstName = values.name.trim().split(" ")[0];

      setSubmissionMeta({
        refId: `VP-${entropy}-${Date.now().toString(16).slice(-4).toUpperCase()}`,
        submittedAt: `${formattedDate} · ${formattedTime}`,
        firstName,
        topic: values.topic,
        envIncluded: values.includeEnvironment ? `${navigator.userAgent}` : null,
      });

      setStatus("success");
    } catch {
      // Network or server error - user's text is preserved!
      setStatus("error");
    }
  }, [values]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      if (!validate()) {
        return;
      }
      await executeSubmission();
    },
    [validate, executeSubmission]
  );

  const resetForm = useCallback(() => {
    setStatus("idle");
    setSubmissionMeta(null);
    mountTimeRef.current = Date.now();
    setValues((prev) => ({
      ...prev,
      message: "",
      companyAndRoles: "",
      pageVisited: "",
      includeEnvironment: false,
      _hp: "",
    }));
    setErrors({});
  }, []);

  const retrySubmit = useCallback(() => {
    setStatus("idle");
    executeSubmission();
  }, [executeSubmission]);

  return {
    values,
    errors,
    activeField,
    status,
    submissionMeta,
    setFieldValue,
    handleFocus,
    handleBlur,
    handleSubmit,
    resetForm,
    retrySubmit,
  };
}

export default useFormState;
