import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa de Interesses do Condomínio",
  description:
    "Descubra interesses em comum entre os moradores do seu condomínio e organize aulas, encontros e eventos com base em demanda real.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg text-ink">
        <div className="fade-in min-h-screen">{children}</div>
      </body>
    </html>
  );
}
