import { redirect } from "next/navigation";
import { getBtParticipantId } from "@/lib/session";
import {
  getParticipant,
  loadParticipants,
  loadMarks,
  planningRange,
  scoreWindows,
} from "@/lib/bt-data";
import { leaveAction } from "@/lib/bt-actions";
import { KIND_META } from "@/lib/bt-types";
import { Planner } from "@/components/bt/planner";
import { BestWindows } from "@/components/bt/best-windows";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const meId = await getBtParticipantId();
  if (!meId) redirect("/beachtennis");

  const me = await getParticipant(meId);
  if (!me) redirect("/beachtennis");

  const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );
  const { startISO, endISO } = planningRange(todayISO);

  const [participants, marks] = await Promise.all([loadParticipants(), loadMarks()]);
  const windows = scoreWindows(participants, marks, startISO, endISO).map((w) => ({
    startISO: w.startISO,
    free: w.free,
    maybe: w.maybe,
    blocked: w.blocked,
  }));

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col pb-12">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between px-4 pt-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
            <span className="h-[1px] w-[12px] bg-ink-3" />
            Beach Tennis
          </div>
          <h1 className="mt-1 font-display text-[26px] font-normal italic leading-none tracking-[-0.01em] text-ink">
            Oi, {me.name.split(" ")[0]}
          </h1>
        </div>
        <form action={leaveAction}>
          <button
            type="submit"
            className="rounded-lg border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3"
          >
            Sair
          </button>
        </form>
      </header>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4">
        {(["free", "maybe", "blocked"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND_META[k].dot }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-ink-2">
              {KIND_META[k].label}
            </span>
          </span>
        ))}
        <span className="font-mono text-[10px] tracking-[0.04em] text-ink-3">
          fundo verde = quantas estão livres
        </span>
      </div>

      {/* Melhores 3 dias */}
      <section className="mt-5 px-4">
        <h2 className="mb-2.5 flex items-baseline gap-2">
          <span className="font-display text-[22px] font-normal italic leading-none text-ink">
            Melhores 3 dias
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
            {participants.length} {participants.length === 1 ? "amiga" : "amigas"}
          </span>
        </h2>
        <BestWindows windows={windows} participants={participants} meId={meId} />
      </section>

      {/* Calendário */}
      <section className="mt-7">
        <Planner
          meId={meId}
          participants={participants}
          marks={marks}
          startISO={startISO}
          endISO={endISO}
          todayISO={todayISO}
        />
      </section>
    </div>
  );
}
