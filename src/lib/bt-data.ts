// Beach Tennis — carregamento de dados e cálculo das melhores janelas de 3 dias.

import { supabaseAdmin } from "@/lib/supabase";
import {
  addDays,
  BLOCK_SIZE,
  eachDay,
  type Mark,
  type MarkKind,
  type Participant,
} from "@/lib/bt-types";

// Janela de planejamento: de hoje até 31/dez do ano corrente.
export function planningRange(todayISO: string): { startISO: string; endISO: string } {
  const year = Number(todayISO.slice(0, 4));
  return { startISO: todayISO, endISO: `${year}-12-31` };
}

export async function loadParticipants(): Promise<Participant[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("bt_participants")
    .select("id, name")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Participant[];
}

export async function loadMarks(): Promise<Mark[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("bt_marks")
    .select("participant_id, day, kind, block_id");
  if (error) throw error;
  // Normaliza o dia pra "YYYY-MM-DD" (o Postgres pode devolver com hora).
  return (data ?? []).map((m) => ({
    participant_id: m.participant_id as string,
    day: String(m.day).slice(0, 10),
    kind: m.kind as MarkKind,
    block_id: m.block_id as string,
  }));
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("bt_participants").select("id, name").eq("id", id).maybeSingle();
  return (data as Participant) ?? null;
}

// Mapa rápido: "participantId|day" -> kind
export function buildMarkMap(marks: Mark[]): Map<string, MarkKind> {
  const map = new Map<string, MarkKind>();
  for (const m of marks) map.set(`${m.participant_id}|${m.day}`, m.kind);
  return map;
}

export type WindowScore = {
  startISO: string;
  days: string[]; // 3 dias ISO
  free: string[]; // ids livres (todos os 3 dias livres)
  maybe: string[]; // ids "talvez" (livre/talvez, ≥1 talvez, nenhum bloqueado)
  blocked: string[]; // ids com ≥1 dia bloqueado
};

// Avalia o status de uma participante numa janela de 3 dias.
function statusInWindow(
  participantId: string,
  days: string[],
  markMap: Map<string, MarkKind>,
): "free" | "maybe" | "blocked" | "unknown" {
  let hasMaybe = false;
  let allMarked = true;
  for (const d of days) {
    const k = markMap.get(`${participantId}|${d}`);
    if (k === "blocked") return "blocked";
    if (k === "maybe") hasMaybe = true;
    if (k === undefined) allMarked = false;
  }
  if (allMarked && !hasMaybe) return "free";
  if (allMarked && hasMaybe) return "maybe";
  // Se sobrou dia não marcado, mas o que marcou era livre/talvez:
  return hasMaybe ? "maybe" : "unknown";
}

export function scoreWindows(
  participants: Participant[],
  marks: Mark[],
  startISO: string,
  endISO: string,
): WindowScore[] {
  const markMap = buildMarkMap(marks);
  const lastStart = addDays(endISO, -(BLOCK_SIZE - 1));
  const out: WindowScore[] = [];

  for (const start of eachDay(startISO, lastStart)) {
    const days = [start, addDays(start, 1), addDays(start, 2)];
    const free: string[] = [];
    const maybe: string[] = [];
    const blocked: string[] = [];
    for (const p of participants) {
      const s = statusInWindow(p.id, days, markMap);
      if (s === "free") free.push(p.id);
      else if (s === "maybe") maybe.push(p.id);
      else if (s === "blocked") blocked.push(p.id);
    }
    if (free.length === 0 && maybe.length === 0) continue;
    out.push({ startISO: start, days, free, maybe, blocked });
  }

  // Ordena: mais livres, depois livres+talvez, depois menos bloqueios, depois mais cedo.
  out.sort((a, b) => {
    if (b.free.length !== a.free.length) return b.free.length - a.free.length;
    const aPot = a.free.length + a.maybe.length;
    const bPot = b.free.length + b.maybe.length;
    if (bPot !== aPot) return bPot - aPot;
    if (a.blocked.length !== b.blocked.length) return a.blocked.length - b.blocked.length;
    return a.startISO < b.startISO ? -1 : 1;
  });

  return out;
}
