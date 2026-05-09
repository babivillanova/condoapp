"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { clearAdminSession, isAdmin, setAdminSession } from "@/lib/session";
import { normalize, normalizeUnit } from "@/lib/match";

async function ensureAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function loginAdminAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) redirect("/admin/login?error=server");
  if (email !== expectedEmail || password !== expectedPassword) redirect("/admin/login?error=invalid");
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function setProfileStatusAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["verified", "pending", "rejected"].includes(status)) return;
  const sb = supabaseAdmin();
  await sb.from("profiles").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteProfileAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = supabaseAdmin();
  await sb.from("profiles").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function addRosterAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  if (!fullName || !unit) return;
  const sb = supabaseAdmin();
  await sb.from("residents_roster").insert({
    full_name: fullName,
    normalized_name: normalize(fullName),
    unit,
    normalized_unit: normalizeUnit(unit),
  });
  revalidatePath("/admin/roster");
}

export async function deleteRosterAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = supabaseAdmin();
  await sb.from("residents_roster").delete().eq("id", id);
  revalidatePath("/admin/roster");
}

export async function importRosterCsvAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const csv = String(formData.get("csv") ?? "");
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  const rows: Array<{ full_name: string; normalized_name: string; unit: string; normalized_unit: string }> = [];
  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    const [fullName, unit] = parts;
    if (!fullName || !unit) continue;
    if (fullName.toLowerCase() === "name" || fullName.toLowerCase() === "nome") continue;
    rows.push({
      full_name: fullName,
      normalized_name: normalize(fullName),
      unit,
      normalized_unit: normalizeUnit(unit),
    });
  }
  if (rows.length) {
    const sb = supabaseAdmin();
    await sb.from("residents_roster").insert(rows);
  }
  revalidatePath("/admin/roster");
}
