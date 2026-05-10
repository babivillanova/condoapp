import Link from "next/link";
import { Heatmap } from "@/components/heatmap";
import { InterestFilter } from "@/components/interest-filter";
import { loadDashboard } from "@/lib/dashboard";
import { AGE_BANDS, GENDERS, type AgeBand, type Gender } from "@/lib/types";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  interest?: string;
  age?: string;
  gender?: string;
}>;

function parseList<T extends string>(raw: string | undefined, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

const AGE_DASH_LABEL: Record<string, string> = {
  "0-3": "Bebê (0–3)",
  "4-7": "Criança peq. (4–7)",
  "8-12": "Criança (8–12)",
  "13-17": "Adolescente (13–17)",
  "18-29": "Jovem adulto (18–29)",
  "30-49": "Adulto (30–49)",
  "50+": "Adulto 50+",
};

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const ageList = AGE_BANDS.map((b) => b.value);
  const genderList = GENDERS.map((g) => g.value);
  const ageBands = parseList<AgeBand>(sp.age, ageList);
  const genders = parseList<Gender>(sp.gender, genderList);
  const interestIds = (sp.interest ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const data = await loadDashboard({ interestIds, ageBands, genders });
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  function urlWith(updates: Record<string, string | null>) {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) p.set(k, String(v));
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  }
  function toggleListUrl(field: "age" | "gender" | "interest", value: string) {
    const current =
      field === "age" ? (ageBands as string[]) : field === "gender" ? (genders as string[]) : interestIds;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    return urlWith({ [field]: next.length ? next.join(",") : null });
  }
  const paramsString = (() => {
    const p = new URLSearchParams();
    if (interestIds.length) p.set("interest", interestIds.join(","));
    if (ageBands.length) p.set("age", ageBands.join(","));
    if (genders.length) p.set("gender", genders.join(","));
    return p.toString();
  })();

  const hasFilters = interestIds.length > 0 || ageBands.length > 0 || genders.length > 0;
  const adminInitials = condoName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Masthead */}
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
        <nav className="flex gap-1">
          <NavTab active>Mapa</NavTab>
          <NavTab href="/admin">Admin</NavTab>
          <NavTab href="/">Voltar</NavTab>
        </nav>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-3">PÚBLICO</span>
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-accent font-mono text-[11px] font-semibold text-white">
            {adminInitials}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-8 pb-16 pt-7">
        {/* Hero */}
        <div className="grid items-end gap-7 md:grid-cols-[1.3fr_0.9fr]">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
              Mapa do condomínio
            </div>
            <h1
              className="mt-2.5 m-0 font-display font-normal leading-none tracking-[-0.02em] text-ink"
              style={{ fontSize: 54 }}
            >
              {data.totalRespondents}{" "}
              <span className="font-display italic text-accent">vizinhos</span> dispostos
              {hasFilters && (
                <span className="mt-1 block font-display italic text-ink-3" style={{ fontSize: 30 }}>
                  de {data.totalProfiles} no total
                </span>
              )}
            </h1>
          </div>
          <div className="flex gap-4">
            <Stat label="responderam" value={data.totalProfiles} sub="no total" />
            <Stat
              label="recorte atual"
              value={data.totalRespondents}
              sub={hasFilters ? "com filtros" : "tudo"}
            />
            <Stat
              label="top interesse"
              value={data.rankings[0]?.count ?? 0}
              sub={data.rankings[0]?.name ?? "—"}
              accent
            />
          </div>
        </div>

        {/* Filters */}
        <Section title="Filtros" hint="Combine para encontrar quem mora aqui e curte o quê.">
          <div className="grid gap-6 md:grid-cols-[1.3fr_1fr_0.7fr]">
            <div>
              <Label count={interestIds.length}>Interesse</Label>
              <InterestFilter interests={data.interests} selectedIds={interestIds} paramsString={paramsString} />
            </div>

            <div>
              <Label count={ageBands.length}>Faixa etária</Label>
              <div className="flex flex-wrap gap-1">
                {AGE_BANDS.map((b) => (
                  <ChipFilter key={b.value} active={ageBands.includes(b.value)} href={toggleListUrl("age", b.value)}>
                    {AGE_DASH_LABEL[b.value]}
                  </ChipFilter>
                ))}
              </div>
            </div>

            <div>
              <Label count={genders.length}>Gênero</Label>
              <div className="flex flex-wrap gap-1">
                {GENDERS.map((g) => (
                  <ChipFilter
                    key={g.value}
                    active={genders.includes(g.value)}
                    href={toggleListUrl("gender", g.value)}
                  >
                    {g.label}
                  </ChipFilter>
                ))}
              </div>
            </div>
          </div>

          {hasFilters && (
            <div
              className="mt-3.5 flex items-center gap-2.5 pt-3.5"
              style={{ borderTop: "1px dashed var(--rule)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                Filtros ativos:
              </span>
              <span className="font-sans text-[12.5px] text-ink-2">
                {interestIds.length + ageBands.length + genders.length} ativos · resultado: {data.totalRespondents} pessoas
              </span>
              <Link
                href="/dashboard"
                className="ml-auto font-sans text-[12.5px] font-semibold text-accent hover:underline"
              >
                limpar tudo
              </Link>
            </div>
          )}
        </Section>

        {/* Heatmap + Top interests */}
        <div className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
          <Section
            title="Disponibilidade"
            hint={`Quanto mais escuro, mais gente livre. ${data.totalRespondents} pessoa(s) considerada(s).`}
            badge={
              interestIds.length === 1
                ? data.interests.find((i) => i.id === interestIds[0])?.name ?? null
                : interestIds.length > 1
                  ? `${interestIds.length} interesses`
                  : null
            }
          >
            <Heatmap data={data.heatmap} />
          </Section>

          <Section title="Top interesses" hint="Ranking pelo recorte filtrado.">
            <div className="flex flex-col gap-1.5">
              {data.rankings.length === 0 && (
                <p className="font-sans text-[13px] text-ink-3">Sem dados pra esse recorte.</p>
              )}
              {data.rankings.slice(0, 10).map((r, i) => {
                const max = data.rankings[0]?.count ?? 1;
                const pct = (r.count / max) * 100;
                const active = interestIds.includes(r.id);
                return (
                  <Link
                    key={r.id}
                    href={toggleListUrl("interest", r.id)}
                    scroll={false}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-0 px-2 py-1.5 text-left transition",
                      active && "bg-accent-soft",
                    )}
                  >
                    <span className="w-[18px] text-right font-mono text-[11px] text-ink-3">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate font-sans text-[13.5px] font-medium text-ink">
                          {r.name}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.06em] text-ink-3">
                          {r.category}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-[2px] bg-rule">
                        <div
                          className={cn("h-full rounded-[2px] transition-[width]", active ? "bg-accent" : "bg-ink-2")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-9 text-right font-mono text-[13px] font-semibold text-ink">
                      {r.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Demographics */}
        <div className="grid gap-5 md:grid-cols-2">
          <Section title="Por faixa etária">
            <Breakdown
              items={AGE_BANDS.map((b) => ({ value: b.value, label: AGE_DASH_LABEL[b.value] ?? b.label }))}
              counts={data.ageBreakdown as Record<string, number>}
              activeKeys={ageBands}
              field="age"
              urlBuilder={toggleListUrl}
            />
          </Section>

          <Section title="Por gênero">
            <Breakdown
              items={GENDERS.map((g) => ({ value: g.value, label: g.label }))}
              counts={data.genderBreakdown as Record<string, number>}
              activeKeys={genders}
              field="gender"
              urlBuilder={toggleListUrl}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function NavTab({ children, active, href }: { children: React.ReactNode; active?: boolean; href?: string }) {
  const cls = cn(
    "rounded-lg border-0 px-3.5 py-2 font-sans text-[13px] font-medium transition",
    active ? "bg-ink text-bg" : "bg-transparent text-ink-2 hover:bg-surface-2",
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number | string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-xl border px-4 py-3.5"
      style={{
        borderColor: accent ? "var(--accent)" : "var(--rule)",
        background: accent ? "color-mix(in oklch, var(--accent) 6%, var(--surface))" : "var(--surface)",
      }}
    >
      <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">{label}</div>
      <div
        className="mt-1 font-display font-normal leading-none tracking-[-0.02em] text-ink"
        style={{ fontSize: 36 }}
      >
        {value}
      </div>
      <div className={cn("mt-1 font-sans text-[11.5px]", accent ? "text-accent" : "text-ink-3")}>{sub}</div>
    </div>
  );
}

function Section({
  title,
  hint,
  badge,
  children,
}: {
  title: string;
  hint?: string;
  badge?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-rule bg-surface px-5 py-[18px]"
      style={{ borderRadius: 14 }}
    >
      <header className="mb-3.5 flex items-baseline justify-between gap-4">
        <div>
          <h2
            className="m-0 font-display text-[22px] font-normal italic leading-none tracking-[-0.01em] text-ink"
          >
            {title}
            {badge && (
              <span className="ml-2.5 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 align-middle font-sans text-[11px] font-medium not-italic text-accent">
                {badge}
              </span>
            )}
          </h2>
          {hint && <p className="mt-1.5 font-sans text-[12.5px] text-ink-3">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function Label({ children, count }: { children: React.ReactNode; count: number }) {
  return (
    <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-3">
      {children}
      {count > 0 && <span className="text-accent"> · {count}</span>}
    </div>
  );
}

function ChipFilter({
  children,
  active,
  href,
}: {
  children: React.ReactNode;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "rounded-full border px-[11px] py-1.5 font-sans text-[12.5px] font-medium transition",
        active ? "bg-ink text-bg border-ink" : "bg-surface-2 text-ink-2 border-rule hover:border-rule-strong",
      )}
    >
      {children}
    </Link>
  );
}

function Breakdown({
  items,
  counts,
  activeKeys,
  field,
  urlBuilder,
}: {
  items: Array<{ value: string; label: string }>;
  counts: Record<string, number>;
  activeKeys: string[];
  field: "age" | "gender";
  urlBuilder: (field: "age" | "gender" | "interest", value: string) => string;
}) {
  const max = Math.max(0, ...items.map((i) => counts[i.value] ?? 0));
  return (
    <div className="flex flex-col gap-1">
      {items.map((i) => {
        const c = counts[i.value] ?? 0;
        const pct = max ? (c / max) * 100 : 0;
        const active = activeKeys.includes(i.value);
        return (
          <Link
            key={i.value}
            href={urlBuilder(field, i.value)}
            scroll={false}
            className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5", active && "bg-accent-soft")}
          >
            <span className="w-28 truncate font-sans text-[12.5px] text-ink-2">{i.label}</span>
            <div className="h-1 flex-1 rounded-[2px] bg-rule">
              <div
                className={cn("h-full rounded-[2px]", active ? "bg-accent" : "bg-ink-2")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right font-mono text-[11.5px] text-ink">{c}</span>
          </Link>
        );
      })}
    </div>
  );
}
