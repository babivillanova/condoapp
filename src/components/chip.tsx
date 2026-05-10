"use client";

import { cn } from "@/lib/cn";

type Props = {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Chip({ active, onClick, children, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 font-sans text-[12px] font-medium transition",
        active ? "bg-ink text-bg border-ink" : "bg-transparent text-ink-2 border-rule hover:border-rule-strong",
        className,
      )}
    >
      {children}
    </button>
  );
}
