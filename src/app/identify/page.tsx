import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { StepHeader } from "@/components/step-header";
import { StickyFooter } from "@/components/sticky-footer";
import { TitleBlock } from "@/components/title-block";
import { identifyAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { UNIT_HELP, UNIT_PATTERN, UNIT_PLACEHOLDER } from "@/lib/unit";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string }>;

export default async function IdentifyPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  const profileId = await getSessionProfileId();
  let prefill: { full_name: string; unit: string } | null = null;
  if (profileId) {
    const sb = supabaseAdmin();
    const { data } = await sb.from("profiles").select("full_name, unit").eq("id", profileId).maybeSingle();
    if (data) prefill = data;
  }
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <StepHeader current="identify" condoName={condoName} />
      <TitleBlock
        eyebrow="01 · Identificação"
        title="Quem é você?"
        sub="Use seu nome completo e a unidade exatamente como aparece no condomínio. A lista oficial fica no servidor — só usamos pra confirmar."
      />

      <form action={identifyAction} className="flex flex-1 flex-col">
        <div className="flex-1 px-5">
          <Field
            label="Nome completo"
            id="full_name"
            name="full_name"
            required
            autoComplete="name"
            defaultValue={prefill?.full_name ?? ""}
            placeholder="Maria da Silva"
          />
          <div className="h-[14px]" />
          <Field
            label="Unidade"
            id="unit"
            name="unit"
            required
            autoComplete="off"
            inputMode="text"
            defaultValue={prefill?.unit ?? ""}
            placeholder={UNIT_PLACEHOLDER}
            pattern={UNIT_PATTERN}
            title={UNIT_HELP}
            maxLength={6}
            style={{ textTransform: "uppercase" }}
            mono
          />
          <p className="mt-1.5 font-mono text-[10px] tracking-[0.05em] text-ink-3">{UNIT_HELP}</p>

          {error === "missing" && (
            <p className="mt-3 text-[12.5px] text-[color:var(--danger)]">
              Preencha nome e unidade pra continuar.
            </p>
          )}
          {error === "unit_format" && (
            <p className="mt-3 text-[12.5px] text-[color:var(--danger)]">
              Formato da unidade inválido. Use letra da torre + número (ex: A1, B4, C12).
            </p>
          )}

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rule bg-surface-2 p-[14px]">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink font-mono text-[13px] font-semibold text-bg">
              ✓
            </div>
            <div>
              <div className="font-sans text-[13px] font-semibold text-ink">
                Como funciona a verificação
              </div>
              <p className="mt-1 font-sans text-[12.5px] leading-[1.5] text-ink-2">
                O servidor compara com a lista oficial do prédio. Se bater, sua resposta vira{" "}
                <em className="font-display italic">verificada</em>. Se não, fica{" "}
                <em className="font-display italic">pendente</em> até a administração revisar.
              </p>
            </div>
          </div>
        </div>

        <StickyFooter>
          <Button type="submit">Continuar →</Button>
        </StickyFooter>
      </form>
    </div>
  );
}
