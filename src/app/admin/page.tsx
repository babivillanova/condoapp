import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Masthead } from "@/components/masthead";
import { Section } from "@/components/section";
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
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const STATUS_LABEL: Record<string, string> = {
  verified: "verificado",
  pending: "pendente",
  rejected: "rejeitado",
};

export default async function AdminHome({ searchParams }: { searchParams: SearchParams }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { status } = await searchParams;
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

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
    <div className="min-h-screen bg-bg text-ink">
      <Masthead
        condoName={condoName}
        mode="admin"
        tabs={[
          { label: "Mapa", href: "/dashboard" },
          { label: "Respostas", href: "/admin", active: true },
          { label: "Lista oficial", href: "/admin/roster" },
        ]}
        rightSlot={
          <form action={logoutAdminAction}>
            <Button type="submit" variant="ghost" full={false} className="h-9 px-3 text-[13px]">
              Sair
            </Button>
          </form>
        }
      />

      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pb-16 pt-7 md:px-8">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
            Painel administrativo
          </div>
          <h1
            className="mt-2.5 m-0 font-display font-normal leading-none tracking-[-0.02em] text-ink"
            style={{ fontSize: 44 }}
          >
            <span className="font-display italic text-accent">{statusCounts.total}</span> resposta{statusCounts.total === 1 ? "" : "s"} no total
          </h1>
          <p className="mt-3 max-w-[520px] font-sans text-[14px] text-ink-2">
            Pendentes são entradas sem match na lista oficial — verifique e promova ou rejeite. Verificados já bateram com a lista.
          </p>
        </div>

        {/* Status filter cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              ["Todos", "", statusCounts.total],
              ["Verificados", "verified", statusCounts.verified],
              ["Pendentes", "pending", statusCounts.pending],
              ["Rejeitados", "rejected", statusCounts.rejected],
            ] as Array<[string, string, number]>
          ).map(([label, value, count]) => {
            const active = (status ?? "") === value;
            return (
              <Link
                key={label}
                href={value ? `/admin?status=${value}` : "/admin"}
                className={cn(
                  "rounded-xl border px-4 py-3.5 transition",
                  active ? "border-ink bg-surface" : "border-rule bg-surface hover:border-rule-strong",
                )}
                style={{ borderRadius: 12 }}
              >
                <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">{label}</div>
                <div
                  className="mt-1 font-display font-normal leading-none tracking-[-0.02em] text-ink"
                  style={{ fontSize: 32 }}
                >
                  {count}
                </div>
              </Link>
            );
          })}
        </div>

        {suggestions.length > 0 && (
          <Section
            title="Sugestões pendentes"
            badge={`${suggestions.length}`}
            hint="Moradores pediram esses interesses. Aprove (escolha categoria) para adicionar ao catálogo, ou rejeite."
          >
            <div className="flex flex-col gap-2.5">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-rule bg-surface-2 px-3.5 py-3"
                  style={{ borderRadius: 12 }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-sans text-[14px] font-semibold text-ink">{s.name}</div>
                    <div className="font-mono text-[10.5px] tracking-[0.05em] text-ink-3">
                      {s.profiles ? `por ${s.profiles.full_name} (${s.profiles.unit})` : "anônimo"} ·{" "}
                      {new Date(s.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <form action={approveSuggestionAction} className="flex flex-1 flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="name" value={s.name} />
                      <select
                        name="category"
                        required
                        defaultValue=""
                        className="h-9 rounded-lg border border-rule bg-surface px-2.5 font-sans text-[13px] text-ink outline-none"
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
                      <button className="rounded-md bg-accent px-3 py-1.5 font-sans text-[12px] font-medium text-white hover:opacity-90">
                        Aprovar
                      </button>
                    </form>
                    <form action={rejectSuggestionAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="rounded-md border border-rule-strong bg-transparent px-3 py-1.5 font-sans text-[12px] font-medium text-ink hover:bg-surface">
                        Rejeitar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Respostas" hint={status ? `Filtrado: ${STATUS_LABEL[status] ?? status}` : "Todas as respostas registradas."}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                  <th className="py-2.5 pr-3 font-normal">Nome / Unidade</th>
                  <th className="py-2.5 pr-3 font-normal">Perfil</th>
                  <th className="py-2.5 pr-3 font-normal">Resp.</th>
                  <th className="py-2.5 pr-3 font-normal">Status</th>
                  <th className="py-2.5 pr-3 font-normal">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center font-sans text-ink-3">
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
                    <tr key={r.id} className="border-b border-rule align-top">
                      <td className="py-3 pr-3">
                        <div className="font-sans font-semibold text-ink">{r.full_name}</div>
                        <div className="font-mono text-[11px] text-ink-3">{r.unit}</div>
                      </td>
                      <td className="py-3 pr-3 font-sans text-[12px] text-ink-2">
                        {ageLabel}
                        <br />
                        <span className="text-ink-3">{genderLabel}</span>
                      </td>
                      <td className="py-3 pr-3 font-mono text-[11px] tabular-nums text-ink-2">
                        {intCount} interesse{intCount === 1 ? "" : "s"}
                        <br />
                        <span className="text-ink-3">
                          {slotCount} hora{slotCount === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <StatusTag status={r.status} />
                        {!r.submitted && (
                          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-3">
                            não enviado
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-1.5">
                          {r.status !== "verified" && (
                            <form action={setProfileStatusAction}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="status" value="verified" />
                              <button className="rounded-md bg-accent px-2.5 py-1 font-sans text-[11.5px] font-medium text-white hover:opacity-90">
                                Verificar
                              </button>
                            </form>
                          )}
                          {r.status !== "rejected" && (
                            <form action={setProfileStatusAction}>
                              <input type="hidden" name="id" value={r.id} />
                              <input type="hidden" name="status" value="rejected" />
                              <button className="rounded-md border border-rule-strong bg-transparent px-2.5 py-1 font-sans text-[11.5px] font-medium text-ink hover:bg-surface-2">
                                Rejeitar
                              </button>
                            </form>
                          )}
                          <form action={deleteProfileAction}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="rounded-md border border-[color:var(--danger)]/40 bg-transparent px-2.5 py-1 font-sans text-[11.5px] font-medium text-[color:var(--danger)] hover:bg-[color:var(--danger)]/5">
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
        </Section>
      </div>
    </div>
  );
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified: "bg-accent-soft text-accent border-[color-mix(in_oklch,var(--accent)_25%,transparent)]",
    pending: "bg-surface-2 text-ink-2 border-rule",
    rejected: "bg-[color-mix(in_oklch,var(--danger)_8%,transparent)] text-[color:var(--danger)] border-[color-mix(in_oklch,var(--danger)_25%,transparent)]",
  };
  const label = STATUS_LABEL[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-[3px] font-sans text-[11px] font-medium",
        map[status] ?? "bg-surface-2 text-ink-2 border-rule",
      )}
    >
      {label}
    </span>
  );
}
