"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { addBlockAction } from "@/lib/bt-actions";
import { formatRange, type Participant } from "@/lib/bt-types";

type Window = {
  startISO: string;
  free: string[];
  maybe: string[];
  blocked: string[];
};

export function BestWindows({
  windows,
  participants,
  meId,
}: {
  windows: Window[];
  participants: Participant[];
  meId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);
  const total = participants.length;

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of participants) m.set(p.id, p.name.split(" ")[0]);
    return m;
  }, [participants]);

  if (windows.length === 0) {
    return (
      <div className="rounded-2xl border border-rule bg-surface p-5 text-center" style={{ borderRadius: 14 }}>
        <p className="font-display text-[20px] italic text-ink">Ainda nada combina</p>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-3">
          Assim que vocês marcarem alguns blocos livres, os melhores 3 dias aparecem aqui.
        </p>
      </div>
    );
  }

  const shown = showAll ? windows.slice(0, 12) : windows.slice(0, 4);

  return (
    <div className="flex flex-col gap-2.5">
      {shown.map((w) => {
        const iFree = w.free.includes(meId);
        const iMaybe = w.maybe.includes(meId);
        const iBlocked = w.blocked.includes(meId);
        const potential = w.free.length + w.maybe.length;
        return (
          <div
            key={w.startISO}
            className="rounded-2xl border border-rule bg-surface p-4"
            style={{ borderRadius: 14 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[19px] font-normal italic leading-tight text-ink">
                  {formatRange(w.startISO)}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3">
                  {w.free.length} de {total} livres
                  {w.maybe.length > 0 && ` · +${w.maybe.length} talvez`}
                  {w.blocked.length > 0 && ` · ${w.blocked.length} não`}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bt-free">
                <span className="font-sans text-[15px] font-semibold text-bt-free tabular-nums">{potential}</span>
              </div>
            </div>

            {/* barra de proporção */}
            <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-surface-2">
              <span className="bg-bt-free" style={{ width: `${(w.free.length / total) * 100}%` }} />
              <span className="bg-bt-maybe" style={{ width: `${(w.maybe.length / total) * 100}%` }} />
              <span className="bg-bt-blocked" style={{ width: `${(w.blocked.length / total) * 100}%` }} />
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-[12px] text-ink-3">
                {w.free.length > 0
                  ? w.free.map((id) => nameById.get(id)).join(", ")
                  : "ninguém 100% ainda"}
              </p>
              {iBlocked ? (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-bt-blocked">
                  você travou
                </span>
              ) : iFree ? (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] text-bt-free">
                  você ✓
                </span>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => addBlockAction(w.startISO, "free"))}
                  className={cn(
                    "shrink-0 rounded-lg border border-rule-strong px-3 py-1.5 font-sans text-[12px] font-medium text-ink-2 transition disabled:opacity-50",
                  )}
                >
                  {iMaybe ? "Confirmar livre" : "Eu topo"}
                </button>
              )}
            </div>
          </div>
        );
      })}

      {windows.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mx-auto mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3 underline-offset-4 hover:underline"
        >
          {showAll ? "ver menos" : `ver mais (${Math.min(windows.length, 12) - 4})`}
        </button>
      )}
    </div>
  );
}
