import { redirect } from "next/navigation";
import { StepHeader } from "@/components/step-header";
import { TitleBlock, Italic } from "@/components/title-block";
import { InterestPicker } from "@/components/interest-picker";
import { SuggestInterest } from "@/components/suggest-interest";
import { Card } from "@/components/ui/card";
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
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <StepHeader current="interests" condoName={condoName} />
      <TitleBlock
        eyebrow="03 · Interesses"
        title={
          <>
            O que te <Italic>interessa?</Italic>
          </>
        }
        sub="Escolha tudo que te chama. Toque o nível (I → II → III) para indicar seu nível de conhecimento."
      />

      <InterestPicker catalog={catalog} selectedIds={selectedIds} affinityById={affinityById} />

      <div className="px-5 pb-6">
        <Card>
          <SuggestInterest initialState={suggestedState} />
        </Card>
      </div>
    </div>
  );
}
