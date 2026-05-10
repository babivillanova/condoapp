import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { TitleBlock, Italic } from "@/components/title-block";
import { loginAdminAction } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string }>;

export default async function AdminLogin({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
      <div className="px-5 pt-[52px]">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
          <span className="h-[1px] w-[14px] bg-ink-3" />
          {condoName} · admin
        </div>
      </div>

      <TitleBlock
        title={
          <>
            Acesso <Italic>administrativo</Italic>
          </>
        }
        sub="Apenas a administração do condomínio. Use o email e senha definidos no servidor."
      />

      <form action={loginAdminAction} className="flex flex-1 flex-col">
        <div className="flex-1 space-y-3 px-5">
          <Field label="Email" id="email" name="email" type="email" required autoComplete="email" />
          <Field
            label="Senha"
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          {error === "invalid" && (
            <p className="font-sans text-[12.5px] text-[color:var(--danger)]">Credenciais inválidas.</p>
          )}
          {error === "server" && (
            <p className="font-sans text-[12.5px] text-[color:var(--danger)]">
              Admin não configurado (env vars ADMIN_EMAIL / ADMIN_PASSWORD).
            </p>
          )}
        </div>

        <div
          className="sticky bottom-0 z-[5] px-5 pt-[14px] pb-7"
          style={{ background: "linear-gradient(to bottom, transparent, var(--bg) 22%, var(--bg))" }}
        >
          <Button type="submit">Entrar →</Button>
        </div>
      </form>
    </div>
  );
}
