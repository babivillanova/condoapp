"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
    if (!q) return pool.slice(0, 8);
    return pool
      .filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
      .slice(0, 8);
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
    <div ref={wrap} className="space-y-2">
      <div className="relative flex h-[42px] items-center gap-2.5 rounded-[10px] border border-rule bg-surface-2 px-[14px]">
        <SearchIcon />
        <input
          type="text"
          value={query}
          placeholder="ex: yoga, samba, alemão…"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          className="flex-1 border-0 bg-transparent font-sans text-[13.5px] text-ink outline-none placeholder:text-ink-3"
        />
        {open && filtered.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full z-10 mt-1 rounded-[10px] border border-rule bg-surface p-1"
            style={{ boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
          >
            {filtered.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => add(i.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border-0 bg-transparent px-2.5 py-2 text-left font-sans text-[13px] text-ink hover:bg-surface-2"
              >
                <span>{i.name}</span>
                <span className="font-mono text-[10px] text-ink-3">{i.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => remove(i.id)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink bg-ink px-[11px] py-1.5 font-sans text-[12.5px] font-medium text-bg"
            >
              {i.name}
              <span className="ml-0.5 opacity-70">×</span>
            </button>
          ))}
        </div>
      )}

      {selected.length > 1 && (
        <p className="font-sans text-[12px] text-ink-3">
          Mostrando quem tem interesse em <strong>qualquer um</strong> dos {selected.length} selecionados.
        </p>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-ink-3" aria-hidden>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
