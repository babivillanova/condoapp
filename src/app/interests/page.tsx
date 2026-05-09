import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { InterestPicker } from "@/components/interest-picker";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import type { Affinity, Interest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InterestsPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const [{ data: catalogData }, { data: selData }] = await Promise.all([
    sb.from("interests").select("*").eq("active", true).order("category").order("sort_order"),
    sb.from("profile_interests").select("interest_id, affinity").eq("profile_id", profileId),
  ]);

  const catalog = (catalogData ?? []) as Interest[];
  const selectedIds = (selData ?? []).map((r) => r.interest_id as string);
  const affinityById: Record<string, Affinity> = {};
  for (const r of selData ?? []) affinityById[r.interest_id as string] = r.affinity as Affinity;

  return (
    <div>
      <ProgressBar current="interests" />
      <Card>
        <CardTitle>O que te interessa?</CardTitle>
        <CardDescription>
          Marque tudo que você toparia. Pra cada um você pode dizer se é só curiosidade, se já pratica, ou se
          topa ensinar (a gente pode achar professor dentro do próprio condo!).
        </CardDescription>
        <div className="mt-6">
          <InterestPicker catalog={catalog} selectedIds={selectedIds} affinityById={affinityById} />
        </div>
      </Card>
    </div>
  );
}
