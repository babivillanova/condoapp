import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono, Sans } from "../helpers";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function peakValue(day: number, hour: number): number {
  const isWeekday = day >= 1 && day <= 5;
  const isWeekend = day === 0 || day === 6;
  if (isWeekday && hour >= 19 && hour <= 22) return 18 + Math.round(Math.sin(day * 1.2 + hour * 0.3) * 5);
  if (isWeekend && hour >= 9 && hour <= 16) return 14 + Math.round(Math.cos(day + hour * 0.5) * 4);
  if (hour === 7 && isWeekday) return 9;
  if (hour >= 6 && hour <= 8) return 4;
  if (hour >= 12 && hour <= 18) return 6;
  return 1;
}

export function Dashboard() {
  const frame = useCurrentFrame();
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  // Heatmap grows from low to full intensity across the scene.
  const intensity = interpolate(frame, [22, 86], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: "clamp" });

  const maxV = 24;

  return (
    <AbsoluteFill style={{ background: "var(--bg)", padding: 96, opacity: fadeOut }}>
      <div style={{ opacity: eyebrowOp }}>
        <Mono size={20}>Mapa do condomínio</Mono>
      </div>

      <div style={{ marginTop: 28, opacity: titleOp }}>
        <Display size={120}>165 </Display>
        <Display size={120} italic>
          vizinhos
        </Display>
        <br />
        <Display size={120}>dispostos.</Display>
      </div>
      <div style={{ marginTop: 16, opacity: titleOp }}>
        <Sans size={26}>Filtre por interesse, idade ou gênero. Veja onde tem gente.</Sans>
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
        <div style={{ marginBottom: 12 }}>
          <Display size={36} italic>
            Disponibilidade
          </Display>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `60px repeat(24, 1fr)`,
            gap: 3,
            marginBottom: 6,
          }}
        >
          <div />
          {HOURS.map((h) => (
            <div
              key={h}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                textAlign: "center",
                color: "var(--ink-3)",
              }}
            >
              {h % 6 === 0 ? String(h).padStart(2, "0") : "·"}
            </div>
          ))}
        </div>
        {DAYS.map((d, di) => (
          <div
            key={d}
            style={{
              display: "grid",
              gridTemplateColumns: `60px repeat(24, 1fr)`,
              gap: 3,
              marginBottom: 3,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                paddingRight: 8,
                textAlign: "right",
                color: "var(--ink-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {d}
            </div>
            {HOURS.map((h) => {
              const v = peakValue(di, h) * intensity;
              const t = Math.max(0, Math.min(1, v / maxV));
              const lowKey = t < 0.06;
              const bg = lowKey
                ? "var(--surface-2)"
                : `color-mix(in oklch, var(--accent) ${Math.round(t * 92)}%, var(--surface-2))`;
              return (
                <div
                  key={h}
                  style={{
                    height: 38,
                    borderRadius: 5,
                    background: bg,
                    border: lowKey ? "1px solid var(--rule)" : "none",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <Mono size={18}>pico · ter 19h · 24 vizinhos</Mono>
      </div>
    </AbsoluteFill>
  );
}
