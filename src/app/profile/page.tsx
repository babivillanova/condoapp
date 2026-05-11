import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/step-header";
import { StickyFooter } from "@/components/sticky-footer";
import { TitleBlock, Italic } from "@/components/title-block";
import { profileAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { AGE_BANDS, GENDERS } from "@/lib/types";

export const dynamic = "force-dynamic";

const AGE_RANGES: Record<string, string> = {
  "0-3": "0–3",
  "4-7": "4–7",
  "8-12": "8–12",
  "13-17": "13–17",
  "18-29": "18–29",
  "30-49": "30–49",
  "50+": "50+",
};

const AGE_LABEL: Record<string, string> = {
  "0-3": "Bebê",
  "4-7": "Criança peq.",
  "8-12": "Criança",
  "13-17": "Adolescente",
  "18-29": "Jovem adulto",
  "30-49": "Adulto",
  "50+": "Adulto 50+",
};

export default async function ProfilePage() {
  const profileId = await getSessionProfileId();
  if (!profileId) redirect("/identify");

  const sb = supabaseAdmin();
  const { data } = await sb.from("profiles").select("age_band, gender").eq("id", profileId).maybeSingle();
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <StepHeader current="profile" condoName={condoName} />
      <TitleBlock
        eyebrow="02 · Sobre você"
        title={
          <>
            Pra montar grupos <Italic>compatíveis</Italic>
          </>
        }
        sub="Faixa etária e gênero ajudam a separar turmas (esportes, várias modalidades). Nunca aparece publicamente — só agregado."
      />

      <form action={profileAction} className="flex flex-1 flex-col">
        <div className="flex-1 px-5">
          <div className="mb-[10px] font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
            Faixa etária
          </div>
          <div className="grid grid-cols-2 gap-2">
            {AGE_BANDS.map((b) => (
              <AgeOption
                key={b.value}
                value={b.value}
                title={AGE_LABEL[b.value]}
                detail={AGE_RANGES[b.value]}
                checked={data?.age_band === b.value}
              />
            ))}
          </div>

          <div className="h-[22px]" />

          <div className="mb-[10px] font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3">
            Gênero
          </div>
          <div className="flex flex-col gap-2">
            {GENDERS.map((g) => (
              <GenderOption
                key={g.value}
                value={g.value}
                title={g.label}
                checked={data?.gender === g.value}
              />
            ))}
          </div>
        </div>

        <StickyFooter>
          <Button type="submit">Continuar →</Button>
        </StickyFooter>
      </form>
    </div>
  );
}

function AgeOption({
  value,
  title,
  detail,
  checked,
}: {
  value: string;
  title: string;
  detail: string;
  checked: boolean;
}) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-rule bg-surface px-[14px] py-3 font-sans text-[14px] font-medium text-ink transition hover:border-rule-strong has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg">
      <input
        type="radio"
        name="age_band"
        value={value}
        defaultChecked={checked}
        required
        className="sr-only"
      />
      <span>{title}</span>
      <span className="font-mono text-[11px] text-ink-3 transition group-has-[:checked]:text-[rgba(248,244,237,0.65)]">
        {detail}
      </span>
    </label>
  );
}

function GenderOption({
  value,
  title,
  checked,
}: {
  value: string;
  title: string;
  checked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-rule bg-surface px-4 py-[14px] font-sans text-[14px] font-medium text-ink transition hover:border-rule-strong has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bg">
      <input
        type="radio"
        name="gender"
        value={value}
        defaultChecked={checked}
        required
        className="sr-only"
      />
      <span>{title}</span>
    </label>
  );
}
