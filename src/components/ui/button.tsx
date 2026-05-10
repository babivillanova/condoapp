import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  full?: boolean;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-bg border border-ink hover:opacity-90 active:scale-[0.985]",
  ghost: "bg-transparent text-ink border border-rule-strong hover:bg-surface active:scale-[0.985]",
  danger: "bg-transparent text-[color:var(--danger)] border border-[color:var(--danger)]/40 hover:bg-[color:var(--danger)]/5",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", full = true, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-[22px] font-sans text-[15px] font-medium tracking-[-0.005em] transition disabled:cursor-not-allowed disabled:opacity-40",
        "h-[50px]",
        full && "w-full",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
