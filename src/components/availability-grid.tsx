"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { availabilityAction } from "@/lib/actions";
import { DAYS, TIME_SLOTS, type TimeSlot } from "@/lib/types";
import { cn } from "@/lib/cn";

type Cell = `${number}:${TimeSlot}`;

type Props = { initial: Cell[] };

export function AvailabilityGrid({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<Cell>>(new Set(initial));
  const dragMode = useRef<"add" | "remove" | null>(null);
  const dragging = useRef(false);

  function key(day: number, slot: TimeSlot): Cell {
    return `${day}:${slot}` as Cell;
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
    for (const d of DAYS) for (const t of TIME_SLOTS) all.push(key(d.value, t.value));
    setSelected(new Set(all));
  }
  function selectWeekend() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const d of [0, 6]) for (const t of TIME_SLOTS) next.add(key(d, t.value));
      return next;
    });
  }
  function clear() {
    setSelected(new Set());
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
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={selectAll} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Selecionar tudo
        </button>
        <button type="button" onClick={selectWeekend} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Fins de semana
        </button>
        <button type="button" onClick={clear} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
          Limpar
        </button>
        <span className="ml-auto self-center text-xs text-slate-500">{selected.size} de 28 turnos</span>
      </div>

      <div className="overflow-x-auto">
        <div className="grid select-none gap-1" style={{ gridTemplateColumns: "auto repeat(7, minmax(48px, 1fr))" }}>
          <div />
          {DAYS.map((d) => (
            <div key={d.value} className="pb-2 text-center text-xs font-semibold uppercase text-slate-500">
              {d.short}
            </div>
          ))}
          {TIME_SLOTS.map((t) => (
            <div key={t.value} className="contents">
              <div className="flex flex-col justify-center pr-2 text-right">
                <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                <span className="text-[10px] text-slate-400">{t.hint}</span>
              </div>
              {DAYS.map((d) => {
                const c = key(d.value, t.value);
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
                      "h-12 rounded-md border text-sm transition",
                      sel
                        ? "border-brand-600 bg-brand-500 text-white"
                        : "border-slate-200 bg-white text-slate-400 hover:border-brand-300",
                    )}
                    aria-pressed={sel}
                    aria-label={`${d.long} ${t.label}`}
                  >
                    {sel ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          ))}
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
