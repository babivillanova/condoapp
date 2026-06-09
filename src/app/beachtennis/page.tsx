import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { Italic } from "@/components/title-block";
import { joinAction } from "@/lib/bt-actions";
import { getBtParticipantId } from "@/lib/session";
import { getParticipant, loadParticipants } from "@/lib/bt-data";

export const dynamic = "force-dynamic";

export default async function BeachTennisHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Só redireciona se o participante do cookie ainda existir — senão um cookie
  // "órfão" (apontando pra alguém apagado) causaria loop home ↔ /plan.
  const participantId = await getBtParticipantId();
  if (participantId && (await getParticipant(participantId))) {
    redirect("/beachtennis/plan");
  }

  const { error } = await searchParams;
  const participants = await loadParticipants();

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <div className="px-5 pt-[52px]">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
          <span className="h-[1px] w-[14px] bg-ink-3" />
          Beach Tennis · O Rancho
        </div>
      </div>

      <div className="px-5 pt-9">
        <h1
          className="m-0 font-display font-normal leading-[1.05] tracking-[-0.025em] text-ink"
          style={{ fontSize: 52, textWrap: "pretty" }}
        >
          Qual o melhor
          <br />
          <Italic>fim de semana</Italic> pra todas?
        </h1>
        <p
          className="mt-7 max-w-[340px] font-sans text-[15.5px] leading-[1.5] text-ink-2"
          style={{ textWrap: "pretty" }}
        >
          A gente quer 3 dias seguidos pra juntar a turma e jogar beach tennis. Marque no calendário
          os blocos em que você está livre, os que você <em>talvez</em> consiga, e trave os dias que
          não dá. Conforme cada uma preenche, dá pra ver onde todo mundo se encontra.
        </p>
      </div>

      <div className="flex-1" />

      <form action={joinAction} className="flex flex-col gap-3 px-5 pt-2 pb-7">
        <Field label="Seu nome" name="name" placeholder="Ex.: Bárbara" autoComplete="off" autoFocus required />
        {error === "name" && (
          <p className="font-mono text-[11px] text-[color:var(--danger)]">
            Coloque um nome entre 2 e 40 letras.
          </p>
        )}
        <Button type="submit">Entrar e começar →</Button>

        {participants.length > 0 && (
          <p className="mt-2 text-center font-mono text-[10.5px] leading-[1.6] tracking-[0.04em] text-ink-3">
            {participants.length === 1 ? "1 amiga já entrou" : `${participants.length} amigas já entraram`}:{" "}
            {participants.map((p) => p.name.split(" ")[0]).join(", ")}.
            <br />
            Digite o mesmo nome pra voltar ao seu calendário.
          </p>
        )}
      </form>
    </div>
  );
}
