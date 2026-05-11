import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/input";
import { StepHeader } from "@/components/step-header";
import { StickyFooter } from "@/components/sticky-footer";
import { TitleBlock } from "@/components/title-block";
import { identifyAction } from "@/lib/actions";
import { getSessionProfileId } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { APT_PATTERN, TOWERS, splitUnit } from "@/lib/unit";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string }>;

export default async function IdentifyPage({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  const profileId = await getSessionProfileId();
  let prefillName = "";
  let prefillTower = "";
  let prefillApt = "";
  if (profileId) {
    const sb = supabaseAdmin();
    const { data } = await sb.from("profiles").select("full_name, unit").eq("id", profileId).maybeSingle();
    if (data) {
      prefillName = data.full_name ?? "";
      const split = splitUnit(data.unit ?? "");
      prefillTower = split.tower;
      prefillApt = split.apt;
    }
  }
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <StepHeader current="identify" condoName={condoName} />
      <TitleBlock
        eyebrow="01 · Identificação"
        title="Quem é você?"
        sub="Use seu nome completo. Selecione a torre e digite o número do apartamento — só assim a admin consegue cruzar com a lista oficial."
      />

      <form action={identifyAction} className="flex flex-1 flex-col">
        <div className="flex-1 px-5">
          <Field
            label="Nome completo"
            id="full_name"
            name="full_name"
            required
            autoComplete="name"
            defaultValue={prefillName}
            placeholder="Maria da Silva"
          />

          <div className="h-[14px]" />

          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div>
              <FieldLabel htmlFor="tower">Torre</FieldLabel>
              <select
                id="tower"
                name="tower"
                required
                defaultValue={prefillTower}
                className="h-[50px] w-full appearance-none rounded-xl border border-rule bg-surface px-[14px] font-mono text-[14px] tracking-[0.01em] text-ink outline-none transition focus:border-ink"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path fill='none' stroke='%237a7166' stroke-width='1.5' d='M1 1.5l5 5 5-5'/></svg>\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 36,
                }}
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {TOWERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Apartamento"
              id="apt"
              name="apt"
              required
              inputMode="numeric"
              pattern={APT_PATTERN}
              title="Apenas números."
              maxLength={5}
              defaultValue={prefillApt}
              placeholder="ex: 302"
              mono
            />
          </div>

          <p className="mt-1.5 font-mono text-[10px] tracking-[0.05em] text-ink-3">
            Apartamento — só números. Salvo como <code className="font-mono">{prefillTower || "A1"}-{prefillApt || "302"}</code>.
          </p>

          {error === "missing" && (
            <p className="mt-3 text-[12.5px] text-[color:var(--danger)]">
              Preencha nome, torre e apartamento pra continuar.
            </p>
          )}
          {error === "tower" && (
            <p className="mt-3 text-[12.5px] text-[color:var(--danger)]">
              Selecione uma torre da lista.
            </p>
          )}
          {error === "apt" && (
            <p className="mt-3 text-[12.5px] text-[color:var(--danger)]">
              Apartamento inválido — use apenas números.
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
