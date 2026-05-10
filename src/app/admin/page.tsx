import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { isAdmin } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  approveSuggestionAction,
  deleteProfileAction,
  logoutAdminAction,
  rejectSuggestionAction,
  setProfileStatusAction,
} from "@/lib/admin-actions";
import { AGE_BANDS, GENDERS } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminHome({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { status } = await searchParams;

  const sb = supabaseAdmin();
  let q = sb
    .from("profiles")
    .select(`
      id, full_name, unit, age_band, gender, status, submitted, created_at,
      profile_interests ( interest_id ),
      availability ( day_of_week )
    `)
    .order("created_at", { ascending: false });
  if (status && ["verified", "pending", "rejected"].includes(status)) {
    q = q.eq("status", status);
  }
  const [{ data: profilesData }, { data: countsData, count: totalCount }, { data: suggData }, { data: catsData }] =
    await Promise.all([
      q,
      sb.from("profiles").select("status", { count: "exact" }),
      sb
        .from("interest_suggestions")
        .select("id, name, created_at, profile_id, profiles:profile_id (full_name, unit)")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      sb.from("interests").select("category").eq("active", true),
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (profilesData ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suggestions = (suggData ?? []) as any[];
  const categories = Array.from(new Set((catsData ?? []).map((c) => c.category as string))).sort();

  const statusCounts = { verified: 0, pending: 0, rejected: 0, total: totalCount ?? 0 };
  for (const r of (countsData ?? []) as Array<{ status: string }>) {
    if (r.status in statusCounts) (statusCounts as Record<string, number>)[r.status] += 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel administrativo</h1>
          <p className="text-sm text-slate-600">{statusCounts.total} resposta(s) no total.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/roster"
            className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Gerenciar lista
          </Link>
          <form action={logoutAdminAction}>
            <Button type="submit" variant="ghost" full={false} className="h-9 px-3 text-[13px]">Sair</Button>
          </form>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {([
          ["Todos", "", statusCounts.total],
          ["Verificados", "verified", statusCounts.verified],
          ["Pendentes", "pending", statusCounts.pending],
          ["Rejeitados", "rejected", statusCounts.rejected],
        ] as Array<[string, string, number]>).map(([label, value, count]) => (
          <Link
            key={label}
            href={value ? `/admin?status=${value}` : "/admin"}
            className={
              (status ?? "") === value
                ? "rounded-xl border border-brand-500 bg-brand-50 p-4"
                : "rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-300"
            }
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{count}</div>
          </Link>
        ))}
      </div>

      {suggestions.length > 0 && (
        <Card>
          <CardTitle className="text-base">Sugestões pendentes ({suggestions.length})</CardTitle>
          <CardDescription>
            Moradores pediram esses interesses. Aprove (escolhendo a categoria) para adicionar ao catálogo, ou rejeite.
          </CardDescription>
          <div className="mt-4 space-y-3">
            {suggestions.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-medium text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    {s.profiles ? `por ${s.profiles.full_name} (${s.profiles.unit})` : "anônimo"} ·{" "}
                    {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <form action={approveSuggestionAction} className="flex flex-1 flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="name" value={s.name} />
                    <select
                      name="category"
                      required
                      defaultValue=""
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                    >
                      <option value="" disabled>
                        Categoria…
                      </option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                      Aprovar
                    </button>
                  </form>
                  <form action={rejectSuggestionAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                      Rejeitar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardTitle className="text-base">Respostas</CardTitle>
        <CardDescription>
          Pendentes são entradas sem match na lista oficial — verifique e promova ou rejeite.
        </CardDescription>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Nome / Unidade</th>
                <th className="py-2 pr-3">Perfil</th>
                <th className="py-2 pr-3">Resp.</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Nada por aqui ainda.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const ageLabel = AGE_BANDS.find((b) => b.value === r.age_band)?.label ?? r.age_band;
                const genderLabel = GENDERS.find((g) => g.value === r.gender)?.label ?? r.gender;
                const intCount = r.profile_interests?.length ?? 0;
                const slotCount = r.availability?.length ?? 0;
                return (
                  <tr key={r.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-slate-900">{r.full_name}</div>
                      <div className="text-xs text-slate-500">{r.unit}</div>
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-600">
                      {ageLabel}
                      <br />
                      {genderLabel}
                    </td>
                    <td className="py-3 pr-3 text-xs text-slate-600">
                      {intCount} interesse(s)
                      <br />
                      {slotCount} hora(s)
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={
                          r.status === "verified"
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                            : r.status === "pending"
                              ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                              : "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                        }
                      >
                        {r.status}
                      </span>
                      {!r.submitted && <div className="mt-1 text-[10px] uppercase text-slate-400">não enviado</div>}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {r.status !== "verified" && (
                          <form action={setProfileStatusAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="verified" />
                            <button className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700">
                              Verificar
                            </button>
                          </form>
                        )}
                        {r.status !== "rejected" && (
                          <form action={setProfileStatusAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <button className="rounded-md bg-amber-600 px-2 py-1 text-xs font-medium text-white hover:bg-amber-700">
                              Rejeitar
                            </button>
                          </form>
                        )}
                        <form action={deleteProfileAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700">
                            Apagar
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
