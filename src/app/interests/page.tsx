import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { InterestPicker } from "@/components/interest-picker";
import { SuggestInterest } from "@/components/suggest-interest";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import type { Affinity, Interest } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ suggested?: string }>;

export default async function InterestsPage({ searchParams }: { searchParams: SearchParams }) {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");
  const sp = await searchParams;

  const sb = supabaseAdmin();
  const [{ data: catalogData }, { data: selData }] = await Promise.all([
    sb.from("interests").select("*").eq("active", true).order("category").order("sort_order"),
    sb.from("profile_interests").select("interest_id, affinity").eq("profile_id", profileId),
  ]);

  const catalog = (catalogData ?? []) as Interest[];
  const selectedIds = (selData ?? []).map((r) => r.interest_id as string);
  const affinityById: Record<string, Affinity> = {};
  for (const r of selData ?? []) affinityById[r.interest_id as string] = r.affinity as Affinity;

  const suggestedState = sp.suggested === "1" ? "ok" : sp.suggested === "invalid" ? "invalid" : null;

  return (
    <div className="space-y-4">
      <ProgressBar current="interests" />
      <Card>
        <CardTitle>O que te interessa?</CardTitle>
        <CardDescription>
          Toque pra selecionar. Quando estiver selecionado, toque o nível para alternar:
          {" "}<strong>I</strong> Iniciante · <strong>II</strong> Intermediário · <strong>III</strong> Avançado.
        </CardDescription>
        <div className="mt-6">
          <InterestPicker catalog={catalog} selectedIds={selectedIds} affinityById={affinityById} />
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">Sugerir um novo interesse</CardTitle>
        <div className="mt-3">
          <SuggestInterest initialState={suggestedState} />
        </div>
      </Card>
    </div>
  );
}
