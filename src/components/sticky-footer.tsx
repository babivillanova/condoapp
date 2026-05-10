import { cn } from "@/lib/cn";

export function StickyFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("sticky bottom-0 left-0 right-0 z-[5] px-5 pt-[14px] pb-6", className)}
      style={{ background: "linear-gradient(to bottom, transparent, var(--bg) 22%, var(--bg))" }}
    >
      {children}
    </div>
  );
}
