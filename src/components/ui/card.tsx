import { cn } from "@/lib/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-rule bg-surface p-5", className)} style={{ borderRadius: 14 }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "font-display text-[22px] font-normal italic leading-none tracking-[-0.01em] text-ink",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("mt-1.5 text-[12.5px] text-ink-3", className)}>{children}</p>;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
