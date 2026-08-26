// Genuinely identical across all 4 panels (director/manager/teacher/student) —
// verified byte-for-byte before being extracted here. Anything that is NOT
// provably identical stays in its own features/<role>/utils/helpers.jsx —
// see /REFACTOR_NOTES.md for why the rest wasn't force-merged.

export function initials(name) {
  return (name || '?').trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

/**
 * Formats a number or string with spaces every thousand (e.g. 10000 -> "10 000", 1000000 -> "1 000 000")
 */
export function formatMoneyInput(value) {
  if (value === undefined || value === null || value === "") return "";
  const raw = String(value).replace(/\s+/g, "").replace(/\D/g, "");
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Parses a thousand-separated string back to raw number (or empty string if blank)
 */
export function parseMoneyInput(value) {
  if (value === undefined || value === null || value === "") return "";
  const raw = String(value).replace(/\s+/g, "").replace(/\D/g, "");
  return raw ? Number(raw) : "";
}

