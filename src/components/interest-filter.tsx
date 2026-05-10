"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Interest = { id: string; name: string; category: string };

type Props = {
  interests: Interest[];
  selectedIds: string[];
  paramsString: string; // current URL search string (sem '?')
};

export function InterestFilter({ interests, selectedIds, paramsString }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selected = useMemo(
    () => selectedIds.map((id) => interests.find((i) => i.id === id)).filter((x): x is Interest => !!x),
    [interests, selectedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = interests.filter((i) => !selectedSet.has(i.id));
    if (!q) return pool.slice(0, 30);
    return pool
      .filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .slice(0, 30);
  }, [interests, query, selectedSet]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function navigate(nextIds: string[]) {
    const params = new URLSearchParams(paramsString);
    if (nextIds.length) params.set("interest", nextIds.join(","));
    else params.delete("interest");
    params.delete("submitted");
    const qs = params.toString();
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  }

  function add(id: string) {
    setQuery("");
    setOpen(false);
    if (selectedSet.has(id)) return;
    navigate([...selectedIds, id]);
  }

  function remove(id: string) {
    navigate(selectedIds.filter((x) => x !== id));
  }

  return (
    <div ref={wrap} className="relative space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((i) => (
            <span
              key={i.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-xs font-medium text-white"
            >
              {i.name}
              <span className="text-[10px] opacity-70">{i.category}</span>
              <button
                type="button"
                onClick={() => remove(i.id)}
                className="ml-0.5 rounded-full bg-white/20 px-1 leading-none hover:bg-white/40"
                aria-label={`Remover ${i.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <Input
        placeholder={
          selected.length
            ? "Adicionar mais um interesse..."
            : "Buscar interesse para filtrar (ex: yoga, samba, inglês...)"
        }
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {filtered.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => add(i.id)}
              className="flex w-full items-baseline justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{i.name}</span>
              <span className="text-xs text-slate-500">{i.category}</span>
            </button>
          ))}
        </div>
      )}
      {open && query && filtered.length === 0 && (
        <div className="absolute left-0 right-0 z-20 mt-1 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-lg">
          Nada encontrado para “{query}”.
        </div>
      )}

      {selected.length > 1 && (
        <p className="text-xs text-slate-500">
          Mostrando quem tem interesse em <strong>qualquer um</strong> dos {selected.length} selecionados.
        </p>
      )}
    </div>
  );
}
