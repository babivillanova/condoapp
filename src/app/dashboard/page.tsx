import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Heatmap } from "@/components/heatmap";
import { InterestFilter } from "@/components/interest-filter";
import { loadDashboard } from "@/lib/dashboard";
import { AGE_BANDS, GENDERS, type AgeBand, type Gender } from "@/lib/types";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  interest?: string;
  age?: string;
  gender?: string;
  submitted?: string;
}>;

function parseList<T extends string>(raw: string | undefined, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const ageList = AGE_BANDS.map((b) => b.value);
  const genderList = GENDERS.map((g) => g.value);
  const ageBands = parseList<AgeBand>(sp.age, ageList);
  const genders = parseList<Gender>(sp.gender, genderList);
  const interestIds = (sp.interest ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const data = await loadDashboard({ interestIds, ageBands, genders });

  // Helpers para construir URLs preservando os outros filtros
  function paramsWithout(keys: string[]) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (!v || keys.includes(k) || k === "submitted") continue;
      p.set(k, String(v));
    }
    return p;
  }
  function urlWith(updates: Record<string, string | null>) {
    const p = paramsWithout([]);
    p.delete("submitted");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  }
  function toggleListUrl(field: "age" | "gender" | "interest", value: string) {
    const current =
      field === "age" ? (ageBands as string[]) : field === "gender" ? (genders as string[]) : interestIds;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    return urlWith({ [field]: next.length ? next.join(",") : null });
  }

  const paramsString = (() => {
    const p = new URLSearchParams();
    if (interestIds.length) p.set("interest", interestIds.join(","));
    if (ageBands.length) p.set("age", ageBands.join(","));
    if (genders.length) p.set("gender", genders.join(","));
    return p.toString();
  })();

  const selectedInterests = interestIds
    .map((id) => data.interests.find((i) => i.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const hasFilters = interestIds.length > 0 || ageBands.length > 0 || genders.length > 0;

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
          {data.totalRespondents} pessoa(s)
          {hasFilters ? " (com os filtros aplicados)" : ""}
          {hasFilters ? ` · de ${data.totalProfiles} no total` : ""}.
        </p>
      </div>

      <Card>
        <CardTitle className="text-base">Filtros</CardTitle>
        <CardDescription>
          Combine interesse, faixa etária e gênero. Os números, o ranking e o heatmap atualizam juntos.
        </CardDescription>

        <div className="mt-4 space-y-5">
          {/* Interest filter (searchable) */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
              Interesse {interestIds.length > 0 && <span className="text-slate-400">({interestIds.length})</span>}
            </div>
            <InterestFilter interests={data.interests} selectedIds={interestIds} paramsString={paramsString} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Faixa etária {ageBands.length > 0 && <span className="text-slate-400">({ageBands.length})</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AGE_BANDS.map((b) => {
                  const on = ageBands.includes(b.value);
                  return (
                    <Link
                      key={b.value}
                      href={toggleListUrl("age", b.value)}
                      scroll={false}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition",
                        on
                          ? "bg-brand-600 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
                      )}
                    >
                      {b.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-slate-500">
                Gênero {genders.length > 0 && <span className="text-slate-400">({genders.length})</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {GENDERS.map((g) => {
                  const on = genders.includes(g.value);
                  return (
                    <Link
                      key={g.value}
                      href={toggleListUrl("gender", g.value)}
                      scroll={false}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition",
                        on
                          ? "bg-brand-600 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
                      )}
                    >
                      {g.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
              <span className="text-xs font-semibold uppercase text-slate-500">Ativos:</span>
              {selectedInterests.map((i) => (
                <Link
                  key={i.id}
                  href={toggleListUrl("interest", i.id)}
                  scroll={false}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                >
                  {i.name}
                  <span className="opacity-70">×</span>
                </Link>
              ))}
              {ageBands.map((v) => {
                const label = AGE_BANDS.find((b) => b.value === v)?.label ?? v;
                return (
                  <Link
                    key={v}
                    href={toggleListUrl("age", v)}
                    scroll={false}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {label}
                    <span className="opacity-70">×</span>
                  </Link>
                );
              })}
              {genders.map((v) => {
                const label = GENDERS.find((g) => g.value === v)?.label ?? v;
                return (
                  <Link
                    key={v}
                    href={toggleListUrl("gender", v)}
                    scroll={false}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {label}
                    <span className="opacity-70">×</span>
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                scroll={false}
                className="ml-auto text-xs font-medium text-slate-600 hover:underline"
              >
                Limpar tudo
              </Link>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">
          Disponibilidade
          {selectedInterests.length === 1 && ` · ${selectedInterests[0].name}`}
          {selectedInterests.length > 1 && ` · ${selectedInterests.length} interesses`}
        </CardTitle>
        <CardDescription>
          Quanto mais escuro, mais gente livre. {data.totalRespondents} pessoa(s) considerada(s) com os filtros atuais.
          {selectedInterests.length > 1 && " Pessoas com interesse em qualquer um dos itens selecionados."}
        </CardDescription>
        <div className="mt-4">
          <Heatmap data={data.heatmap} />
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base">Top interesses (no recorte filtrado)</CardTitle>
        <CardDescription>Ranking pelas pessoas que se encaixam nos filtros acima.</CardDescription>
        <div className="mt-4 space-y-2">
          {data.rankings.length === 0 && <p className="text-sm text-slate-500">Sem dados para esse recorte.</p>}
          {data.rankings.slice(0, 15).map((r, i) => {
            const pct = data.rankings[0]?.count ? (r.count / data.rankings[0].count) * 100 : 0;
            const active = interestIds.includes(r.id);
            return (
              <Link
                key={r.id}
                href={toggleListUrl("interest", r.id)}
                scroll={false}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-1 hover:bg-slate-50",
                  active && "bg-brand-50",
                )}
              >
                <span className="w-5 text-right text-xs font-semibold text-slate-400">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-slate-800">{r.name}</span>
                    <span className="text-xs text-slate-500">{r.category}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="w-10 text-right text-sm font-semibold text-slate-900">{r.count}</span>
              </Link>
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
                <Link
                  key={b.value}
                  href={toggleListUrl("age", b.value)}
                  scroll={false}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-1 text-sm hover:bg-slate-50",
                    ageBands.includes(b.value) && "bg-brand-50",
                  )}
                >
                  <span className="w-32 shrink-0 text-slate-700">{b.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-600">{c}</span>
                </Link>
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
                <Link
                  key={g.value}
                  href={toggleListUrl("gender", g.value)}
                  scroll={false}
                  className={cn(
                    "flex items-center gap-2 rounded-md p-1 text-sm hover:bg-slate-50",
                    genders.includes(g.value) && "bg-brand-50",
                  )}
                >
                  <span className="w-40 shrink-0 text-slate-700">{g.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-brand-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-slate-600">{c}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
