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

type Selection = { id: string; affinity: Affinity };

export function InterestPicker({ catalog, selectedIds, affinityById }: Props) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Map<string, Affinity>>(
    () => new Map(selectedIds.map((id) => [id, affinityById[id] ?? "curious"])),
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? catalog.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      : catalog;
    const map = new Map<string, Interest[]>();
    for (const i of filtered) {
      const arr = map.get(i.category) ?? [];
      arr.push(i);
      map.set(i.category, arr);
    }
    return Array.from(map.entries());
  }, [catalog, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, "curious");
      return next;
    });
  }

  function setAffinity(id: string, level: Affinity) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.set(id, level);
      return next;
    });
  }

  function submit(formData: FormData) {
    formData.delete("interest_id");
    formData.delete("affinity");
    for (const [id, lvl] of selected.entries()) {
      formData.append("interest_id", id);
      formData.append("affinity", `${id}:${lvl}`);
    }
    startTransition(() => {
      interestsAction(formData);
    });
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="sticky top-0 z-10 -mx-6 -mt-6 border-b border-slate-200 bg-white px-6 pb-3 pt-6">
        <Input
          placeholder="Buscar (ex: yoga, inglês, xadrez...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-slate-500">{selected.size} selecionado(s)</span>
          {selected.size > 0 && (
            <button type="button" className="text-slate-500 hover:underline" onClick={() => setSelected(new Map())}>
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {grouped.length === 0 && (
          <p className="text-sm text-slate-500">Nada encontrado para “{query}”.</p>
        )}
        {grouped.map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((i) => {
                const isSel = selected.has(i.id);
                const aff = selected.get(i.id) ?? "curious";
                return (
                  <div
                    key={i.id}
                    className={cn(
                      "rounded-xl border p-3 transition",
                      isSel ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-300",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(i.id)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <span className="text-sm font-medium text-slate-800">{i.name}</span>
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                          isSel
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-300 bg-white text-transparent",
                        )}
                      >
                        ✓
                      </span>
                    </button>
                    {isSel && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {AFFINITIES.map((a) => (
                          <button
                            key={a.value}
                            type="button"
                            onClick={() => setAffinity(i.id, a.value)}
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium transition",
                              aff === a.value
                                ? "bg-brand-600 text-white"
                                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                            )}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-slate-200 bg-white px-6 py-4">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </form>
  );
}
