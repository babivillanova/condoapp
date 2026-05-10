"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { availabilityAction } from "@/lib/actions";
import { DAYS, TURNOS } from "@/lib/types";
import { cn } from "@/lib/cn";

type Cell = `${number}:${number}`; // day:hour

type Props = { initial: Cell[] };

type CellAttr = `${number}:${string}`; // day:turnoLabel for drag detection

export function AvailabilityGrid({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [slots, setSlots] = useState<Set<Cell>>(new Set(initial));
  const dragging = useRef(false);
  const dragMode = useRef<"add" | "remove" | null>(null);

  function turnoFilled(d: number, range: readonly [number, number]) {
    for (let h = range[0]; h <= range[1]; h++) if (!slots.has(`${d}:${h}`)) return false;
    return true;
  }
  function turnoPartial(d: number, range: readonly [number, number]) {
    for (let h = range[0]; h <= range[1]; h++) if (slots.has(`${d}:${h}`)) return true;
    return false;
  }
  function setTurno(d: number, range: readonly [number, number], on: boolean) {
    setSlots((prev) => {
      const next = new Set(prev);
      for (let h = range[0]; h <= range[1]; h++) {
        const k = `${d}:${h}` as Cell;
        if (on) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }
  function startDrag(d: number, range: readonly [number, number]) {
    dragging.current = true;
    const filled = turnoFilled(d, range);
    dragMode.current = filled ? "remove" : "add";
    setTurno(d, range, !filled);
  }
  function dragOver(d: number, range: readonly [number, number]) {
    if (!dragging.current || !dragMode.current) return;
    setTurno(d, range, dragMode.current === "add");
  }
  function endDrag() {
    dragging.current = false;
    dragMode.current = null;
  }

  function selectTurnoAll(range: readonly [number, number]) {
    setSlots((prev) => {
      const next = new Set(prev);
      for (const d of DAYS) for (let h = range[0]; h <= range[1]; h++) next.add(`${d.value}:${h}` as Cell);
      return next;
    });
  }
  function clearAll() {
    setSlots(new Set());
  }

  function submit() {
    const fd = new FormData();
    for (const c of slots) fd.append("slot", c);
    startTransition(() => {
      availabilityAction(fd);
    });
  }

  return (
    <div onMouseUp={endDrag} onMouseLeave={endDrag} onTouchEnd={endDrag} className="px-5">
      {/* presets */}
      <div className="mb-[14px] flex flex-wrap gap-1.5">
        {TURNOS.map((t) => (
          <PresetChip key={t.label} onClick={() => selectTurnoAll(t.range)}>
            {t.label}
            <span className="ml-1 font-mono text-ink-3 opacity-55">{t.hint}</span>
          </PresetChip>
        ))}
        <PresetChip onClick={clearAll}>limpar</PresetChip>
      </div>

      {/* grid 7 days × 4 turnos */}
      <div className="rounded-2xl border border-rule bg-surface px-3 pt-3 pb-2.5" style={{ borderRadius: 14 }}>
        <div
          className="mb-1.5 grid gap-1"
          style={{ gridTemplateColumns: "auto repeat(7, 1fr)" }}
        >
          <div />
          {DAYS.map((d) => (
            <div
              key={d.value}
              className="text-center font-mono text-[10px] tracking-[0.06em] text-ink-3"
            >
              {d.short}
            </div>
          ))}
        </div>

        {TURNOS.map((t) => (
          <div
            key={t.label}
            className="mb-1 grid gap-1"
            style={{ gridTemplateColumns: "auto repeat(7, 1fr)" }}
          >
            <div className="flex min-w-[60px] flex-col justify-center pr-2 font-sans text-[11.5px] font-medium text-ink-2">
              <span>{t.label}</span>
              <span className="font-mono text-[9px] text-ink-3">{t.hint}</span>
            </div>
            {DAYS.map((d) => {
              const filled = turnoFilled(d.value, t.range);
              const partial = !filled && turnoPartial(d.value, t.range);
              const cellAttr: CellAttr = `${d.value}:${t.label}`;
              return (
                <button
                  key={d.value}
                  type="button"
                  data-cell={cellAttr}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    startDrag(d.value, t.range);
                  }}
                  onMouseEnter={() => dragOver(d.value, t.range)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startDrag(d.value, t.range);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    if (!touch) return;
                    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
                    const attr = el?.getAttribute("data-cell") as CellAttr | null;
                    if (!attr) return;
                    const [day, lbl] = attr.split(":");
                    const trn = TURNOS.find((x) => x.label === lbl);
                    if (trn) dragOver(parseInt(day), trn.range);
                  }}
                  className={cn(
                    "h-11 rounded-lg border transition",
                    filled && "bg-accent border-accent",
                    !filled && partial && "border-[color-mix(in_oklch,var(--accent)_50%,var(--rule))]",
                    !filled && !partial && "bg-surface-2 border-rule",
                  )}
                  style={
                    !filled && partial
                      ? { background: "color-mix(in oklch, var(--accent) 35%, var(--surface-2))" }
                      : undefined
                  }
                  aria-label={`${d.long} ${t.label}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-[10.5px] tracking-[0.04em] text-ink-3">
        {slots.size}/168 horas marcadas
      </p>

      <div className="mt-6">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Salvando..." : "Continuar →"}
        </Button>
      </div>
    </div>
  );
}

function PresetChip({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 cursor-pointer rounded-full border border-rule bg-transparent px-3 py-1.5 font-sans text-[12px] font-medium text-ink-2 transition hover:border-rule-strong"
    >
      {children}
    </button>
  );
}
