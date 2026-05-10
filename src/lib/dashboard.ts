import { supabaseAdmin } from "@/lib/supabase";
import type { AgeBand, Gender } from "@/lib/types";

export type DashboardFilters = {
  interestId?: string;
  ageBand?: AgeBand;
  gender?: Gender;
};

export type DashboardData = {
  totalProfiles: number;
  totalRespondents: number;
  rankings: Array<{ id: string; name: string; category: string; count: number }>;
  heatmap: number[][]; // [day 0-6][hour 0-23] -> count
  ageBreakdown: Record<AgeBand, number>;
  genderBreakdown: Record<Gender, number>;
  categories: string[];
  interests: Array<{ id: string; name: string; category: string }>;
};

export async function loadDashboard(filters: DashboardFilters): Promise<DashboardData> {
  const sb = supabaseAdmin();

  const [{ data: profiles }, { data: interestsCatalog }] = await Promise.all([
    sb
      .from("profiles")
      .select(`
        id, age_band, gender,
        profile_interests ( interest_id ),
        availability ( day_of_week, hour )
      `)
      .eq("submitted", true),
    sb.from("interests").select("id, name, category").eq("active", true).order("category").order("sort_order"),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all = (profiles ?? []) as any[];
  const totalProfiles = all.length;

  const matches = all.filter((p) => {
    if (filters.ageBand && p.age_band !== filters.ageBand) return false;
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.interestId) {
      const has = (p.profile_interests ?? []).some((pi: { interest_id: string }) => pi.interest_id === filters.interestId);
      if (!has) return false;
    }
    return true;
  });

  const totalRespondents = matches.length;

  const interestCount = new Map<string, number>();
  for (const p of matches) {
    for (const pi of p.profile_interests ?? []) {
      interestCount.set(pi.interest_id, (interestCount.get(pi.interest_id) ?? 0) + 1);
    }
  }

  const interests = (interestsCatalog ?? []) as Array<{ id: string; name: string; category: string }>;
  const interestsById = new Map(interests.map((i) => [i.id, i]));
  const rankings = Array.from(interestCount.entries())
    .map(([id, count]) => {
      const meta = interestsById.get(id);
      return meta ? { id, name: meta.name, category: meta.category, count } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.count - a.count);

  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const p of matches) {
    for (const a of p.availability ?? []) {
      const dow = a.day_of_week as number;
      const hour = a.hour as number;
      if (dow < 0 || dow > 6) continue;
      if (hour < 0 || hour > 23) continue;
      heatmap[dow][hour] += 1;
    }
  }

  const ageBreakdown: Record<string, number> = {};
  const genderBreakdown: Record<string, number> = {};
  for (const p of matches) {
    ageBreakdown[p.age_band] = (ageBreakdown[p.age_band] ?? 0) + 1;
    genderBreakdown[p.gender] = (genderBreakdown[p.gender] ?? 0) + 1;
  }

  const categories = Array.from(new Set(interests.map((i) => i.category)));

  return {
    totalProfiles,
    totalRespondents,
    rankings,
    heatmap,
    ageBreakdown: ageBreakdown as Record<AgeBand, number>,
    genderBreakdown: genderBreakdown as Record<Gender, number>,
    categories,
    interests,
  };
}
