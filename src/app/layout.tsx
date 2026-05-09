import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa de Interesses do Condomínio",
  description:
    "Descubra interesses em comum entre os moradores do seu condomínio e organize aulas, encontros e eventos com base em demanda real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const condoName = process.env.NEXT_PUBLIC_CONDO_NAME ?? "Meu Condomínio";
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                {condoName.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-semibold sm:text-base">{condoName}</span>
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">
              Ver mapa
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-10 pt-4 text-center text-xs text-slate-400">
          Suas respostas são usadas apenas pela administração do condomínio. Resultados públicos são sempre agregados.
        </footer>
      </body>
    </html>
  );
}
