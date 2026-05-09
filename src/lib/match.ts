// Normalização e fuzzy match — tudo server-side. A lista de moradores
// nunca vai pro cliente; o resultado deste módulo é só "matched_id | null".

const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeUnit(s: string): string {
  return s
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[] = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, dp[j], dp[j - 1]) + 1;
      prev = tmp;
    }
  }
  return dp[b.length];
}

export type RosterEntry = { id: string; full_name: string; normalized_name: string; normalized_unit: string };

// Critério: unidade tem que bater exatamente (após normalize). Nome aceita até
// 2 edições de Levenshtein, OU coincidência se o nome digitado é prefixo
// suficiente (>= 4 chars) e único na unidade.
export function matchRoster(name: string, unit: string, roster: RosterEntry[]): RosterEntry | null {
  const n = normalize(name);
  const u = normalizeUnit(unit);
  if (!n || !u) return null;

  const sameUnit = roster.filter((r) => r.normalized_unit === u);
  if (!sameUnit.length) return null;

  const exact = sameUnit.find((r) => r.normalized_name === n);
  if (exact) return exact;

  let best: { entry: RosterEntry; dist: number } | null = null;
  for (const r of sameUnit) {
    const d = levenshtein(n, r.normalized_name);
    if (!best || d < best.dist) best = { entry: r, dist: d };
  }
  if (best && best.dist <= 2) return best.entry;

  if (n.length >= 4) {
    const prefix = sameUnit.filter((r) => r.normalized_name.startsWith(n));
    if (prefix.length === 1) return prefix[0];
  }

  return null;
}
