import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { loginAdminAction } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string }>;

export default async function AdminLogin({ searchParams }: { searchParams: SearchParams }) {
  const { error } = await searchParams;
  return (
    <Card>
      <CardTitle>Acesso administrativo</CardTitle>
      <CardDescription>Apenas a administração do condomínio.</CardDescription>
      <form action={loginAdminAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error === "invalid" && <p className="text-sm text-red-600">Credenciais inválidas.</p>}
        {error === "server" && <p className="text-sm text-red-600">Admin não configurado (env vars ADMIN_EMAIL / ADMIN_PASSWORD).</p>}
        <Button type="submit" size="lg" className="w-full">Entrar</Button>
      </form>
    </Card>
  );
}
