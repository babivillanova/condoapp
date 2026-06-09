// Beach Tennis — tipos e utilidades de data.
// Datas são sempre strings ISO "YYYY-MM-DD" pra evitar dor de cabeça com fuso.

export type MarkKind = "free" | "maybe" | "blocked";

export const KIND_META: Record<
  MarkKind,
  { label: string; short: string; emoji: string; dot: string; help: string }
> = {
  free: {
    label: "Livre",
    short: "Livre",
    emoji: "🟢",
    dot: "var(--bt-free)",
    help: "100% livre nesses 3 dias — pode marcar comigo.",
  },
  maybe: {
    label: "Talvez",
    short: "Talvez",
    emoji: "🟡",
    dot: "var(--bt-maybe)",
    help: "Consigo me virar pra ficar livre se for o melhor combo pra todas.",
  },
  blocked: {
    label: "Bloqueio",
    short: "Não",
    emoji: "🔴",
    dot: "var(--bt-blocked)",
    help: "100% indisponível — não dá nesses dias.",
  },
};

export type Participant = {
  id: string;
  name: string;
};

export type Mark = {
  participant_id: string;
  day: string; // YYYY-MM-DD
  kind: MarkKind;
  block_id: string;
};

// Tamanho do bloco da festa: 3 dias consecutivos.
export const BLOCK_SIZE = 3;

// ---------- Datas ----------

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISO(year: number, month1: number, day: number): string {
  // month1 = mês 1–12
  return `${year}-${pad2(month1)}-${pad2(day)}`;
}

export function parseISO(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

// Soma `n` dias a uma data ISO, usando UTC pra ficar imune a fuso.
export function addDays(iso: string, n: number): string {
  const { y, m, d } = parseISO(iso);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

export function dayOfWeek(iso: string): number {
  const { y, m, d } = parseISO(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=domingo
}

export function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

export const WEEKDAY_LONG = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];

export function formatDayLong(iso: string): string {
  const { d, m } = parseISO(iso);
  return `${d} de ${MONTH_NAMES[m - 1]}`;
}

export function formatRange(startISO: string): string {
  const endISO = addDays(startISO, BLOCK_SIZE - 1);
  const a = parseISO(startISO);
  const b = parseISO(endISO);
  if (a.m === b.m) return `${a.d}–${b.d} de ${MONTH_NAMES[a.m - 1]}`;
  return `${a.d}/${MONTH_NAMES[a.m - 1].slice(0, 3).toLowerCase()} – ${b.d}/${MONTH_NAMES[b.m - 1].slice(0, 3).toLowerCase()}`;
}

// Gera a lista de meses (year, month1) entre dois ISOs, inclusive.
export function monthsBetween(startISO: string, endISO: string): { year: number; month1: number }[] {
  const a = parseISO(startISO);
  const b = parseISO(endISO);
  const out: { year: number; month1: number }[] = [];
  let y = a.y;
  let m = a.m;
  while (y < b.y || (y === b.y && m <= b.m)) {
    out.push({ year: y, month1: m });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

// Lista de todos os dias ISO entre start e end, inclusive.
export function eachDay(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  let cur = startISO;
  while (cur <= endISO) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}
