/**
 * VeriProof Contact Configuration
 *
 * Honesty rules:
 * - Only items with a non-empty string value are rendered on the page.
 * - responseTime, officeHours, and pgp are empty by default.
 * - No claims of zero-knowledge, SLAs, or response guarantees.
 */
export const contactConfig = {
  email: "hello@veriproof.io",
  securityEmail: "security@veriproof.io",
  responseTime: "", // e.g. "24–48 business hours" — rendered only if populated
  officeHours: "",  // e.g. "Mon–Fri, 09:00–18:00 UTC" — rendered only if populated
  pgp: "",          // e.g. "4A7D 89B2 01E4 9C5F 33B8 7A21 D509 2381 7F9E A1C0" — rendered only if populated
};

export default contactConfig;
