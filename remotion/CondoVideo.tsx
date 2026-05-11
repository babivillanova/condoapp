import { Sequence } from "remotion";
import { SCENE } from "./Root";
import { Intro } from "./scenes/Intro";
import { Identify } from "./scenes/Identify";
import { Profile } from "./scenes/Profile";
import { Interests } from "./scenes/Interests";
import { Availability } from "./scenes/Availability";
import { Dashboard } from "./scenes/Dashboard";
import { Outro } from "./scenes/Outro";

type Props = { condoName: string };

export function CondoVideo({ condoName }: Props) {
  let cursor = 0;

  const scenes: Array<{ name: keyof typeof SCENE; node: React.ReactNode }> = [
    { name: "intro", node: <Intro condoName={condoName} /> },
    { name: "identify", node: <Identify /> },
    { name: "profile", node: <Profile /> },
    { name: "interests", node: <Interests /> },
    { name: "availability", node: <Availability /> },
    { name: "dashboard", node: <Dashboard /> },
    { name: "outro", node: <Outro condoName={condoName} /> },
  ];

  return (
    <>
      {scenes.map(({ name, node }, i) => {
        const from = cursor;
        const dur = SCENE[name];
        cursor += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            {node}
          </Sequence>
        );
      })}
    </>
  );
}
