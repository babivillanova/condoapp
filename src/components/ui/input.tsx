import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & { mono?: boolean };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, mono, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-[50px] w-full rounded-xl border border-rule bg-surface px-[14px] text-ink outline-none transition",
        "placeholder:text-ink-3 focus:border-ink",
        mono ? "font-mono text-[14px] tracking-[0.01em]" : "font-sans text-[16px] tracking-[-0.005em]",
        className,
      )}
      {...rest}
    />
  );
});

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-[7px] block font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3"
    >
      {children}
    </label>
  );
}

// Back-compat alias for the old `Label` import (used by admin pages).
export { FieldLabel as Label };

// Convenience wrapper used in step screens
export function Field({
  label,
  mono,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; mono?: boolean }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <Input mono={mono} {...rest} />
    </label>
  );
}
