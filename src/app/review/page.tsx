import Link from "next/link";
import { redirect } from "next/navigation";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { deleteMyDataAction, submitAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { AFFINITIES, AGE_BANDS, DAYS, GENDERS, HOURS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const [{ data: profile }, { data: ints }, { data: avail }] = await Promise.all([
    sb.from("profiles").select("full_name, unit, age_band, gender, status, submitted").eq("id", profileId).maybeSingle(),
    sb
      .from("profile_interests")
      .select("affinity, interests:interest_id (name, category)")
      .eq("profile_id", profileId),
    sb.from("availability").select("day_of_week, hour").eq("profile_id", profileId),
  ]);

  if (!profile) redirect("/identify");

  const ageLabel = AGE_BANDS.find((b) => b.value === profile.age_band)?.label ?? profile.age_band;
  const genderLabel = GENDERS.find((g) => g.value === profile.gender)?.label ?? profile.gender;
  const slotSet = new Set((avail ?? []).map((a) => `${a.day_of_week}:${a.hour}`));

  const intsByCat = new Map<string, Array<{ name: string; affinity: string }>>();
  for (const r of ints ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const i = r.interests as any;
    if (!i) continue;
    const arr = intsByCat.get(i.category) ?? [];
    arr.push({ name: i.name, affinity: r.affinity });
    intsByCat.set(i.category, arr);
  }

  function affinityLabel(a: string) {
    return AFFINITIES.find((x) => x.value === a)?.label ?? a;
  }

  return (
    <div>
      <ProgressBar current="review" />
      <Card>
        <CardTitle>Revisão</CardTitle>
        <CardDescription>Confira tudo antes de enviar. Você pode voltar a editar a qualquer momento.</CardDescription>

        <section className="mt-6 space-y-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm text-slate-500">Identificação</div>
                <div className="text-base font-semibold text-slate-900">{profile.full_name}</div>
                <div className="text-sm text-slate-700">{profile.unit}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {ageLabel} · {genderLabel}
                </div>
              </div>
              <Link href="/identify" className="text-sm font-medium text-brand-700 hover:underline">
                Editar
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-slate-500">Interesses ({ints?.length ?? 0})</div>
              <Link href="/interests" className="text-sm font-medium text-brand-700 hover:underline">
                Editar
              </Link>
            </div>
            {intsByCat.size === 0 ? (
              <p className="text-sm text-slate-500">Nenhum selecionado.</p>
            ) : (
              <div className="space-y-3">
                {Array.from(intsByCat.entries()).map(([cat, list]) => (
                  <div key={cat}>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{cat}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((it) => (
                        <span
                          key={it.name}
                          className="rounded-full bg-white px-2.5 py-1 text-xs ring-1 ring-slate-200"
                        >
                          {it.name}
                          {it.affinity && (
                            <span className="ml-1 text-brand-700">· {affinityLabel(it.affinity)}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-slate-500">Disponibilidade ({slotSet.size}/168)</div>
              <Link href="/availability" className="text-sm font-medium text-brand-700 hover:underline">
                Editar
              </Link>
            </div>
            <div className="overflow-x-auto">
              <div className="grid gap-[2px]" style={{ gridTemplateColumns: "auto repeat(7, minmax(28px, 1fr))" }}>
                <div />
                {DAYS.map((d) => (
                  <div key={d.value} className="pb-1 text-center text-[10px] font-semibold uppercase text-slate-500">
                    {d.short}
                  </div>
                ))}
                {HOURS.map((h) => (
                  <div key={h} className="contents">
                    <div className="pr-1 text-right text-[9px] tabular-nums text-slate-500">
                      {String(h).padStart(2, "0")}
                    </div>
                    {DAYS.map((d) => {
                      const ok = slotSet.has(`${d.value}:${h}`);
                      return (
                        <div
                          key={d.value}
                          className={ok ? "h-4 rounded-sm bg-brand-500" : "h-4 rounded-sm bg-slate-200"}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <form action={submitAction} className="mt-6">
          <Button type="submit" size="lg" className="w-full">
            {profile.submitted ? "Atualizar minhas respostas" : "Enviar"}
          </Button>
        </form>

        <form action={deleteMyDataAction} className="mt-3">
          <button type="submit" className="w-full text-sm text-slate-500 hover:text-red-600">
            Apagar todas as minhas respostas
          </button>
        </form>
      </Card>
    </div>
  );
}
