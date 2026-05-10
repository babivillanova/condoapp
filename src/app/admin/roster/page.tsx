import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { isAdmin } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { addRosterAction, deleteRosterAction, importRosterCsvAction } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const sb = supabaseAdmin();
  const { data } = await sb.from("residents_roster").select("id, full_name, unit, created_at").order("unit").order("full_name");
  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lista oficial de moradores</h1>
          <p className="text-sm text-slate-600">{rows.length} morador(es) cadastrado(s).</p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand-700 hover:underline">← Voltar</Link>
      </div>

      <Card>
        <CardTitle className="text-base">Adicionar morador</CardTitle>
        <CardDescription>Use o nome completo como aparece nos registros do condomínio.</CardDescription>
        <form action={addRosterAction} className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <div>
            <Label htmlFor="full_name">Nome</Label>
            <Input id="full_name" name="full_name" required placeholder="Maria da Silva" />
          </div>
          <div>
            <Label htmlFor="unit">Unidade</Label>
            <Input id="unit" name="unit" required placeholder="Bloco A — Apto 302" />
          </div>
          <div className="self-end">
            <Button type="submit" className="h-11">Adicionar</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardTitle className="text-base">Importar CSV</CardTitle>
        <CardDescription>
          Cole linhas no formato <code className="rounded bg-slate-100 px-1">Nome, Unidade</code>. Uma por linha. A primeira pode ser cabeçalho.
        </CardDescription>
        <form action={importRosterCsvAction} className="mt-4 space-y-3">
          <textarea
            name="csv"
            rows={6}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder={"Nome, Unidade\nMaria da Silva, Bloco A — Apto 302\nJoão Souza, Bloco B — Apto 101"}
          />
          <Button type="submit" variant="ghost" full={false}>Importar</Button>
        </form>
      </Card>

      <Card>
        <CardTitle className="text-base">Lista atual</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Unidade</th>
                <th className="py-2 pr-3" />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-500">
                    Lista vazia. Adicione moradores acima ou importe um CSV.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3 text-slate-900">{r.full_name}</td>
                  <td className="py-2 pr-3 text-slate-600">{r.unit}</td>
                  <td className="py-2 pr-3 text-right">
                    <form action={deleteRosterAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="text-xs font-medium text-red-600 hover:underline">Remover</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
