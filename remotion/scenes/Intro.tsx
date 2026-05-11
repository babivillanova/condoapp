import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono } from "../helpers";

export function Intro({ condoName }: { condoName: string }) {
  const frame = useCurrentFrame();
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [4, 22], [20, 0], { extrapolateRight: "clamp" });
  const italicOp = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });
  const italicY = interpolate(frame, [30, 50], [20, 0], { extrapolateRight: "clamp" });
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [78, 90], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "var(--bg)", padding: 96, opacity: fadeOut }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: eyebrowOp }}>
        <div style={{ width: 36, height: 2, background: "var(--ink-3)" }} />
        <Mono size={22}>{condoName}</Mono>
      </div>

      <div style={{ marginTop: 220 }}>
        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)` }}>
          <Display size={150}>Mapa de</Display>
          <br />
          <Display size={150}>interesses</Display>
        </div>
        <div style={{ marginTop: 32, opacity: italicOp, transform: `translateY(${italicY}px)` }}>
          <Display size={150} italic>
            do prédio.
          </Display>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 96, left: 96, right: 96 }}>
        <Mono size={20}>Em ~3 min · pelo seu celular</Mono>
      </div>
    </AbsoluteFill>
  );
}
