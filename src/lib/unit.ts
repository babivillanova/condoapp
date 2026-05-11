// Unit format: tower letter + apartment number, e.g. "A1", "B4", "C12".
// Stored uppercase. normalize_unit (for fuzzy match) keeps the same form
// but lowercased + alphanumeric only (handled in match.ts).

export const UNIT_PATTERN = "^[A-Z][0-9]+$";
export const UNIT_REGEX = /^[A-Z][0-9]+$/;
export const UNIT_PLACEHOLDER = "A1, B4, C12...";
export const UNIT_HELP = "Letra da torre + número do apartamento, sem espaço. Ex: A1, B4, C12.";

export function cleanUnit(raw: string): string {
  // Strip everything except letters/digits, uppercase.
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function isValidUnit(raw: string): boolean {
  return UNIT_REGEX.test(cleanUnit(raw));
}
