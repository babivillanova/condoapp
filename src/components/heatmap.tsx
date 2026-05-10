import { DAYS } from "@/lib/types";

type Props = { data: number[][] }; // [day][hour]

const HOURS = Array.from({ length: 24 }, (_, h) => h);

export function Heatmap({ data }: Props) {
  let max = 0;
  let peak = { day: 0, hour: 0, value: 0 };
  for (let d = 0; d < data.length; d++) {
    for (let h = 0; h < data[d].length; h++) {
      const v = data[d][h];
      if (v > max) max = v;
      if (v > peak.value) peak = { day: d, hour: h, value: v };
    }
  }
  const safeMax = max || 1;

  return (
    <div>
      {/* Hour labels — every 6 */}
      <div
        className="mb-1 grid"
        style={{ gridTemplateColumns: "auto repeat(24, 1fr)", gap: 2 }}
      >
        <div />
        {HOURS.map((h) => (
          <div
            key={h}
            className="text-center font-mono text-[8.5px] tracking-[0.04em] text-ink-3"
          >
            {h % 6 === 0 ? String(h).padStart(2, "0") : "·"}
          </div>
        ))}
      </div>

      {DAYS.map((d) => (
        <div
          key={d.value}
          className="mb-[2px] grid"
          style={{ gridTemplateColumns: "auto repeat(24, 1fr)", gap: 2 }}
        >
          <div className="flex min-w-[32px] items-center justify-end pr-2 font-mono text-[10px] tracking-[0.05em] text-ink-3">
            {d.short}
          </div>
          {HOURS.map((h) => {
            const v = data[d.value][h];
            const t = Math.max(0, Math.min(1, v / safeMax));
            const lowKey = t < 0.06;
            const bg = lowKey
              ? "var(--surface-2)"
              : `color-mix(in oklch, var(--accent) ${Math.round(t * 92)}%, var(--surface-2))`;
            return (
              <div
                key={h}
                title={`${d.short} ${String(h).padStart(2, "0")}h · ${v} pessoa(s)`}
                className="rounded-[3px]"
                style={{
                  height: 22,
                  background: bg,
                  border: lowKey ? "1px solid var(--rule)" : "none",
                }}
              />
            );
          })}
        </div>
      ))}

      {/* Legend + peak */}
      <div className="mt-3.5 flex items-center gap-2.5 font-mono text-[10px] tracking-[0.06em] text-ink-3">
        <span>menos</span>
        <div className="flex gap-[2px]">
          {[0.05, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
            <div
              key={t}
              className="rounded-[2px]"
              style={{
                width: 14,
                height: 12,
                background:
                  t < 0.1
                    ? "var(--surface-2)"
                    : `color-mix(in oklch, var(--accent) ${Math.round(t * 92)}%, var(--surface-2))`,
                border: t < 0.1 ? "1px solid var(--rule)" : "none",
              }}
            />
          ))}
        </div>
        <span>mais</span>
        {peak.value > 0 && (
          <span className="ml-auto">
            pico: {DAYS[peak.day].short.toLowerCase()} {String(peak.hour).padStart(2, "0")}h · {peak.value} vizinhos
          </span>
        )}
      </div>
    </div>
  );
}
