import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NeighborhoodPulse } from "@/components/neighborhood-pulse";
import { Italic } from "@/components/title-block";
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
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  // total submitted profiles (for the pulse caption)
  const sb = supabaseAdmin();
  const { count } = await sb.from("profiles").select("id", { count: "exact", head: true }).eq("submitted", true);
  const totalRespondents = count ?? 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <div className="px-5 pt-[52px]">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
          <span className="h-[1px] w-[14px] bg-ink-3" />
          {condoName}
        </div>
      </div>

      <div className="px-5 pt-9">
        <h1
          className="m-0 font-display font-normal leading-[1.05] tracking-[-0.025em] text-ink"
          style={{ fontSize: 56, textWrap: "pretty" }}
        >
          Quem mora aqui
          <br />
          <Italic>curte o quê?</Italic>
        </h1>
        <p
          className="mt-8 max-w-[320px] font-sans text-[15.5px] leading-[1.5] text-ink-2"
          style={{ textWrap: "pretty" }}
        >
          Conte os seus interesses e quando você está livre. A administração usa isso pra organizar
          aulas, grupos e encontros que façam sentido pra quem mora aqui.
        </p>
      </div>

      <div className="px-5 pt-9 pb-6">
        <NeighborhoodPulse totalRespondents={totalRespondents} />
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5 px-5 pt-2 pb-7">
        <Link href={alreadyStarted ? "/review" : "/identify"} className="contents">
          <Button>{alreadyStarted ? "Continuar de onde parei →" : "Começar — leva 3 minutos →"}</Button>
        </Link>
        <Link href="/dashboard" className="contents">
          <Button variant="ghost">Ver mapa do condomínio</Button>
        </Link>
        <p className="mt-3 text-center font-mono text-[10.5px] leading-[1.5] tracking-[0.06em] text-ink-3">
          Sem senha. Sem email. Você pode
          <br />
          apagar tudo a qualquer momento.
        </p>
      </div>
    </div>
  );
}
