import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Masthead } from "@/components/masthead";
import { Section } from "@/components/section";
import { isAdmin } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import {
  addRosterAction,
  deleteRosterAction,
  importRosterCsvAction,
  logoutAdminAction,
} from "@/lib/admin-actions";
import { UNIT_HELP, UNIT_PATTERN, UNIT_PLACEHOLDER } from "@/lib/unit";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("residents_roster")
    .select("id, full_name, unit, created_at")
    .order("unit")
    .order("full_name");
  const rows = data ?? [];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Masthead
        condoName={condoName}
        mode="admin"
        tabs={[
          { label: "Mapa", href: "/dashboard" },
          { label: "Respostas", href: "/admin" },
          { label: "Lista oficial", href: "/admin/roster", active: true },
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
            Lista oficial de moradores
          </div>
          <h1
            className="mt-2.5 m-0 font-display font-normal leading-none tracking-[-0.02em] text-ink"
            style={{ fontSize: 44 }}
          >
            <span className="font-display italic text-accent">{rows.length}</span> morador{rows.length === 1 ? "" : "es"} cadastrado{rows.length === 1 ? "" : "s"}
          </h1>
          <p className="mt-3 max-w-[520px] font-sans text-[14px] text-ink-2">
            Essa lista é a fonte de verdade que o servidor compara silenciosamente com cada nova resposta.
            Nunca aparece pro morador. Use exatamente como aparece nos registros do prédio.
          </p>
        </div>

        <Section title="Adicionar morador" hint={`Nome como aparece nos registros + unidade no formato ${UNIT_PLACEHOLDER}`}>
          <form action={addRosterAction} className="grid items-end gap-3 sm:grid-cols-[2fr_1fr_auto]">
            <Field label="Nome" id="full_name" name="full_name" required placeholder="Maria da Silva" />
            <Field
              label="Unidade"
              id="unit"
              name="unit"
              required
              placeholder={UNIT_PLACEHOLDER}
              pattern={UNIT_PATTERN}
              title={UNIT_HELP}
              maxLength={6}
              style={{ textTransform: "uppercase" }}
              mono
            />
            <div>
              <Button type="submit" full={false}>
                Adicionar
              </Button>
            </div>
          </form>
        </Section>

        <Section
          title="Importar CSV"
          hint={
            <>
              Linhas <code className="rounded bg-surface-2 px-1 font-mono text-[12px]">Nome, Unidade</code> — uma por linha. Unidade no formato {UNIT_PLACEHOLDER}. Linhas inválidas são ignoradas silenciosamente.
            </>
          }
        >
          <form action={importRosterCsvAction} className="space-y-3">
            <textarea
              name="csv"
              rows={6}
              className="w-full rounded-xl border border-rule bg-surface-2 p-3.5 font-mono text-[13px] text-ink outline-none focus:border-ink"
              placeholder={"Nome, Unidade\nMaria da Silva, A1\nJoão Souza, B102"}
            />
            <Button type="submit" variant="ghost" full={false}>
              Importar
            </Button>
          </form>
        </Section>

        <Section title="Lista atual" hint={`${rows.length} entrada${rows.length === 1 ? "" : "s"}.`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-rule font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                  <th className="py-2.5 pr-3 font-normal">Nome</th>
                  <th className="py-2.5 pr-3 font-normal">Unidade</th>
                  <th className="py-2.5 pr-3 font-normal" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center font-sans text-ink-3">
                      Lista vazia. Adicione moradores acima ou importe um CSV.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-rule">
                    <td className="py-2.5 pr-3 font-sans text-ink">{r.full_name}</td>
                    <td className="py-2.5 pr-3 font-mono text-[12px] text-ink-2">{r.unit}</td>
                    <td className="py-2.5 pr-3 text-right">
                      <form action={deleteRosterAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="font-sans text-[12px] font-medium text-[color:var(--danger)] hover:underline">
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}
