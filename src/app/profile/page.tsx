import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { profileAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { AGE_BANDS, GENDERS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const { data } = await sb.from("profiles").select("age_band, gender").eq("id", profileId).maybeSingle();

  return (
    <div>
      <ProgressBar current="profile" />
      <Card>
        <CardTitle>Sobre você</CardTitle>
        <CardDescription>
          Faixa etária e gênero ajudam a montar grupos compatíveis (esportes e várias modalidades costumam ser
          divididos assim).
        </CardDescription>

        <form action={profileAction} className="mt-6 space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Faixa etária</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {AGE_BANDS.map((b) => (
                <label
                  key={b.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    name="age_band"
                    value={b.value}
                    defaultChecked={data?.age_band === b.value}
                    required
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className="text-sm font-medium text-slate-800">{b.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">Gênero</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {GENDERS.map((g) => (
                <label
                  key={g.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-300 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g.value}
                    defaultChecked={data?.gender === g.value}
                    required
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className="text-sm font-medium text-slate-800">{g.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" size="lg" className="w-full">
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
}
