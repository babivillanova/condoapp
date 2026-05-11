import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono, Sans } from "../helpers";

const AGE = [
  { label: "Bebê", range: "0–3" },
  { label: "Criança peq.", range: "4–7" },
  { label: "Criança", range: "8–12" },
  { label: "Adolescente", range: "13–17" },
  { label: "Jovem adulto", range: "18–29" },
  { label: "Adulto", range: "30–49" },
];

const SELECTED_IDX = 5; // "Adulto 30–49"

export function Profile() {
  const frame = useCurrentFrame();
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const selectStart = 40;
  const selectedOp = interpolate(frame, [selectStart, selectStart + 14], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [78, 90], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "var(--bg)", padding: 96, opacity: fadeOut }}>
      <div style={{ opacity: eyebrowOp }}>
        <Mono size={20}>02 · Sobre você</Mono>
      </div>

      <div style={{ marginTop: 28, opacity: titleOp }}>
        <Display size={104}>Pra montar grupos </Display>
        <Display size={104} italic>
          compatíveis
        </Display>
      </div>
      <div style={{ marginTop: 16, opacity: titleOp }}>
        <Sans size={26}>Faixa etária + gênero. Nunca aparece publicamente.</Sans>
      </div>

      <div style={{ marginTop: 72 }}>
        <Mono size={18}>Faixa etária</Mono>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {AGE.map((b, i) => {
            const sel = i === SELECTED_IDX;
            const showSel = sel ? selectedOp : 0;
            return (
              <div
                key={b.label}
                style={{
                  height: 110,
                  borderRadius: 22,
                  border: `2px solid ${sel ? "transparent" : "var(--rule)"}`,
                  background: sel ? `rgba(28,26,23,${showSel})` : "var(--surface)",
                  padding: "0 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 32,
                    fontWeight: 500,
                    color: sel ? `rgba(245,239,228,${showSel})` : "var(--ink)",
                  }}
                >
                  {b.label}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 24,
                    color: sel ? `rgba(245,239,228,${0.65 * showSel})` : "var(--ink-3)",
                  }}
                >
                  {b.range}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}
