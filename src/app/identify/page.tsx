import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { identifyAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string }>;

export default async function IdentifyPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  const profileId = await getSessionProfileId();
  let prefill: { full_name: string; unit: string } | null = null;
  if (profileId) {
    const sb = supabaseAdmin();
    const { data } = await sb.from("profiles").select("full_name, unit").eq("id", profileId).maybeSingle();
    if (data) prefill = data;
  }

  return (
    <div>
      <ProgressBar current="identify" />
      <Card>
        <CardTitle>Quem é você?</CardTitle>
        <CardDescription>
          Use seu nome completo e a unidade exatamente como aparece no condomínio (ex: <em>Bloco A — Apto 302</em>
          ).
        </CardDescription>

        <form action={identifyAction} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              name="full_name"
              required
              autoComplete="name"
              defaultValue={prefill?.full_name ?? ""}
              placeholder="Maria da Silva"
            />
          </div>

          <div>
            <Label htmlFor="unit">Unidade / apartamento</Label>
            <Input
              id="unit"
              name="unit"
              required
              autoComplete="off"
              defaultValue={prefill?.unit ?? ""}
              placeholder="Bloco A — Apto 302"
            />
          </div>

          {error === "missing" && (
            <p className="text-sm text-red-600">Preencha nome e unidade para continuar.</p>
          )}

          <Button type="submit" size="lg" className="w-full">
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
}
