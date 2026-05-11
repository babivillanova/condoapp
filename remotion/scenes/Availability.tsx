import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono, Sans } from "../helpers";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

// Pre-computed "user's marked hours" so the fill is reproducible.
const MARKED: Set<string> = new Set(
  (() => {
    const out: string[] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        // weekday evenings + weekend daytime
        const isWeekday = d >= 1 && d <= 5;
        const isWeekend = d === 0 || d === 6;
        if (isWeekday && h >= 19 && h <= 22) out.push(`${d}:${h}`);
        if (isWeekend && h >= 9 && h <= 16) out.push(`${d}:${h}`);
        if (h === 7 && isWeekday) out.push(`${d}:${h}`); // morning run
      }
    }
    return out;
  })(),
);

const MARKED_ARR = Array.from(MARKED.values());

export function Availability() {
  const frame = useCurrentFrame();
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const fillStart = 32;
  const fillEnd = 100;
  const fillCount = Math.max(
    0,
    Math.floor(
      interpolate(frame, [fillStart, fillEnd], [0, MARKED_ARR.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const fadeOut = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: "clamp" });
  const filledNow = new Set(MARKED_ARR.slice(0, fillCount));

  return (
    <AbsoluteFill style={{ background: "var(--bg)", padding: 96, opacity: fadeOut }}>
      <div style={{ opacity: eyebrowOp }}>
        <Mono size={20}>04 · Disponibilidade</Mono>
      </div>

      <div style={{ marginTop: 28, opacity: titleOp }}>
        <Display size={104}>Quando você está </Display>
        <Display size={104} italic>
          livre?
        </Display>
      </div>
      <div style={{ marginTop: 16, opacity: titleOp }}>
        <Sans size={26}>Toque cada hora pra marcar. Arrastar também funciona.</Sans>
      </div>

      <div
        style={{
          marginTop: 64,
          border: "2px solid var(--rule)",
          borderRadius: 28,
          background: "var(--surface)",
          padding: 28,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `60px repeat(7, 1fr)`,
            gap: 4,
            marginBottom: 8,
          }}
        >
          <div />
          {DAYS.map((d) => (
            <div
              key={d}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                textAlign: "center",
                color: "var(--ink-3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {d}
            </div>
          ))}
        </div>
        {HOURS.map((h) => (
          <div
            key={h}
            style={{
              display: "grid",
              gridTemplateColumns: `60px repeat(7, 1fr)`,
              gap: 4,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                textAlign: "right",
                paddingRight: 8,
                color: "var(--ink-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {String(h).padStart(2, "0")}h
            </div>
            {DAYS.map((_, d) => {
              const k = `${d}:${h}`;
              const filled = filledNow.has(k);
              const turnoTint =
                h < 6 ? "var(--surface-2)" : h < 12 ? "rgba(240,212,150,0.18)" : h < 18 ? "rgba(174,213,235,0.18)" : "rgba(180,170,210,0.20)";
              return (
                <div
                  key={d}
                  style={{
                    height: 30,
                    borderRadius: 6,
                    border: `1px solid ${filled ? "var(--accent)" : "var(--rule)"}`,
                    background: filled ? "var(--accent)" : turnoTint,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 28, textAlign: "center" }}>
        <Mono size={20}>{filledNow.size}/168 horas marcadas</Mono>
      </div>
    </AbsoluteFill>
  );
}
