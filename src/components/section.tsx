type Props = {
  title: React.ReactNode;
  hint?: React.ReactNode;
  badge?: string | null;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function Section({ title, hint, badge, actions, children }: Props) {
  return (
    <section
      className="rounded-2xl border border-rule bg-surface px-5 py-[18px]"
      style={{ borderRadius: 14 }}
    >
      <header className="mb-3.5 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="m-0 font-display text-[22px] font-normal italic leading-none tracking-[-0.01em] text-ink">
            {title}
            {badge && (
              <span className="ml-2.5 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 align-middle font-sans text-[11px] font-medium not-italic text-accent">
                {badge}
              </span>
            )}
          </h2>
          {hint && <p className="mt-1.5 font-sans text-[12.5px] text-ink-3">{hint}</p>}
        </div>
        {actions && <div>{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function MonoLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3">
      {children}
      {count !== undefined && count > 0 && <span className="text-accent"> · {count}</span>}
    </div>
  );
}
