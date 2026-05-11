import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamilies } from "./fonts";

export function fadeUp(localFrame: number, duration = 18) {
  const opacity = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, duration], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, transform: `translateY(${translateY}px)` };
}

export function useStaggered(index: number, perItem = 4) {
  const frame = useCurrentFrame();
  return Math.max(0, frame - index * perItem);
}

export function Mono({ children, size = 14, color = "var(--ink-3)", style }: { children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: fontFamilies.mono,
        fontSize: size,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Display({
  children,
  size = 80,
  italic,
  color = "var(--ink)",
  style,
}: {
  children: React.ReactNode;
  size?: number;
  italic?: boolean;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: fontFamilies.display,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        lineHeight: 1.05,
        letterSpacing: "-0.02em",
        color: italic ? "var(--accent)" : color,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Sans({ children, size = 28, color = "var(--ink-2)", weight = 400, style }: { children: React.ReactNode; size?: number; color?: string; weight?: number; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: fontFamilies.sans,
        fontSize: size,
        lineHeight: 1.5,
        letterSpacing: "-0.005em",
        color,
        fontWeight: weight,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function springBounce(frame: number, fps: number, delay = 0) {
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });
}

export function useSafeFrame() {
  return useCurrentFrame();
}

export function useFps() {
  return useVideoConfig().fps;
}
