import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Heatmap } from "@/components/heatmap";
import { loadDashboard } from "@/lib/dashboard";
import { AGE_BANDS, GENDERS, type AgeBand, type Gender } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ interest?: string; age?: string; gender?: string; submitted?: string }>;

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters = {
    interestId: sp.interest || undefined,
    ageBand: (sp.age as AgeBand) || undefined,
    gender: (sp.gender as Gender) || undefined,
  };
  const data = await loadDashboard(filters);

  function buildUrl(patch: Partial<typeof sp>) {
    const merged = { ...sp, ...patch };
    delete merged.submitted;
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) q.set(k, String(v));
    }
    const s = q.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  }

  const interestsByCat = new Map<string, typeof data.interests>();
  for (const i of data.interests) {
    const arr = interestsByCat.get(i.category) ?? [];
    arr.push(i);
    interestsByCat.set(i.category, arr);
  }

  const top = data.rankings.slice(0, 12);
  const maxRank = top[0]?.count ?? 0;

  const selectedInterest = data.interests.find((i) => i.id === filters.interestId);

  return (
    <div className="space-y-6">
      {sp.submitted === "1" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          ✅ Suas respostas foram registradas. Obrigado!
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Mapa do condomínio</h1>
        <p className="mt-1 text-slate-600">
          {data.totalRespondents} pessoa(s) com perfil enviado
          {filters.interestId || filters.ageBand || filters.gender ? " (filtrados)" : ""}.
        </p>
      </div>

      <Card>
        <CardTitle className="text-base">Filtros</CardTitle>
        <CardDescription>Combine interesse, faixa etária e gênero para ver onde tem massa.</CardDescription>
        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Interesse</div>
            <div className="flex flex-wrap gap-1.5">
              <Link
                href={buildUrl({ interest: undefined })}
                className={
                  !filters.interestId
                    ? "rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                    : "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }
              >
                Todos
              </Link>
              {data.rankings.slice(0, 20).map((r) => (
                <Link
                  key={r.id}
                  href={buildUrl({ interest: r.id })}
                  className={
                    filters.interestId === r.id
                      ? "rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }
                >
                  {r.name} ({r.count})
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Faixa etária</div>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={buildUrl({ age: undefined })}
                  className={
                    !filters.ageBand
                      ? "rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                  }
                >
                  Todas
                </Link>
                {AGE_BANDS.map((b) => (
                  <Link
                    key={b.value}
                    href={buildUrl({ age: b.value })}
                    className={
                      filters.ageBand === b.value
                        ? "rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                        : "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                    }
                  >
                    {b.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Gênero</div>
              <div className="flex flex-wrap gap-1.5">
                <Link
                  href={buildUrl({ gender: undefined })}
                  className={
                    !filters.gender
                      ? "rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                  }
                >
                  Todos
                </Link>
                {GENDERS.map((g) => (
                  <Link
                    key={g.value}
                    href={buildUrl({ gender: g.value })}
                    className={
                      filters.gender === g.value
                        ? "rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                        : "rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                    }
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">
          Disponibilidade {selectedInterest ? `· ${selectedInterest.name}` : ""}
        </CardTitle>
        <CardDescription>
          Quanto mais escuro, mais gente livre. {selectedInterest ? `Filtrado pelos interessados em ${selectedInterest.name}.` : ""}
        </CardDescription>
        <div className="mt-4">
          <Heatmap data={data.heatmap} />
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">Top interesses</CardTitle>
        <CardDescription>
          Ranking de modalidades por número de interessados.
        </CardDescription>
        <div className="mt-4 space-y-2">
          {top.length === 0 && <p className="text-sm text-slate-500">Sem dados ainda.</p>}
          {top.map((r) => {
            const pct = maxRank > 0 ? (r.count / maxRank) * 100 : 0;
            return (
              <div key={r.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <Link href={buildUrl({ interest: r.id })} className="text-sm font-medium text-slate-800 hover:underline">
                      {r.name}
                    </Link>
                    <span className="text-xs text-slate-500">{r.category}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="w-10 text-right text-sm font-semibold text-slate-900">{r.count}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle className="text-base">Por faixa etária</CardTitle>
          <div className="mt-3 space-y-1.5">
            {AGE_BANDS.map((b) => {
              const c = data.ageBreakdown[b.value] ?? 0;
              const pct = data.totalRespondents ? (c / data.totalRespondents) * 100 : 0;
              return (
                <div key={b.value} className="flex items-center gap-2 text-sm">
                  <span className="w-32 shrink-0 text-slate-700">{b.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-600">{c}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardTitle className="text-base">Por gênero</CardTitle>
          <div className="mt-3 space-y-1.5">
            {GENDERS.map((g) => {
              const c = data.genderBreakdown[g.value] ?? 0;
              const pct = data.totalRespondents ? (c / data.totalRespondents) * 100 : 0;
              return (
                <div key={g.value} className="flex items-center gap-2 text-sm">
                  <span className="w-40 shrink-0 text-slate-700">{g.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-600">{c}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
