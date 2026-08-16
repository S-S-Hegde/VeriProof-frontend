import { useMemo } from "react";
import { Check, X, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export function evaluatePasswordStrength(password = "") {
  if (!password) {
    return {
      score: 0,
      label: "None",
      color: "bg-slate-300 dark:bg-slate-700",
      textColor: "text-slate-400 dark:text-slate-500",
      requirements: {
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false,
      },
    };
  }

  const length = password.length >= 8;
  const lowercase = /[a-z]/.test(password);
  const uppercase = /[A-Z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);

  let passedCount = 0;
  if (length) passedCount++;
  if (lowercase && uppercase) passedCount++;
  if (number) passedCount++;
  if (special) passedCount++;

  let label = "Weak";
  let color = "bg-red-500";
  let textColor = "text-red-500 dark:text-red-400";
  let level = 1;

  if (!length && password.length > 0) {
    label = "Too Short";
    color = "bg-red-500";
    textColor = "text-red-500 dark:text-red-400";
    level = 1;
  } else if (passedCount === 2) {
    label = "Fair";
    color = "bg-amber-500";
    textColor = "text-amber-500 dark:text-amber-400";
    level = 2;
  } else if (passedCount === 3) {
    label = "Good";
    color = "bg-cyan-500";
    textColor = "text-cyan-500 dark:text-cyan-400";
    level = 3;
  } else if (passedCount === 4) {
    label = "Strong";
    color = "bg-emerald-500";
    textColor = "text-emerald-500 dark:text-emerald-400";
    level = 4;
  }

  return {
    score: level,
    label,
    color,
    textColor,
    requirements: {
      length,
      casing: lowercase && uppercase,
      number,
      special,
    },
  };
}

const PasswordStrengthMeter = ({ password = "", showRequirements = true }) => {
  const { score, label, color, textColor, requirements } = useMemo(
    () => evaluatePasswordStrength(password),
    [password]
  );

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2 animate-fadeIn transition-all">
      {/* Top Header: Strength Indicator & Label */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
          {score <= 1 ? (
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          ) : score >= 4 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-amber-400" />
          )}
          Security Strength:
        </span>
        <span className={`font-bold tracking-wider uppercase ${textColor}`}>
          {label}
        </span>
      </div>

      {/* 4-Step Animated Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isActive = score >= step;
          return (
            <div
              key={step}
              className="h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 transition-colors duration-300"
            >
              <div
                className={`h-full transition-all duration-400 rounded-full ${
                  isActive ? color : "w-0 opacity-0"
                }`}
                style={{ width: isActive ? "100%" : "0%" }}
              />
            </div>
          );
        })}
      </div>

      {/* Dynamic Requirements Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 text-[10px] font-mono">
          <div
            className={`flex items-center gap-1.5 transition-colors ${
              requirements.length
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-slate-400 dark:text-gray-500"
            }`}
          >
            {requirements.length ? (
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 opacity-40 shrink-0" />
            )}
            <span>8+ characters</span>
          </div>

          <div
            className={`flex items-center gap-1.5 transition-colors ${
              requirements.casing
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-slate-400 dark:text-gray-500"
            }`}
          >
            {requirements.casing ? (
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 opacity-40 shrink-0" />
            )}
            <span>Upper & lowercase</span>
          </div>

          <div
            className={`flex items-center gap-1.5 transition-colors ${
              requirements.number
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-slate-400 dark:text-gray-500"
            }`}
          >
            {requirements.number ? (
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 opacity-40 shrink-0" />
            )}
            <span>At least 1 number</span>
          </div>

          <div
            className={`flex items-center gap-1.5 transition-colors ${
              requirements.special
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : "text-slate-400 dark:text-gray-500"
            }`}
          >
            {requirements.special ? (
              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="w-3 h-3 opacity-40 shrink-0" />
            )}
            <span>Special character</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
