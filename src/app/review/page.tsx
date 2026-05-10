import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/step-header";
import { StickyFooter } from "@/components/sticky-footer";
import { TitleBlock, Italic } from "@/components/title-block";
import { MiniHeatmap } from "@/components/mini-heatmap";
import { deleteMyDataAction, submitAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { AFFINITIES, AGE_BANDS, GENDERS } from "@/lib/types";

export const dynamic = "force-dynamic";

const AGE_LABEL_SHORT: Record<string, string> = {
  "0-3": "Bebê",
  "4-7": "Criança peq.",
  "8-12": "Criança",
  "13-17": "Adolescente",
  "18-29": "Jovem adulto",
  "30-49": "Adulto",
  "50+": "Adulto 50+",
};
const AGE_RANGES: Record<string, string> = {
  "0-3": "0–3",
  "4-7": "4–7",
  "8-12": "8–12",
  "13-17": "13–17",
  "18-29": "18–29",
  "30-49": "30–49",
  "50+": "50+",
};

export default async function ReviewPage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const [{ data: profile }, { data: ints }, { data: avail }] = await Promise.all([
    sb
      .from("profiles")
      .select("full_name, unit, age_band, gender, status, submitted")
      .eq("id", profileId)
      .maybeSingle(),
    sb
      .from("profile_interests")
      .select("affinity, interests:interest_id (name, category)")
      .eq("profile_id", profileId),
    sb.from("availability").select("day_of_week, hour").eq("profile_id", profileId),
  ]);

  if (!profile) redirect("/identify");

  const ageRange = AGE_RANGES[profile.age_band] ?? profile.age_band;
  const ageLabel = AGE_LABEL_SHORT[profile.age_band] ?? profile.age_band;
  const genderLabel = GENDERS.find((g) => g.value === profile.gender)?.label ?? profile.gender;
  const slotSet = new Set((avail ?? []).map((a) => `${a.day_of_week}:${a.hour}`));

  const intsByCat = new Map<string, Array<{ name: string; affinity: string }>>();
  for (const r of ints ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const i = r.interests as any;
    if (!i) continue;
    const arr = intsByCat.get(i.category) ?? [];
    arr.push({ name: i.name, affinity: r.affinity });
    intsByCat.set(i.category, arr);
  }

  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <StepHeader current="review" condoName={condoName} />
      <TitleBlock
        eyebrow="05 · Revisão"
        title={
          <>
            Quase lá — <Italic>tudo certo?</Italic>
          </>
        }
        sub="Confira tudo. Pode voltar e editar a qualquer hora — nada fica trancado."
      />

      <div className="flex flex-1 flex-col gap-3 px-5">
        {/* Identification */}
        <ReviewCard label="Identificação" editHref="/identify">
          <div className="font-display text-[22px] leading-[1.1] text-ink">{profile.full_name}</div>
          <div className="mt-1 font-mono text-[12px] text-ink-2">{profile.unit}</div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Tag>
              {ageLabel} <span className="opacity-55">{ageRange}</span>
            </Tag>
            <Tag>{genderLabel}</Tag>
            {profile.status === "verified" && <Tag accent>✓ verificado</Tag>}
          </div>
        </ReviewCard>

        {/* Interests */}
        <ReviewCard label={`Interesses (${ints?.length ?? 0})`} editHref="/interests">
          {intsByCat.size === 0 ? (
            <div className="font-sans text-[13px] text-ink-3">Nenhum selecionado.</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {Array.from(intsByCat.entries()).map(([cat, list]) => (
                <div key={cat}>
                  <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-3">
                    {cat}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {list.map((it) => {
                      const aff = AFFINITIES.find((a) => a.value === it.affinity);
                      return (
                        <Tag key={it.name} small>
                          {it.name}
                          {aff && (
                            <span className="ml-1.5 font-mono text-[9px] font-semibold text-accent">
                              {aff.short}
                            </span>
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ReviewCard>

        {/* Availability */}
        <ReviewCard label={`Disponibilidade (${slotSet.size}/168)`} editHref="/availability">
          <MiniHeatmap slotSet={slotSet} />
        </ReviewCard>
      </div>

      <StickyFooter>
        <form action={submitAction}>
          <Button type="submit">{profile.submitted ? "Atualizar respostas →" : "Enviar respostas →"}</Button>
        </form>
        <form action={deleteMyDataAction}>
          <button
            type="submit"
            className="mt-2.5 w-full cursor-pointer border-0 bg-transparent p-1.5 font-sans text-[12px] text-ink-3 hover:text-[color:var(--danger)]"
          >
            Apagar todas as minhas respostas
          </button>
        </form>
      </StickyFooter>
    </div>
  );
}

function ReviewCard({
  label,
  editHref,
  children,
}: {
  label: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-rule bg-surface px-4 py-[14px]" style={{ borderRadius: 14 }}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">{label}</span>
        <Link href={editHref} className="font-sans text-[12px] font-semibold text-accent">
          editar
        </Link>
      </div>
      {children}
    </div>
  );
}

function Tag({ children, accent, small }: { children: React.ReactNode; accent?: boolean; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-sans font-medium ${
        small ? "px-2 py-[3px] text-[11.5px]" : "px-2.5 py-1 text-[12px]"
      } ${
        accent
          ? "border-[color-mix(in_oklch,var(--accent)_25%,transparent)] bg-accent-soft text-accent"
          : "border-rule bg-surface-2 text-ink-2"
      }`}
    >
      {children}
    </span>
  );
}
