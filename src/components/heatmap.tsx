import { DAYS, TIME_SLOTS } from "@/lib/types";

type Props = { data: number[][] };

export function Heatmap({ data }: Props) {
  let max = 0;
  for (const row of data) for (const v of row) if (v > max) max = v;

  function shade(v: number) {
    if (max === 0) return "rgba(59,118,246,0.06)";
    const pct = v / max;
    const alpha = 0.08 + pct * 0.85;
    return `rgba(59,118,246,${alpha.toFixed(3)})`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: "auto repeat(7, minmax(48px, 1fr))" }}>
        <div />
        {DAYS.map((d) => (
          <div key={d.value} className="pb-2 text-center text-xs font-semibold uppercase text-slate-500">
            {d.short}
          </div>
        ))}
        {TIME_SLOTS.map((t, slotIdx) => (
          <div key={t.value} className="contents">
            <div className="flex flex-col justify-center pr-2 text-right">
              <span className="text-xs font-semibold text-slate-700">{t.label}</span>
              <span className="text-[10px] text-slate-400">{t.hint}</span>
            </div>
            {DAYS.map((d) => {
              const v = data[d.value][slotIdx];
              return (
                <div
                  key={d.value}
                  className="flex h-12 items-center justify-center rounded-md border border-slate-200 text-sm font-semibold text-slate-800"
                  style={{ background: shade(v) }}
                  title={`${d.long} ${t.label}: ${v} pessoa(s)`}
                >
                  {v > 0 ? v : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {max > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>0</span>
          <div className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(to right, rgba(59,118,246,0.08), rgba(59,118,246,0.93))" }} />
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
