"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Interest = { id: string; name: string; category: string };

type Props = {
  interests: Interest[];
  selectedId?: string;
  paramsString: string; // current URL search string (sem '?')
};

export function InterestFilter({ interests, selectedId, paramsString }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => (selectedId ? interests.find((i) => i.id === selectedId) ?? null : null),
    [interests, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return interests.slice(0, 30);
    return interests
      .filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .slice(0, 30);
  }, [interests, query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function pick(id: string | null) {
    const params = new URLSearchParams(paramsString);
    if (id) params.set("interest", id);
    else params.delete("interest");
    params.delete("submitted");
    setOpen(false);
    setQuery("");
    const qs = params.toString();
    router.push(qs ? `/dashboard?${qs}` : "/dashboard");
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
          {selected.name}
          <span className="text-xs opacity-80">{selected.category}</span>
          <button
            type="button"
            onClick={() => pick(null)}
            className="ml-1 rounded-full bg-white/20 px-1.5 leading-none hover:bg-white/40"
            aria-label="Remover filtro"
          >
            ×
          </button>
        </span>
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative">
      <Input
        placeholder="Buscar interesse para filtrar (ex: yoga, samba, inglês...)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {filtered.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => pick(i.id)}
              className="flex w-full items-baseline justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-900">{i.name}</span>
              <span className="text-xs text-slate-500">{i.category}</span>
            </button>
          ))}
        </div>
      )}
      {open && query && filtered.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-lg">
          Nada encontrado para “{query}”.
        </div>
      )}
    </div>
  );
}
