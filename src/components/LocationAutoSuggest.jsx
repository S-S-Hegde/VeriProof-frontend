import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

export const GLOBAL_LOCATIONS = [
  "Bengaluru, Karnataka, India",
  "Delhi NCR, India",
  "Mumbai, Maharashtra, India",
  "Hyderabad, Telangana, India",
  "Pune, Maharashtra, India",
  "Chennai, Tamil Nadu, India",
  "Kolkata, West Bengal, India",
  "Ahmedabad, Gujarat, India",
  "Kochi, Kerala, India",
  "San Francisco, California, USA",
  "New York, NY, USA",
  "Seattle, Washington, USA",
  "Austin, Texas, USA",
  "Boston, Massachusetts, USA",
  "London, United Kingdom",
  "Manchester, United Kingdom",
  "Berlin, Germany",
  "Munich, Germany",
  "Toronto, Ontario, Canada",
  "Vancouver, British Columbia, Canada",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Singapore",
  "Tokyo, Japan",
  "Paris, France",
  "Zurich, Switzerland",
  "Amsterdam, Netherlands",
  "Dubai, United Arab Emirates",
];

export default function LocationAutoSuggest({ value, onChange, placeholder = "Select or type location...", className, labelCls }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const containerRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLocations = GLOBAL_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  const handleSelect = (loc) => {
    setSearchTerm(loc);
    onChange(loc);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={containerRef}>
      {labelCls && (
        <label className={labelCls}>
          <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          Geographic_Origin / Location
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className={className}
          placeholder={placeholder}
          autoComplete="off"
        />
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
      </div>

      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[var(--color-bg)] border border-[var(--color-border)] shadow-2xl rounded-[var(--radius-md)] backdrop-blur-xl">
          {filteredLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 font-mono text-xs text-[var(--color-text)] hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] transition-colors border-b border-[var(--color-border)]/30 last:border-b-0 flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)] opacity-70 shrink-0" />
              <span>{loc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
