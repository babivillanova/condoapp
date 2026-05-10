"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { interestsAction } from "@/lib/actions";
import { AFFINITIES, type Affinity, type Interest } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  catalog: Interest[];
  selectedIds: string[];
  affinityById: Record<string, Affinity>;
};

const LEVEL_ORDER: Affinity[] = ["beginner", "intermediate", "advanced"];
const LEVEL_SHORT: Record<Affinity, string> = { beginner: "I", intermediate: "II", advanced: "III" };

function nextLevel(a: Affinity): Affinity {
  const idx = LEVEL_ORDER.indexOf(a);
  return LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length];
}

export function InterestPicker({ catalog, selectedIds, affinityById }: Props) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selected, setSelected] = useState<Map<string, Affinity>>(
    () => new Map(selectedIds.map((id) => [id, affinityById[id] ?? "beginner"])),
  );

  const allCategories = useMemo(() => {
    return Array.from(new Set(catalog.map((i) => i.category)));
  }, [catalog]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((i) => {
      if (activeCat && i.category !== activeCat) return false;
      if (!q) return true;
      return i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    });
  }, [catalog, query, activeCat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Interest[]>();
    for (const i of filtered) {
      const arr = map.get(i.category) ?? [];
      arr.push(i);
      map.set(i.category, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, "beginner");
      return next;
    });
  }

  function cycleLevel(id: string) {
    setSelected((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.set(id, nextLevel(prev.get(id)!));
      return next;
    });
  }

  function submit() {
    const fd = new FormData();
    for (const [id, lvl] of selected.entries()) {
      fd.append("interest_id", id);
      fd.append("affinity", `${id}:${lvl}`);
    }
    startTransition(() => {
      interestsAction(fd);
    });
  }

  return (
    <div className="space-y-4">
      {/* Sticky search + category chips */}
      <div className="sticky top-0 z-10 -mx-6 -mt-6 space-y-3 border-b border-slate-200 bg-white px-6 pb-3 pt-6">
        <Input
          placeholder="Buscar (ex: yoga, samba, alemão...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="-mx-1 overflow-x-auto">
          <div className="flex gap-1.5 px-1 pb-1">
            <button
              type="button"
              onClick={() => setActiveCat(null)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
                !activeCat ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Todas
            </button>
            {allCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c === activeCat ? null : c)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition",
                  activeCat === c ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {selected.size} selecionado(s) · toque o nível (I → II → III) para mudar
          </span>
          {selected.size > 0 && (
            <button type="button" className="text-slate-500 hover:underline" onClick={() => setSelected(new Map())}>
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Pills */}
      <div className="space-y-5">
        {grouped.length === 0 && (
          <p className="text-sm text-slate-500">Nada encontrado para “{query}”.</p>
        )}
        {grouped.map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</h3>
            <div className="flex flex-wrap gap-1.5">
              {items.map((i) => {
                const isSel = selected.has(i.id);
                const lvl = selected.get(i.id) ?? "beginner";
                return (
                  <div
                    key={i.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(i.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(i.id);
                      }
                    }}
                    className={cn(
                      "inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                      isSel
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-brand-300",
                    )}
                  >
                    <span className="font-medium">{i.name}</span>
                    {isSel && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleLevel(i.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            cycleLevel(i.id);
                          }
                        }}
                        className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold tracking-wider hover:bg-white/40"
                        title={AFFINITIES.find((a) => a.value === lvl)?.label}
                      >
                        {LEVEL_SHORT[lvl]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-slate-200 bg-white px-6 py-4">
        <Button type="button" size="lg" className="w-full" onClick={submit} disabled={pending}>
          {pending ? "Salvando..." : `Continuar (${selected.size})`}
        </Button>
      </div>
    </div>
  );
}
