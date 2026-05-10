export const AGE_BANDS = [
  { value: "0-3", label: "Bebê (0–3)" },
  { value: "4-7", label: "Criança pequena (4–7)" },
  { value: "8-12", label: "Criança (8–12)" },
  { value: "13-17", label: "Adolescente (13–17)" },
  { value: "18-29", label: "Jovem adulto (18–29)" },
  { value: "30-49", label: "Adulto (30–49)" },
  { value: "50+", label: "Adulto 50+" },
] as const;

export type AgeBand = (typeof AGE_BANDS)[number]["value"];

export const GENDERS = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "outro", label: "Outro / prefiro não dizer" },
] as const;

export type Gender = (typeof GENDERS)[number]["value"];

// 24 horas. Para facilitar o overview, agrupamos visualmente em 4 turnos.
export const HOURS = Array.from({ length: 24 }, (_, h) => h);

export const TURNOS = [
  { label: "Madrugada", hint: "00–05", range: [0, 5] as const },
  { label: "Manhã", hint: "06–11", range: [6, 11] as const },
  { label: "Tarde", hint: "12–17", range: [12, 17] as const },
  { label: "Noite", hint: "18–23", range: [18, 23] as const },
] as const;

export const DAYS = [
  { value: 0, short: "Dom", long: "Domingo" },
  { value: 1, short: "Seg", long: "Segunda" },
  { value: 2, short: "Ter", long: "Terça" },
  { value: 3, short: "Qua", long: "Quarta" },
  { value: 4, short: "Qui", long: "Quinta" },
  { value: 5, short: "Sex", long: "Sexta" },
  { value: 6, short: "Sáb", long: "Sábado" },
] as const;

export const AFFINITIES = [
  { value: "beginner", label: "Iniciante", short: "Ini" },
  { value: "intermediate", label: "Intermediário", short: "Int" },
  { value: "advanced", label: "Avançado", short: "Av" },
] as const;

export type Affinity = (typeof AFFINITIES)[number]["value"];

export type ProfileStatus = "verified" | "pending" | "rejected";

export type Interest = {
  id: string;
  category: string;
  subcategory: string | null;
  name: string;
  active: boolean;
  sort_order: number;
};

export type Profile = {
  id: string;
  full_name: string;
  unit: string;
  age_band: AgeBand;
  gender: Gender;
  matched_roster_id: string | null;
  status: ProfileStatus;
  parent_profile_id: string | null;
  submitted: boolean;
  created_at: string;
  updated_at: string;
};

export function formatHour(h: number): string {
  return `${String(h).padStart(2, "0")}h`;
}
