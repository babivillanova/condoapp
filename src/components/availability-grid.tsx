"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { availabilityAction } from "@/lib/actions";
import { DAYS, HOURS, TURNOS } from "@/lib/types";
import { cn } from "@/lib/cn";

type Cell = `${number}:${number}`; // day:hour

type Props = { initial: Cell[] };

export function AvailabilityGrid({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<Cell>>(new Set(initial));
  const dragMode = useRef<"add" | "remove" | null>(null);
  const dragging = useRef(false);

  function key(day: number, hour: number): Cell {
    return `${day}:${hour}` as Cell;
  }

  function apply(c: Cell, mode: "add" | "remove") {
    setSelected((prev) => {
      const next = new Set(prev);
      if (mode === "add") next.add(c);
      else next.delete(c);
      return next;
    });
  }

  function startDrag(c: Cell) {
    dragging.current = true;
    const mode: "add" | "remove" = selected.has(c) ? "remove" : "add";
    dragMode.current = mode;
    apply(c, mode);
  }

  function dragOver(c: Cell) {
    if (!dragging.current || !dragMode.current) return;
    apply(c, dragMode.current);
  }

  function endDrag() {
    dragging.current = false;
    dragMode.current = null;
  }

  function selectAll() {
    const all: Cell[] = [];
    for (const d of DAYS) for (const h of HOURS) all.push(key(d.value, h));
    setSelected(new Set(all));
  }

  function clear() {
    setSelected(new Set());
  }

  function selectTurno(rangeStart: number, rangeEnd: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const d of DAYS) for (let h = rangeStart; h <= rangeEnd; h++) next.add(key(d.value, h));
      return next;
    });
  }

  function selectWeekend() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const d of [0, 6]) for (const h of HOURS) next.add(key(d, h));
      return next;
    });
  }

  function toggleHourRow(hour: number) {
    setSelected((prev) => {
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
    setSelected((prev) => {
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
    for (const c of selected) fd.append("slot", c);
    startTransition(() => {
      availabilityAction(fd);
    });
  }

  return (
    <div onMouseUp={endDrag} onMouseLeave={endDrag} onTouchEnd={endDrag}>
      {/* Quick presets */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button type="button" onClick={selectAll} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Tudo
        </button>
        <button type="button" onClick={selectWeekend} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Fim de semana
        </button>
        {TURNOS.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => selectTurno(t.range[0], t.range[1])}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
          >
            {t.label} ({t.hint})
          </button>
        ))}
        <button type="button" onClick={clear} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Limpar
        </button>
        <span className="ml-auto self-center text-xs text-slate-500">{selected.size}/168</span>
      </div>

      {/* Hint */}
      <p className="mb-2 text-xs text-slate-500">
        Toque (ou arraste) para marcar. Toque a hora para selecionar a linha inteira; toque o dia para a coluna.
      </p>

      <div className="overflow-x-auto">
        <div className="grid select-none gap-[2px]" style={{ gridTemplateColumns: "auto repeat(7, minmax(36px, 1fr))" }}>
          <div />
          {DAYS.map((d) => (
            <button
              type="button"
              key={d.value}
              onClick={() => toggleDayCol(d.value)}
              className="pb-1.5 text-center text-[10px] font-semibold uppercase text-slate-500 hover:text-brand-700"
            >
              {d.short}
            </button>
          ))}

          {HOURS.map((h) => {
            const turnoBg =
              h < 6 ? "bg-slate-50/60" : h < 12 ? "bg-amber-50/40" : h < 18 ? "bg-sky-50/40" : "bg-indigo-50/40";
            return (
              <div key={h} className="contents">
                <button
                  type="button"
                  onClick={() => toggleHourRow(h)}
                  className="pr-1.5 text-right text-[10px] font-medium tabular-nums text-slate-500 hover:text-brand-700"
                >
                  {String(h).padStart(2, "0")}h
                </button>
                {DAYS.map((d) => {
                  const c = key(d.value, h);
                  const sel = selected.has(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        startDrag(c);
                      }}
                      onMouseEnter={() => dragOver(c)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        startDrag(c);
                      }}
                      onTouchMove={(e) => {
                        const touch = e.touches[0];
                        if (!touch) return;
                        const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
                        const cellAttr = el?.getAttribute("data-cell") as Cell | null;
                        if (cellAttr) dragOver(cellAttr);
                      }}
                      data-cell={c}
                      className={cn(
                        "h-7 rounded-sm border text-[10px] transition",
                        sel
                          ? "border-brand-600 bg-brand-500"
                          : `border-slate-200 ${turnoBg} hover:border-brand-300`,
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

      <div className="mt-6">
        <Button type="button" size="lg" className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
