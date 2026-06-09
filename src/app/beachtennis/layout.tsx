import type { Metadata } from "next";

const title = "Beach no Rancho";
const description =
  "Ache os 3 dias que combinam pra todo mundo do rancho jogar beach tennis. Marque quando você está livre, quem está e onde a galera se encontra.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
};

export default function BeachTennisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
