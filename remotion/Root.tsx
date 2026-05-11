import { Composition } from "remotion";
import "./styles.css";
import "./fonts";
import { CondoVideo } from "./CondoVideo";

export const VIDEO_FPS = 30;
export const VIDEO_W = 1080;
export const VIDEO_H = 1920;

// Scene durations (frames) — total 25s @ 30fps = 750.
export const SCENE = {
  intro: 90,
  identify: 120,
  profile: 90,
  interests: 120,
  availability: 120,
  dashboard: 120,
  outro: 90,
};

const TOTAL = Object.values(SCENE).reduce((a, b) => a + b, 0);

export function Root() {
  return (
    <>
      <Composition
        id="CondoApp"
        component={CondoVideo}
        durationInFrames={TOTAL}
        fps={VIDEO_FPS}
        width={VIDEO_W}
        height={VIDEO_H}
        defaultProps={{ condoName: "Central Park Mooca" }}
      />
    </>
  );
}
