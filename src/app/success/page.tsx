import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function SuccessPage() {
  const profileId = await getSessionProfileId();
  let firstName = "vizinho";
  if (profileId) {
    const sb = supabaseAdmin();
    const { data } = await sb.from("profiles").select("full_name").eq("id", profileId).maybeSingle();
    if (data?.full_name) firstName = data.full_name.split(" ")[0];
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col px-6 pt-20 pb-7">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">Tudo certo</div>

      <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-accent font-display text-[32px] text-surface">
        ✓
      </div>

      <h1
        className="mt-6 m-0 font-display text-[38px] font-normal leading-[1] tracking-[-0.02em] text-ink"
        style={{ textWrap: "pretty" }}
      >
        Obrigado,
        <br />
        <span className="font-display italic text-accent">{firstName}.</span>
      </h1>

      <p className="mt-4 max-w-[320px] font-sans text-[15px] leading-[1.5] text-ink-2">
        Suas respostas foram registradas e somam ao mapa do prédio. Quando juntar massa crítica num
        interesse, a administração avisa.
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-2.5">
        <Link href="/dashboard" className="contents">
          <Button>Ver mapa do condomínio →</Button>
        </Link>
        <Link href="/identify" className="contents">
          <Button variant="ghost">Refazer minhas respostas</Button>
        </Link>
      </div>
    </div>
  );
}
