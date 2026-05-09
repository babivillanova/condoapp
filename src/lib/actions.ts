"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { matchRoster, normalize, normalizeUnit, type RosterEntry } from "@/lib/match";
import { clearSession, getSessionProfileId, setSessionProfile } from "@/lib/session";
import type { AgeBand, Affinity, Gender, TimeSlot } from "@/lib/types";

async function loadRoster(): Promise<RosterEntry[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("residents_roster")
    .select("id, full_name, normalized_name, normalized_unit");
  if (error) throw error;
  return (data ?? []) as RosterEntry[];
}

export async function identifyAction(formData: FormData): Promise<void> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  if (!fullName || !unit) redirect("/identify?error=missing");

  const roster = await loadRoster();
  const matched = matchRoster(fullName, unit, roster);
  const sb = supabaseAdmin();

  const existingId = await getSessionProfileId();
  const payload = {
    full_name: fullName,
    normalized_name: normalize(fullName),
    unit,
    normalized_unit: normalizeUnit(unit),
    matched_roster_id: matched?.id ?? null,
    status: matched ? "verified" : "pending",
  };

  let profileId: string | null = existingId;
  if (profileId) {
    const { error } = await sb.from("profiles").update(payload).eq("id", profileId);
    if (error) profileId = null;
  }

  if (!profileId) {
    const { data, error } = await sb
      .from("profiles")
      .insert({ ...payload, age_band: "30-49", gender: "outro" })
      .select("id")
      .single();
    if (error || !data) throw error ?? new Error("Falha ao criar perfil.");
    profileId = data.id as string;
    await setSessionProfile(profileId);
  }

  redirect("/profile");
}

export async function profileAction(formData: FormData): Promise<void> {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const ageBand = String(formData.get("age_band") ?? "") as AgeBand;
  const gender = String(formData.get("gender") ?? "") as Gender;
  if (!ageBand || !gender) redirect("/profile?error=missing");

  const sb = supabaseAdmin();
  const { error } = await sb.from("profiles").update({ age_band: ageBand, gender }).eq("id", profileId);
  if (error) throw error;

  redirect("/interests");
}

export async function interestsAction(formData: FormData): Promise<void> {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const ids = formData.getAll("interest_id").map(String);
  const affinityEntries = formData.getAll("affinity").map(String);
  const affinities = new Map<string, Affinity>();
  for (const raw of affinityEntries) {
    const [id, level] = raw.split(":");
    if (id && level) affinities.set(id, level as Affinity);
  }

  const sb = supabaseAdmin();
  await sb.from("profile_interests").delete().eq("profile_id", profileId);
  if (ids.length) {
    const rows = ids.map((interest_id) => ({
      profile_id: profileId,
      interest_id,
      affinity: affinities.get(interest_id) ?? "curious",
    }));
    const { error } = await sb.from("profile_interests").insert(rows);
    if (error) throw error;
  }

  redirect("/availability");
}

export async function availabilityAction(formData: FormData): Promise<void> {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const slots = formData.getAll("slot").map(String);
  const sb = supabaseAdmin();
  await sb.from("availability").delete().eq("profile_id", profileId);
  if (slots.length) {
    const rows = slots
      .map((s) => {
        const [day, slot] = s.split(":");
        const dow = Number(day);
        if (Number.isNaN(dow) || dow < 0 || dow > 6) return null;
        if (!["morning", "afternoon", "evening", "dawn"].includes(slot)) return null;
        return { profile_id: profileId, day_of_week: dow, time_slot: slot as TimeSlot };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (rows.length) {
      const { error } = await sb.from("availability").insert(rows);
      if (error) throw error;
    }
  }

  redirect("/review");
}

export async function submitAction(): Promise<void> {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");
  const sb = supabaseAdmin();
  const { error } = await sb.from("profiles").update({ submitted: true }).eq("id", profileId);
  if (error) throw error;
  revalidatePath("/dashboard");
  redirect("/dashboard?submitted=1");
}

export async function deleteMyDataAction(): Promise<void> {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/");
  const sb = supabaseAdmin();
  await sb.from("profiles").delete().eq("id", profileId);
  await clearSession();
  redirect("/?deleted=1");
}
