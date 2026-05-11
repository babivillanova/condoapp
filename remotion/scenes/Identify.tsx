import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Display, Mono, Sans } from "../helpers";

const NAME = "Maria da Silva";
const TOWER = "B3";
const APT = "1104";

function typed(text: string, frame: number, start = 0, perChar = 2) {
  const chars = Math.max(0, Math.min(text.length, Math.floor((frame - start) / perChar)));
  return text.slice(0, chars);
}

export function Identify() {
  const frame = useCurrentFrame();
  const eyebrowOp = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const nameStart = 30;
  const towerStart = 56;
  const aptStart = 70;
  const nameText = typed(NAME, frame, nameStart);
  const aptText = typed(APT, frame, aptStart);
  const showTower = frame >= towerStart;
  const fadeOut = interpolate(frame, [108, 120], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "var(--bg)", padding: 96, opacity: fadeOut }}>
      <div style={{ opacity: eyebrowOp }}>
        <Mono size={20}>01 · Identificação</Mono>
      </div>

      <div style={{ marginTop: 28, opacity: titleOp }}>
        <Display size={120}>Quem é você?</Display>
      </div>
      <div style={{ marginTop: 12, opacity: titleOp }}>
        <Sans size={28}>Use seu nome e selecione torre + apto.</Sans>
      </div>

      <div style={{ marginTop: 72 }}>
        <FieldRow label="Nome completo" value={nameText} />
        <div style={{ height: 28 }} />
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
          <FieldRow label="Torre" value={showTower ? TOWER : ""} mono select />
          <FieldRow label="Apartamento" value={aptText} mono />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function FieldRow({
  label,
  value,
  mono,
  select,
}: {
  label: string;
  value: string;
  mono?: boolean;
  select?: boolean;
}) {
  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Mono size={18}>{label}</Mono>
      </div>
      <div
        style={{
          height: 96,
          borderRadius: 22,
          border: `2px solid ${value ? "var(--ink)" : "var(--rule)"}`,
          background: "var(--surface)",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: select ? "space-between" : "flex-start",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: mono
              ? "'JetBrains Mono', ui-monospace, monospace"
              : "'DM Sans', system-ui, sans-serif",
            fontSize: 32,
            color: "var(--ink)",
            letterSpacing: mono ? "0.01em" : "-0.005em",
          }}
        >
          {value}
          <span style={{ opacity: 0.4 }}>{value.length < 1 ? "" : <Cursor />}</span>
        </span>
        {select && (
          <span style={{ color: "var(--ink-3)", fontSize: 20 }}>▾</span>
        )}
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 2,
        height: 32,
        marginLeft: 2,
        background: "var(--ink)",
        verticalAlign: "middle",
        animation: "blink 1s steps(2) infinite",
      }}
    />
  );
}
