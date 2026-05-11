import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono, Sans } from "../helpers";

export function Outro({ condoName }: { condoName: string }) {
  const frame = useCurrentFrame();
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const circleOp = interpolate(frame, [10, 26], [0, 1], { extrapolateRight: "clamp" });
  const circleS = interpolate(frame, [10, 30], [0.7, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [22, 44], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [22, 44], [22, 0], { extrapolateRight: "clamp" });
  const ctaOp = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [80, 90], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "var(--bg)",
        padding: 96,
        display: "flex",
        flexDirection: "column",
        opacity: fadeOut,
      }}
    >
      <div style={{ opacity: eyebrowOp }}>
        <Mono size={22}>Tudo certo</Mono>
      </div>

      <div
        style={{
          marginTop: 64,
          width: 220,
          height: 220,
          borderRadius: 999,
          background: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Instrument Serif', serif",
          fontSize: 120,
          color: "var(--surface)",
          opacity: circleOp,
          transform: `scale(${circleS})`,
        }}
      >
        ✓
      </div>

      <div style={{ marginTop: 56, opacity: titleOp, transform: `translateY(${titleY}px)` }}>
        <Display size={140}>Bora começar,</Display>
        <br />
        <Display size={140} italic>
          {condoName}.
        </Display>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ opacity: ctaOp }}>
        <Sans size={32}>3 minutos. Sem senha, sem email. Você pode apagar tudo a qualquer hora.</Sans>
      </div>
    </AbsoluteFill>
  );
}
