import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AvailabilityGrid } from "@/components/availability-grid";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const { data } = await sb.from("availability").select("day_of_week, time_slot").eq("profile_id", profileId);
  const initial = (data ?? []).map((r) => `${r.day_of_week}:${r.time_slot}` as `${number}:${"morning" | "afternoon" | "evening" | "dawn"}`);

  return (
    <div>
      <ProgressBar current="availability" />
      <Card>
        <CardTitle>Quando você está livre?</CardTitle>
        <CardDescription>
          Toque (ou arraste) para marcar os turnos em que você toparia uma aula ou encontro. Pense em
          disponibilidade média — não precisa ser todo dia.
        </CardDescription>
        <div className="mt-6">
          <AvailabilityGrid initial={initial} />
        </div>
      </Card>
    </div>
  );
}
