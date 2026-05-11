// Central Park Mooca unit format: tower (fixed list) + apartment number.
// Combined storage form: `${TOWER}-${APT}`, e.g. "A1-302".

export const TOWERS = ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "C3"] as const;
export type Tower = (typeof TOWERS)[number];

export const APT_PATTERN = "^[0-9]{1,5}$";
export const APT_REGEX = /^[0-9]{1,5}$/;
export const UNIT_REGEX = /^[ABC][1-4]-[0-9]{1,5}$/;

export function cleanApt(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function isValidApt(raw: string): boolean {
  const apt = cleanApt(raw);
  return APT_REGEX.test(apt);
}

export function isValidTower(raw: string): raw is Tower {
  return (TOWERS as readonly string[]).includes(raw);
}

export function composeUnit(tower: string, aptRaw: string): string {
  return `${tower.toUpperCase()}-${cleanApt(aptRaw)}`;
}

export function splitUnit(unit: string): { tower: string; apt: string } {
  const m = unit.match(/^([ABC][1-4])-?(\d+)$/);
  if (m) return { tower: m[1], apt: m[2] };
  return { tower: "", apt: "" };
}
