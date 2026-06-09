"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  addBlockAction,
  toggleBlockedDayAction,
  clearDayAction,
} from "@/lib/bt-actions";
import {
  addDays,
  BLOCK_SIZE,
  daysInMonth,
  dayOfWeek,
  formatDayLong,
  formatRange,
  KIND_META,
  monthsBetween,
  MONTH_NAMES,
  toISO,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  type MarkKind,
  type Mark,
  type Participant,
} from "@/lib/bt-types";

type Brush = "view" | "free" | "maybe" | "blocked";

type Props = {
  meId: string;
  participants: Participant[];
  marks: Mark[];
  startISO: string;
  endISO: string;
  todayISO: string;
};

const BRUSHES: { id: Brush; label: string; emoji: string }[] = [
  { id: "view", label: "Ver dia", emoji: "👁️" },
  { id: "free", label: "Livre", emoji: "🟢" },
  { id: "maybe", label: "Talvez", emoji: "🟡" },
  { id: "blocked", label: "Bloqueio", emoji: "🔴" },
];

export function Planner({ meId, participants, marks, startISO, endISO, todayISO }: Props) {
  const [brush, setBrush] = useState<Brush>("free");
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of participants) m.set(p.id, p.name);
    return m;
  }, [participants]);

  // markMap: "pid|day" -> kind ; e por-dia: contagens + minha marca
  const { myMark, freeCount, maybeCount, blockedCount, dayPeople } = useMemo(() => {
    const my = new Map<string, MarkKind>();
    const free = new Map<string, number>();
    const maybe = new Map<string, number>();
    const blocked = new Map<string, number>();
    const people = new Map<string, { free: string[]; maybe: string[]; blocked: string[] }>();
    for (const mk of marks) {
      if (mk.participant_id === meId) my.set(mk.day, mk.kind);
      const bucket = people.get(mk.day) ?? { free: [], maybe: [], blocked: [] };
      bucket[mk.kind].push(mk.participant_id);
      people.set(mk.day, bucket);
      const counter = mk.kind === "free" ? free : mk.kind === "maybe" ? maybe : blocked;
      counter.set(mk.day, (counter.get(mk.day) ?? 0) + 1);
    }
    return { myMark: my, freeCount: free, maybeCount: maybe, blockedCount: blocked, dayPeople: people };
  }, [marks, meId]);

  const total = participants.length;
  const months = useMemo(() => monthsBetween(startISO, endISO), [startISO, endISO]);

  // Atualiza com o que as outras marcaram (refresh leve a cada 15s).
  useEffect(() => {
    const id = setInterval(() => {
      if (!pendingStart && openDay === null) router.refresh();
    }, 15000);
    return () => clearInterval(id);
  }, [pendingStart, openDay, router]);

  function inRange(iso: string): boolean {
    return iso >= startISO && iso <= endISO;
  }

  function canStartBlock(iso: string): boolean {
    return inRange(iso) && addDays(iso, BLOCK_SIZE - 1) <= endISO;
  }

  function onDayTap(iso: string) {
    if (!inRange(iso)) return;
    if (brush === "view") {
      setOpenDay(iso);
      return;
    }
    if (brush === "blocked") {
      startTransition(() => toggleBlockedDayAction(iso));
      return;
    }
    // free / maybe → confirma o bloco de 3 dias
    if (!canStartBlock(iso)) return;
    setPendingStart(iso);
  }

  function confirmBlock() {
    if (!pendingStart || (brush !== "free" && brush !== "maybe")) return;
    const start = pendingStart;
    const kind = brush;
    setPendingStart(null);
    startTransition(() => addBlockAction(start, kind));
  }

  const pendingDays = useMemo(() => {
    if (!pendingStart) return new Set<string>();
    return new Set(Array.from({ length: BLOCK_SIZE }, (_, i) => addDays(pendingStart, i)));
  }, [pendingStart]);

  return (
    <div className="px-4">
      {/* Pincel / modo */}
      <div className="sticky top-0 z-20 -mx-4 mb-3 bg-bg/95 px-4 pb-2 pt-3 backdrop-blur">
        <h2 className="mb-2.5 font-display text-[22px] font-normal italic leading-none text-ink">
          Escolha e marque
        </h2>
        <div className="grid grid-cols-4 gap-1.5">
          {BRUSHES.map((b) => {
            const active = brush === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBrush(b.id);
                  setPendingStart(null);
                }}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 transition active:scale-[0.97]",
                  active ? "border-ink bg-ink text-bg" : "border-rule bg-surface text-ink-2 hover:border-rule-strong",
                )}
              >
                <span className="text-[15px] leading-none">{b.emoji}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.06em]">{b.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[10px] leading-[1.5] tracking-[0.02em] text-ink-3">
          {brush === "view" && "Toque num dia pra ver quem está livre, quem não, e o quadro completo."}
          {brush === "free" && "Toque no 1º dia de um bloco de 3 dias em que você está 100% livre."}
          {brush === "maybe" && "Toque no 1º dia de um bloco de 3 dias que você talvez consiga."}
          {brush === "blocked" && "Toque pra travar (ou destravar) dias em que você não pode, 1 a 1."}
        </p>
      </div>

      {/* Calendário */}
      <div className="flex flex-col gap-6">
        {months.map(({ year, month1 }) => (
          <MonthGrid
            key={`${year}-${month1}`}
            year={year}
            month1={month1}
            inRange={inRange}
            todayISO={todayISO}
            total={total}
            freeCount={freeCount}
            maybeCount={maybeCount}
            blockedCount={blockedCount}
            myMark={myMark}
            pendingDays={pendingDays}
            onDayTap={onDayTap}
          />
        ))}
      </div>

      {/* Barra de confirmação do bloco */}
      {pendingStart && (brush === "free" || brush === "maybe") && (
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] px-4 pb-4">
          <div className="flex items-center gap-3 rounded-2xl border border-rule-strong bg-surface p-3 shadow-lg" style={{ borderRadius: 16 }}>
            <span
              className="h-9 w-9 shrink-0 rounded-full"
              style={{ background: KIND_META[brush].dot }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-[13.5px] font-medium text-ink">
                {formatRange(pendingStart)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
                Marcar como {KIND_META[brush].label}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPendingStart(null)}
              className="rounded-lg border border-rule px-3 py-2 font-sans text-[13px] text-ink-2"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmBlock}
              disabled={pending}
              className="rounded-lg bg-ink px-4 py-2 font-sans text-[13px] font-medium text-bg disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Folha de detalhe do dia */}
      {openDay && (
        <DaySheet
          day={openDay}
          total={total}
          nameById={nameById}
          participants={participants}
          people={dayPeople.get(openDay) ?? { free: [], maybe: [], blocked: [] }}
          myMark={myMark.get(openDay) ?? null}
          onClose={() => setOpenDay(null)}
          pending={pending}
          onClear={() => startTransition(() => clearDayAction(openDay))}
          onToggleBlocked={() => startTransition(() => toggleBlockedDayAction(openDay))}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function MonthGrid({
  year,
  month1,
  inRange,
  todayISO,
  total,
  freeCount,
  maybeCount,
  blockedCount,
  myMark,
  pendingDays,
  onDayTap,
}: {
  year: number;
  month1: number;
  inRange: (iso: string) => boolean;
  todayISO: string;
  total: number;
  freeCount: Map<string, number>;
  maybeCount: Map<string, number>;
  blockedCount: Map<string, number>;
  myMark: Map<string, MarkKind>;
  pendingDays: Set<string>;
  onDayTap: (iso: string) => void;
}) {
  const ndays = daysInMonth(year, month1);
  const firstISO = toISO(year, month1, 1);
  const lead = dayOfWeek(firstISO); // quantas células vazias antes do dia 1

  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= ndays; d++) cells.push(toISO(year, month1, d));

  return (
    <section>
      <h2 className="mb-2 font-display text-[20px] font-normal italic leading-none tracking-[-0.01em] text-ink">
        {MONTH_NAMES[month1 - 1]} <span className="not-italic font-mono text-[11px] tracking-[0.04em] text-ink-3">{year}</span>
      </h2>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_SHORT.map((w, i) => (
          <div key={i} className="pb-1 text-center font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">
            {w}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />;
          const usable = inRange(iso);
          const free = freeCount.get(iso) ?? 0;
          const maybe = maybeCount.get(iso) ?? 0;
          const blocked = blockedCount.get(iso) ?? 0;
          const mine = myMark.get(iso) ?? null;
          const isPending = pendingDays.has(iso);
          const isToday = iso === todayISO;
          const dnum = Number(iso.slice(8, 10));

          // intensidade do verde pela quantidade de "livres"
          const heat = total > 0 && free > 0 ? 0.16 + 0.62 * (free / total) : 0;

          return (
            <button
              key={iso}
              type="button"
              disabled={!usable}
              onClick={() => onDayTap(iso)}
              aria-label={`${dnum} de ${MONTH_NAMES[month1 - 1]}`}
              className={cn(
                "relative flex h-12 flex-col items-center justify-center rounded-lg border transition active:scale-[0.95]",
                usable ? "border-rule" : "border-transparent opacity-25",
                isToday && "ring-1 ring-ink-3",
                isPending && "!border-ink ring-2 ring-ink",
                mine === "blocked" && "!border-bt-blocked",
                mine === "maybe" && "!border-bt-maybe",
                mine === "free" && "!border-bt-free",
              )}
              style={
                heat > 0
                  ? { background: `color-mix(in oklch, var(--bt-free) ${Math.round(heat * 100)}%, var(--surface))` }
                  : { background: usable ? "var(--surface)" : "transparent" }
              }
            >
              <span
                className={cn(
                  "font-sans text-[13px] tabular-nums leading-none",
                  heat > 0.45 ? "font-semibold text-bg" : "text-ink",
                  mine === "blocked" && "text-bt-blocked line-through",
                )}
              >
                {dnum}
              </span>

              {/* contagens da comunidade */}
              {usable && (free > 0 || maybe > 0 || blocked > 0) && (
                <span className="mt-0.5 flex items-center gap-[3px]">
                  {free > 0 && (
                    <span className={cn("font-mono text-[8.5px] leading-none", heat > 0.45 ? "text-bg" : "text-bt-free")}>
                      {free}
                    </span>
                  )}
                  {maybe > 0 && <Dot color="var(--bt-maybe)" />}
                  {blocked > 0 && <Dot color="var(--bt-blocked)" />}
                </span>
              )}

              {/* minha marca (canto) */}
              {mine && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                  style={{ background: KIND_META[mine].dot }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-[5px] w-[5px] rounded-full" style={{ background: color }} />;
}

// ---------------------------------------------------------------------------

function DaySheet({
  day,
  total,
  nameById,
  participants,
  people,
  myMark,
  onClose,
  pending,
  onClear,
  onToggleBlocked,
}: {
  day: string;
  total: number;
  nameById: Map<string, string>;
  participants: Participant[];
  people: { free: string[]; maybe: string[]; blocked: string[] };
  myMark: MarkKind | null;
  onClose: () => void;
  pending: boolean;
  onClear: () => void;
  onToggleBlocked: () => void;
}) {
  const answered = new Set([...people.free, ...people.maybe, ...people.blocked]);
  const noResponse = participants.filter((p) => !answered.has(p.id)).map((p) => p.id);
  const wd = WEEKDAY_LONG[dayOfWeek(day)];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className="relative w-full max-w-[480px] rounded-t-3xl border-t border-rule-strong bg-bg p-5 pb-7" style={{ borderTopLeftRadius: 22, borderTopRightRadius: 22 }}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-rule-strong" />
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="font-display text-[24px] font-normal italic leading-none tracking-[-0.01em] text-ink">
              {formatDayLong(day)}
            </h3>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-3">{wd}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-rule px-3 py-1.5 font-sans text-[13px] text-ink-2"
          >
            Fechar
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <PeopleRow kind="free" ids={people.free} nameById={nameById} />
          <PeopleRow kind="maybe" ids={people.maybe} nameById={nameById} />
          <PeopleRow kind="blocked" ids={people.blocked} nameById={nameById} />
          {noResponse.length > 0 && (
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full border border-rule-strong" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
                  Sem resposta · {noResponse.length}
                </p>
                <p className="text-[13px] leading-[1.4] text-ink-3">
                  {noResponse.map((id) => nameById.get(id)).join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-rule pt-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
            Sua marca neste dia
            {myMark && <span className="ml-1 normal-case tracking-normal text-ink-2">— {KIND_META[myMark].label}</span>}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleBlocked}
              disabled={pending}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2.5 font-sans text-[13px] font-medium transition disabled:opacity-50",
                myMark === "blocked"
                  ? "border-bt-blocked bg-[color:var(--bt-blocked)] text-bg"
                  : "border-rule-strong text-ink-2",
              )}
            >
              {myMark === "blocked" ? "Destravar dia" : "🔴 Não posso neste dia"}
            </button>
            {myMark && (
              <button
                type="button"
                onClick={onClear}
                disabled={pending}
                className="rounded-xl border border-rule px-3 py-2.5 font-sans text-[13px] text-ink-2 disabled:opacity-50"
              >
                Limpar
              </button>
            )}
          </div>
          <p className="mt-2.5 font-mono text-[9.5px] leading-[1.5] tracking-[0.02em] text-ink-3">
            Blocos de 3 dias (livre / talvez) são marcados no calendário, escolhendo o pincel lá em cima.
          </p>
        </div>
      </div>
    </div>
  );
}

function PeopleRow({
  kind,
  ids,
  nameById,
}: {
  kind: MarkKind;
  ids: string[];
  nameById: Map<string, string>;
}) {
  const meta = KIND_META[kind];
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: meta.dot }} />
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
          {meta.label} · {ids.length}
        </p>
        <p className="text-[13px] leading-[1.4] text-ink">
          {ids.length ? ids.map((id) => nameById.get(id)).join(", ") : "—"}
        </p>
      </div>
    </div>
  );
}
