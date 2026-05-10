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
    <header className="border-b border-rule bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 md:px-8 md:py-5">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md bg-ink font-display text-[18px] italic text-bg">
            c
          </div>
          <div className="min-w-0">
            <div className="font-display text-[18px] italic leading-none text-ink">
              Condo<span className="not-italic">App</span>
            </div>
            <div className="mt-0.5 truncate font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-3">
              {condoName}
            </div>
          </div>
        </Link>

        {/* Tabs — flex-1 so they fill the middle, scroll horizontally if too many */}
        {tabs.length > 0 && (
          <nav
            className="order-3 -mx-1 flex w-full flex-1 gap-1 overflow-x-auto px-1 md:order-2 md:w-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {tabs.map((t) => (
              <NavTab key={t.label} href={t.href} active={t.active}>
                {t.label}
              </NavTab>
            ))}
          </nav>
        )}

        {/* Right slot */}
        <div className="order-2 ml-auto flex shrink-0 items-center gap-2.5 md:order-3">
          {rightSlot ?? (
            <>
              <span className="hidden font-mono text-[10.5px] tracking-[0.12em] text-ink-3 sm:inline">
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
        "shrink-0 rounded-lg px-3.5 py-2 font-sans text-[13px] font-medium transition",
        active ? "bg-ink text-bg" : "bg-transparent text-ink-2 hover:bg-surface-2",
      )}
    >
      {children}
    </Link>
  );
}
