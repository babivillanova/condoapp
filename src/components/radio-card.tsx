import { cn } from "@/lib/cn";

type Props = {
  selected: boolean;
  title: string;
  detail?: string;
  wide?: boolean;
  name: string;
  value: string;
};

export function RadioCard({ selected, title, detail, wide, name, value }: Props) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-xl border font-sans text-[14px] font-medium transition",
        wide ? "px-4 py-[14px]" : "px-[14px] py-3",
        selected
          ? "bg-ink text-bg border-ink"
          : "bg-surface text-ink border-rule hover:border-rule-strong",
      )}
    >
      <input type="radio" name={name} value={value} defaultChecked={selected} className="sr-only" />
      <span>{title}</span>
      {detail && (
        <span
          className={cn(
            "font-mono text-[11px]",
            selected ? "text-[rgba(248,244,237,0.65)]" : "text-ink-3",
          )}
        >
          {detail}
        </span>
      )}
    </label>
  );
}
