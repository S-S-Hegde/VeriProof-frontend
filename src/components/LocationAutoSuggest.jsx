import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, Locate, Loader2 } from "lucide-react";

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

export default function LocationAutoSuggest({
  value,
  onChange,
  placeholder = "Select or type location...",
  className,
  labelCls,
  label = "Location / HQ",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [detecting, setDetecting] = useState(false);
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

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const address = data.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county ||
            "";
          const state = address.state || "";
          const country = address.country || "";

          const parts = [city, state, country].filter(Boolean);
          const formattedLocation = parts.join(", ") || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

          setSearchTerm(formattedLocation);
          onChange(formattedLocation);
        } catch (err) {
          console.warn("[Location] Reverse geocoding failed:", err.message);
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        console.warn("[Location] Permission denied or unavailable:", err.message);
        setDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

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
        <div className="flex items-center justify-between mb-2">
          <label className={labelCls + " !mb-0"}>
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {label}
          </label>
          <button
            type="button"
            onClick={detectLocation}
            disabled={detecting}
            title="Auto-detect current GPS location"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            {detecting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Locate className="w-3 h-3 text-cyan-400" />
            )}
            <span>{detecting ? "Locating..." : "Auto-Detect"}</span>
          </button>
        </div>
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
          <button
            type="button"
            onClick={detectLocation}
            className="w-full text-left px-4 py-2.5 font-mono text-[11px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors border-b border-[var(--color-border)]/50 flex items-center gap-2"
          >
            <Locate className="w-3.5 h-3.5 text-cyan-400" />
            <span>Use Current GPS Location</span>
          </button>
          {filteredLocations.map((loc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 font-mono text-xs text-[var(--color-text)] hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] transition-colors border-b border-[var(--color-border)]/30 last:border-b-0 flex items-center gap-2 cursor-pointer"
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
