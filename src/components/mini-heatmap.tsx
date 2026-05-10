import { DAYS, HOURS } from "@/lib/types";

type Props = { slotSet: Set<string> };

export function MiniHeatmap({ slotSet }: Props) {
  return (
    <div>
      <div
        className="mb-1 grid"
        style={{ gridTemplateColumns: "auto repeat(7, 1fr)", gap: "1.5px" }}
      >
        <div />
        {DAYS.map((d) => (
          <div
            key={d.value}
            className="text-center font-mono text-[8.5px] tracking-[0.05em] text-ink-3"
          >
            {d.short}
          </div>
        ))}
      </div>
      {HOURS.map((h) => (
        <div
          key={h}
          className="grid"
          style={{ gridTemplateColumns: "auto repeat(7, 1fr)", gap: "1.5px", marginBottom: "1.5px" }}
        >
          <div className="pr-1 text-right font-mono text-[8px] leading-none text-ink-3">
            {String(h).padStart(2, "0")}
          </div>
          {DAYS.map((d) => {
            const ok = slotSet.has(`${d.value}:${h}`);
            return (
              <div
                key={d.value}
                className="rounded-[1.5px]"
                style={{ height: 7, background: ok ? "var(--accent)" : "var(--rule)" }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
