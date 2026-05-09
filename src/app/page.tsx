import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const profileId = await getSessionProfileId();
  let alreadyStarted = false;
  if (profileId) {
    const sb = supabaseAdmin();
    const { data } = await sb.from("profiles").select("submitted").eq("id", profileId).maybeSingle();
    alreadyStarted = !!data;
  }
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "seu condomínio";

  return (
    <div className="space-y-8">
      <div className="space-y-3 pt-4 sm:pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Quem mora aqui curte o quê?
        </h1>
        <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
          Conte pra gente seus interesses e quando você está livre. A administração de {condoName} usa
          isso pra organizar aulas, grupos e encontros que façam sentido pra de verdade.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={alreadyStarted ? "/review" : "/identify"}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-base font-semibold text-white transition hover:bg-brand-700"
        >
          {alreadyStarted ? "Continuar de onde parei" : "Começar (3 minutos)"}
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Ver mapa do condomínio
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle className="text-base">1. Você se identifica</CardTitle>
          <CardDescription>
            Só nome e apartamento. Sem senha, sem email.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-base">2. Marca o que curte</CardTitle>
          <CardDescription>
            Esportes, música, idiomas, jogos, social — escolha tudo que te interessa.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-base">3. Vê onde tem gente</CardTitle>
          <CardDescription>
            Mapa visual mostra picos de interesse e horários compatíveis.
          </CardDescription>
        </Card>
      </div>

      <Card className="bg-slate-50">
        <CardTitle className="text-base">Privacidade</CardTitle>
        <CardDescription>
          Suas respostas só aparecem para você e para a administração. O mapa público é sempre agregado
          (nunca mostra nomes). Você pode editar ou apagar suas respostas a qualquer momento.
        </CardDescription>
      </Card>
    </div>
  );
}
