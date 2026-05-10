import { redirect } from "next/navigation";
import { StepHeader } from "@/components/step-header";
import { TitleBlock, Italic } from "@/components/title-block";
import { AvailabilityGrid } from "@/components/availability-grid";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const { data } = await sb.from("availability").select("day_of_week, hour").eq("profile_id", profileId);
  const initial = (data ?? []).map((r) => `${r.day_of_week}:${r.hour}` as `${number}:${number}`);
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <StepHeader current="availability" condoName={condoName} />
      <TitleBlock
        eyebrow="04 · Disponibilidade"
        title={
          <>
            Quando você está <Italic>livre?</Italic>
          </>
        }
        sub="Toque (ou arraste) os turnos. Não precisa precisão — uma boa amostra basta."
      />
      <div className="flex-1">
        <AvailabilityGrid initial={initial} />
      </div>
    </div>
  );
}
