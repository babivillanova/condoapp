import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono, Sans } from "../helpers";

const PILLS: Array<{ name: string; cat: string; level?: "I" | "II" | "III"; delay: number }> = [
  { name: "Yoga", cat: "Esportes", level: "II", delay: 8 },
  { name: "Pilates", cat: "Esportes", delay: 14 },
  { name: "Violão", cat: "Música", level: "III", delay: 20 },
  { name: "Ballet adulto", cat: "Dança", level: "I", delay: 26 },
  { name: "Inglês", cat: "Idiomas", delay: 32 },
  { name: "Clube do livro", cat: "Leitura", level: "II", delay: 38 },
  { name: "Confeitaria", cat: "Culinária", delay: 44 },
  { name: "Trail running", cat: "Esportes", delay: 50 },
  { name: "Zouk", cat: "Dança", level: "I", delay: 56 },
  { name: "Mandarim", cat: "Idiomas", delay: 62 },
  { name: "Boardgames", cat: "Jogos", level: "III", delay: 68 },
  { name: "Pintura", cat: "Artes", delay: 74 },
];

export function Interests() {
  const frame = useCurrentFrame();
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "var(--bg)", padding: 96, opacity: fadeOut }}>
      <div style={{ opacity: eyebrowOp }}>
        <Mono size={20}>03 · Interesses</Mono>
      </div>

      <div style={{ marginTop: 28, opacity: titleOp }}>
        <Display size={104}>O que te </Display>
        <Display size={104} italic>
          interessa?
        </Display>
      </div>
      <div style={{ marginTop: 16, opacity: titleOp }}>
        <Sans size={26}>Toque pra selecionar. O nível (I → II → III) diz seu conhecimento.</Sans>
      </div>

      <div style={{ marginTop: 84, display: "flex", flexWrap: "wrap", gap: 14, maxWidth: 880 }}>
        {PILLS.map((p) => {
          const op = interpolate(frame, [p.delay, p.delay + 10], [0, 1], { extrapolateRight: "clamp" });
          const ty = interpolate(frame, [p.delay, p.delay + 10], [10, 0], { extrapolateRight: "clamp" });
          return (
            <div
              key={p.name}
              style={{
                opacity: op,
                transform: `translateY(${ty}px)`,
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 26px",
                borderRadius: 999,
                border: "2px solid var(--ink)",
                background: "var(--ink)",
                color: "var(--bg)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 30,
                fontWeight: 500,
              }}
            >
              {p.name}
              {p.level && (
                <span
                  style={{
                    padding: "5px 13px",
                    borderRadius: 999,
                    background: "var(--accent)",
                    color: "#fff",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {p.level}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
