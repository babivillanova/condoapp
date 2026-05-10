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
  const { data } = await sb.from("availability").select("day_of_week, hour").eq("profile_id", profileId);
  const initial = (data ?? []).map((r) => `${r.day_of_week}:${r.hour}` as `${number}:${number}`);

  return (
    <div>
      <ProgressBar current="availability" />
      <Card>
        <CardTitle>Quando você está livre?</CardTitle>
        <CardDescription>
          Marque as horas em que você toparia uma aula ou encontro. Use os atalhos pra preencher rápido —
          depois ajuste o que precisar.
        </CardDescription>
        <div className="mt-6">
          <AvailabilityGrid initial={initial} />
        </div>
      </Card>
    </div>
  );
}
