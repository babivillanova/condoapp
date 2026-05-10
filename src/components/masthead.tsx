import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = { label: string; href: string; active?: boolean };

type Props = {
  condoName: string;
  mode?: "public" | "admin";
  tabs?: Tab[];
  rightSlot?: React.ReactNode;
};

export function Masthead({ condoName, mode = "public", tabs = [], rightSlot }: Props) {
  const adminInitials =
    condoName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <header className="flex items-center justify-between border-b border-rule bg-surface px-8 py-5">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-ink font-display text-[18px] italic text-bg">
          c
        </div>
        <div>
          <div className="font-display text-[18px] italic leading-none text-ink">
            Condo<span className="not-italic">App</span>
          </div>
          <div className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
            {condoName}
          </div>
        </div>
      </Link>

      {tabs.length > 0 && (
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <NavTab key={t.label} href={t.href} active={t.active}>
              {t.label}
            </NavTab>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-2.5">
        {rightSlot ?? (
          <>
            <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-3">
              {mode === "admin" ? "ADMIN" : "PÚBLICO"}
            </span>
            <div
              className={cn(
                "flex h-[30px] w-[30px] items-center justify-center rounded-full font-mono text-[11px] font-semibold text-white",
                mode === "admin" ? "bg-ink" : "bg-accent",
              )}
            >
              {adminInitials}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export function NavTab({
  children,
  active,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg border-0 px-3.5 py-2 font-sans text-[13px] font-medium transition",
        active ? "bg-ink text-bg" : "bg-transparent text-ink-2 hover:bg-surface-2",
      )}
    >
      {children}
    </Link>
  );
}
