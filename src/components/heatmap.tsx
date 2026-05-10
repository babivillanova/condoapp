import { DAYS, HOURS } from "@/lib/types";

type Props = { data: number[][] }; // [day][hour]

export function Heatmap({ data }: Props) {
  let max = 0;
  for (const row of data) for (const v of row) if (v > max) max = v;

  function shade(v: number) {
    if (max === 0) return "rgba(59,118,246,0.05)";
    const pct = v / max;
    const alpha = 0.08 + pct * 0.85;
    return `rgba(59,118,246,${alpha.toFixed(3)})`;
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: "auto repeat(7, minmax(36px, 1fr))" }}
      >
        <div />
        {DAYS.map((d) => (
          <div key={d.value} className="pb-1.5 text-center text-[10px] font-semibold uppercase text-slate-500">
            {d.short}
          </div>
        ))}
        {HOURS.map((h) => (
          <div key={h} className="contents">
            <div className="pr-1.5 text-right text-[10px] font-medium tabular-nums text-slate-500">
              {String(h).padStart(2, "0")}h
            </div>
            {DAYS.map((d) => {
              const v = data[d.value][h];
              return (
                <div
                  key={d.value}
                  className="flex h-7 items-center justify-center rounded-sm border border-slate-200 text-[10px] font-semibold text-slate-800"
                  style={{ background: shade(v) }}
                  title={`${d.long} ${String(h).padStart(2, "0")}h: ${v} pessoa(s)`}
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
          <div
            className="h-2 flex-1 rounded-full"
            style={{ background: "linear-gradient(to right, rgba(59,118,246,0.08), rgba(59,118,246,0.93))" }}
          />
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
