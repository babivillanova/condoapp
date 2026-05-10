type Props = { totalRespondents: number };

const HEIGHTS: number[][] = [
  [22, 36, 28, 18],
  [18, 30, 44, 24],
  [16, 28, 48, 22],
  [20, 32, 42, 30],
  [18, 28, 50, 26],
  [22, 30, 38, 32],
  [38, 46, 36, 28],
];

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function NeighborhoodPulse({ totalRespondents }: Props) {
  return (
    <div className="rounded-2xl border border-rule bg-surface px-[14px] pb-3 pt-4" style={{ borderRadius: 14 }}>
      <div className="mb-3 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">
        <span>Pulso da semana</span>
        <span>{totalRespondents} vizinho{totalRespondents === 1 ? "" : "s"}</span>
      </div>
      <div className="flex h-[72px] items-end gap-1.5">
        {HEIGHTS.map((cols, di) => (
          <div key={di} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-col items-center gap-[2px]">
              {cols.map((h, hi) => (
                <div
                  key={hi}
                  className="w-full rounded-[1px]"
                  style={{
                    height: h * 0.5,
                    background: hi === 2 ? "var(--accent)" : "var(--ink-2)",
                    opacity: hi === 2 ? 1 : 0.18 + hi * 0.08,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] text-ink-3">{DAYS[di]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
