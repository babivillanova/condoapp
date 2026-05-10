import Link from "next/link";
import { cn } from "@/lib/cn";

type StepKey = "identify" | "profile" | "interests" | "availability" | "review";

const STEPS: StepKey[] = ["identify", "profile", "interests", "availability", "review"];
const STEP_BACK: Record<StepKey, string> = {
  identify: "/",
  profile: "/identify",
  interests: "/profile",
  availability: "/interests",
  review: "/availability",
};

type Props = {
  current: StepKey;
  condoName: string;
};

export function StepHeader({ current, condoName }: Props) {
  const idx = STEPS.indexOf(current);
  const total = STEPS.length;
  const back = STEP_BACK[current];

  return (
    <div className="px-5 pt-[14px]">
      <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
        <Link
          href={back}
          className="flex items-center gap-1 py-1.5 text-ink-2 hover:text-ink"
        >
          <span className="text-[13px] leading-none">‹</span>
          Voltar
        </Link>
        <span>{condoName}</span>
        <span>
          {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
      <div className="mt-3 mb-1 flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] flex-1 rounded-[2px] transition-colors",
              i <= idx ? "bg-accent" : "bg-rule",
            )}
          />
        ))}
      </div>
    </div>
  );
}
