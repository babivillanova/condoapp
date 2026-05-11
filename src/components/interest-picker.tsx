"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LevelHintModal } from "@/components/level-hint-modal";
import { interestsAction } from "@/lib/actions";
import { type Affinity, type Interest } from "@/lib/types";
import { cn } from "@/lib/cn";

const HINT_KEY = "condoapp.levelHintSeen";

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
  const [showLevelHint, setShowLevelHint] = useState(false);
  const hintShownRef = useRef(false);

  useEffect(() => {
    if (selected.size >= 1 && !hintShownRef.current) {
      const seen = typeof window !== "undefined" && window.localStorage.getItem(HINT_KEY);
      if (!seen) {
        setShowLevelHint(true);
        hintShownRef.current = true;
      }
    }
  }, [selected.size]);

  function dismissLevelHint() {
    setShowLevelHint(false);
    if (typeof window !== "undefined") window.localStorage.setItem(HINT_KEY, "1");
  }

  const allCategories = useMemo(() => Array.from(new Set(catalog.map((i) => i.category))), [catalog]);

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

  function cycleLevel(id: string, e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
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
    <div className="flex flex-1 flex-col">
      {showLevelHint && <LevelHintModal onDismiss={dismissLevelHint} />}
      {/* Sticky search + categories */}
      <div className="sticky top-0 z-[4] bg-bg px-5 pb-3">
        <div className="flex h-11 items-center gap-2.5 rounded-xl border border-rule bg-surface-2 px-[14px]">
          <SearchIcon />
          <input
            type="text"
            value={query}
            placeholder="ex: yoga, samba, alemão…"
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent font-sans text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="cursor-pointer p-1 text-[14px] text-ink-3"
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <CatChip active={!activeCat} onClick={() => setActiveCat(null)}>Todas</CatChip>
          {allCategories.map((c) => (
            <CatChip
              key={c}
              active={activeCat === c}
              onClick={() => setActiveCat(c === activeCat ? null : c)}
            >
              {c}
            </CatChip>
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pt-1 pb-2">
        <div className="mb-3 flex justify-between font-mono text-[10.5px] tracking-[0.06em] text-ink-3">
          <span>
            {selected.size} selecionado{selected.size === 1 ? "" : "s"}
          </span>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={() => setSelected(new Map())}
              className="cursor-pointer font-mono text-[10.5px] tracking-[0.06em] text-ink-3"
            >
              limpar
            </button>
          )}
        </div>

        {grouped.length === 0 && (
          <p className="font-sans text-[14px] text-ink-3">Nada encontrado pra “{query}”.</p>
        )}

        {grouped.map(([category, items]) => (
          <div key={category} className="mb-[18px]">
            <h3 className="m-0 mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-ink-3">
              {category}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {items.map((i) => {
                const sel = selected.has(i.id);
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
                      "inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3 py-[7px] font-sans text-[13px] font-medium transition",
                      sel ? "bg-ink text-bg border-ink" : "bg-surface text-ink border-rule hover:border-rule-strong",
                    )}
                  >
                    <span>{i.name}</span>
                    {sel && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => cycleLevel(i.id, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") cycleLevel(i.id, e);
                        }}
                        className="rounded-full bg-accent px-1.5 py-[2px] font-mono text-[9px] font-bold tracking-[0.05em] text-white"
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

      <div
        className="sticky bottom-0 z-[5] px-5 pt-[14px] pb-6"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg) 22%, var(--bg))" }}
      >
        <Button type="button" onClick={submit} disabled={pending || selected.size === 0}>
          {pending ? "Salvando..." : `Continuar (${selected.size}) →`}
        </Button>
      </div>
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 font-sans text-[12px] font-medium transition",
        active ? "bg-ink text-bg border-ink" : "bg-transparent text-ink-2 border-rule hover:border-rule-strong",
      )}
    >
      {children}
    </button>
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
