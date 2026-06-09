"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { normalize } from "@/lib/match";
import { getBtParticipantId, setBtSession, clearBtSession } from "@/lib/session";
import { addDays, BLOCK_SIZE, type MarkKind } from "@/lib/bt-types";

const PLAN_PATH = "/beachtennis/plan";

// Entra com o nome. Se já existe alguém com o mesmo nome, "reassume" esse perfil.
export async function joinAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length < 2 || name.length > 40) redirect("/beachtennis?error=name");

  const normalized = normalize(name);
  const sb = supabaseAdmin();

  const { data: existing } = await sb
    .from("bt_participants")
    .select("id")
    .eq("normalized_name", normalized)
    .maybeSingle();

  let participantId = existing?.id as string | undefined;

  if (!participantId) {
    const { data, error } = await sb
      .from("bt_participants")
      .insert({ name, normalized_name: normalized })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("Falha ao criar participante.");
    participantId = data.id as string;
  }

  await setBtSession(participantId);
  redirect(PLAN_PATH);
}

// Marca um bloco de 3 dias consecutivos como livre/talvez, a partir de startISO.
export async function addBlockAction(startISO: string, kind: MarkKind): Promise<void> {
  const participantId = await getBtParticipantId();
  if (!participantId) redirect("/beachtennis");
  if (kind !== "free" && kind !== "maybe") return;

  const blockId = crypto.randomUUID();
  const rows = Array.from({ length: BLOCK_SIZE }, (_, i) => ({
    participant_id: participantId,
    day: addDays(startISO, i),
    kind,
    block_id: blockId,
  }));

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("bt_marks")
    .upsert(rows, { onConflict: "participant_id,day" });
  if (error) throw error;
  revalidatePath(PLAN_PATH);
}

// Alterna um único dia bloqueado (liga/desliga).
export async function toggleBlockedDayAction(dayISO: string): Promise<void> {
  const participantId = await getBtParticipantId();
  if (!participantId) redirect("/beachtennis");

  const sb = supabaseAdmin();
  const { data: current } = await sb
    .from("bt_marks")
    .select("kind")
    .eq("participant_id", participantId)
    .eq("day", dayISO)
    .maybeSingle();

  if (current?.kind === "blocked") {
    await sb.from("bt_marks").delete().eq("participant_id", participantId).eq("day", dayISO);
  } else {
    const { error } = await sb.from("bt_marks").upsert(
      {
        participant_id: participantId,
        day: dayISO,
        kind: "blocked",
        block_id: crypto.randomUUID(),
      },
      { onConflict: "participant_id,day" },
    );
    if (error) throw error;
  }
  revalidatePath(PLAN_PATH);
}

// Limpa a marcação da participante atual num dia específico.
export async function clearDayAction(dayISO: string): Promise<void> {
  const participantId = await getBtParticipantId();
  if (!participantId) redirect("/beachtennis");
  const sb = supabaseAdmin();
  await sb.from("bt_marks").delete().eq("participant_id", participantId).eq("day", dayISO);
  revalidatePath(PLAN_PATH);
}

// Remove um bloco inteiro (todos os dias com o mesmo block_id).
export async function removeBlockAction(blockId: string): Promise<void> {
  const participantId = await getBtParticipantId();
  if (!participantId) redirect("/beachtennis");
  const sb = supabaseAdmin();
  await sb.from("bt_marks").delete().eq("participant_id", participantId).eq("block_id", blockId);
  revalidatePath(PLAN_PATH);
}

export async function leaveAction(): Promise<void> {
  await clearBtSession();
  redirect("/beachtennis");
}
