"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { availabilityAction } from "@/lib/actions";
import { DAYS, HOURS, TURNOS } from "@/lib/types";
import { cn } from "@/lib/cn";

type Cell = `${number}:${number}`;

type Props = { initial: Cell[] };

export function AvailabilityGrid({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [slots, setSlots] = useState<Set<Cell>>(new Set(initial));
  const dragging = useRef(false);
  const dragMode = useRef<"add" | "remove" | null>(null);
  // Tracks whether the pointer actually moved across cells during the press.
  // If it didn't, we treat the gesture as a single click (toggle).
  const dragMovedRef = useRef(false);
  const startedFromCellRef = useRef<Cell | null>(null);

  function key(d: number, h: number): Cell {
    return `${d}:${h}` as Cell;
  }

  function applyState(c: Cell, mode: "add" | "remove") {
    setSlots((prev) => {
      const next = new Set(prev);
      if (mode === "add") next.add(c);
      else next.delete(c);
      return next;
    });
  }

  function toggleCell(c: Cell) {
    setSlots((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  function onPressStart(c: Cell, e: React.MouseEvent | React.TouchEvent) {
    // Prevent text selection / scroll glitches during drag.
    e.preventDefault();
    dragging.current = true;
    dragMovedRef.current = false;
    startedFromCellRef.current = c;
    dragMode.current = slots.has(c) ? "remove" : "add";
  }

  function onPressEnter(c: Cell) {
    if (!dragging.current || !dragMode.current) return;
    // Once we move onto a different cell, this is a drag, not a click.
    if (startedFromCellRef.current !== c) {
      dragMovedRef.current = true;
      applyState(c, dragMode.current);
    }
  }

  function onPressEnd(c: Cell) {
    // If we never moved, treat as click → toggle the cell.
    if (dragging.current && !dragMovedRef.current && startedFromCellRef.current === c) {
      toggleCell(c);
    } else if (dragging.current && dragMode.current && dragMovedRef.current) {
      // Make sure the starting cell got its state applied too (for drag case).
      const start = startedFromCellRef.current;
      if (start) applyState(start, dragMode.current);
    }
    dragging.current = false;
    dragMode.current = null;
    startedFromCellRef.current = null;
    dragMovedRef.current = false;
  }

  function cancelDrag() {
    dragging.current = false;
    dragMode.current = null;
    startedFromCellRef.current = null;
    dragMovedRef.current = false;
  }

  function selectAll() {
    const all: Cell[] = [];
    for (const d of DAYS) for (const h of HOURS) all.push(key(d.value, h));
    setSlots(new Set(all));
  }

  function clear() {
    setSlots(new Set());
  }

  function selectTurno(rangeStart: number, rangeEnd: number) {
    setSlots((prev) => {
      const next = new Set(prev);
      for (const d of DAYS) for (let h = rangeStart; h <= rangeEnd; h++) next.add(key(d.value, h));
      return next;
    });
  }

  function selectWeekend() {
    setSlots((prev) => {
      const next = new Set(prev);
      for (const d of [0, 6]) for (const h of HOURS) next.add(key(d, h));
      return next;
    });
  }

  function toggleHourRow(hour: number) {
    setSlots((prev) => {
      const next = new Set(prev);
      const allOn = DAYS.every((d) => next.has(key(d.value, hour)));
      for (const d of DAYS) {
        const c = key(d.value, hour);
        if (allOn) next.delete(c);
        else next.add(c);
      }
      return next;
    });
  }

  function toggleDayCol(day: number) {
    setSlots((prev) => {
      const next = new Set(prev);
      const allOn = HOURS.every((h) => next.has(key(day, h)));
      for (const h of HOURS) {
        const c = key(day, h);
        if (allOn) next.delete(c);
        else next.add(c);
      }
      return next;
    });
  }

  function submit() {
    const fd = new FormData();
    for (const c of slots) fd.append("slot", c);
    startTransition(() => {
      availabilityAction(fd);
    });
  }

  return (
    <div onMouseUp={cancelDrag} onMouseLeave={cancelDrag} onTouchEnd={cancelDrag} className="px-5">
      {/* Quick presets */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <PresetChip onClick={selectAll}>Tudo</PresetChip>
        <PresetChip onClick={selectWeekend}>Fim de semana</PresetChip>
        {TURNOS.map((t) => (
          <PresetChip key={t.label} onClick={() => selectTurno(t.range[0], t.range[1])}>
            {t.label} <span className="ml-1 font-mono text-ink-3 opacity-60">{t.hint}</span>
          </PresetChip>
        ))}
        <PresetChip onClick={clear}>Limpar</PresetChip>
      </div>

      <p className="mb-2.5 font-mono text-[10px] tracking-[0.05em] text-ink-3">
        Toque cada hora para marcar/desmarcar. Arrastar pra selecionar várias também funciona.
      </p>

      {/* Grid 24 hours × 7 days */}
      <div className="rounded-2xl border border-rule bg-surface px-2.5 pt-2.5 pb-2" style={{ borderRadius: 14 }}>
        <div
          className="mb-1.5 grid select-none"
          style={{ gridTemplateColumns: "auto repeat(7, 1fr)", gap: "2px" }}
        >
          <div />
          {DAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDayCol(d.value)}
              className="pb-1 text-center font-mono text-[10px] uppercase tracking-[0.06em] text-ink-3 transition hover:text-ink"
            >
              {d.short}
            </button>
          ))}

          {HOURS.map((h) => {
            const turnoTint =
              h < 6
                ? "bg-surface-2"
                : h < 12
                  ? "bg-[rgba(240,212,150,0.18)]"
                  : h < 18
                    ? "bg-[rgba(174,213,235,0.18)]"
                    : "bg-[rgba(180,170,210,0.20)]";
            return (
              <div key={h} className="contents">
                <button
                  type="button"
                  onClick={() => toggleHourRow(h)}
                  className="pr-1.5 text-right font-mono text-[9.5px] tabular-nums text-ink-3 transition hover:text-ink"
                >
                  {String(h).padStart(2, "0")}h
                </button>
                {DAYS.map((d) => {
                  const c = key(d.value, h);
                  const sel = slots.has(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      data-cell={c}
                      onMouseDown={(e) => onPressStart(c, e)}
                      onMouseEnter={() => onPressEnter(c)}
                      onMouseUp={() => onPressEnd(c)}
                      onTouchStart={(e) => onPressStart(c, e)}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        if (!touch) return;
                        const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
                        const attr = el?.getAttribute("data-cell") as Cell | null;
                        if (attr) onPressEnter(attr);
                      }}
                      onTouchEnd={() => onPressEnd(c)}
                      className={cn(
                        "h-7 rounded-md border transition active:scale-[0.96]",
                        sel
                          ? "border-accent bg-accent"
                          : `border-rule ${turnoTint} hover:border-ink`,
                      )}
                      aria-pressed={sel}
                      aria-label={`${d.long} ${String(h).padStart(2, "0")}h`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
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
