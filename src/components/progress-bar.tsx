import { cn } from "@/lib/cn";

const STEPS = [
  { key: "identify", label: "Identificação" },
  { key: "profile", label: "Perfil" },
  { key: "interests", label: "Interesses" },
  { key: "availability", label: "Disponibilidade" },
  { key: "review", label: "Revisão" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export function ProgressBar({ current }: { current: StepKey }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < idx && "bg-brand-600 text-white",
                i === idx && "bg-brand-600 text-white ring-4 ring-brand-100",
                i > idx && "bg-slate-200 text-slate-500",
              )}
            >
              {i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-1 flex-1 rounded-full", i < idx ? "bg-brand-600" : "bg-slate-200")} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm text-slate-500">
        Passo {idx + 1} de {STEPS.length} — <span className="font-medium text-slate-700">{STEPS[idx]?.label}</span>
      </div>
    </div>
  );
}
