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

export const TIME_SLOTS = [
  { value: "morning", label: "Manhã", hint: "06h–12h" },
  { value: "afternoon", label: "Tarde", hint: "12h–18h" },
  { value: "evening", label: "Noite", hint: "18h–24h" },
  { value: "dawn", label: "Madrugada", hint: "00h–06h" },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number]["value"];

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
  { value: "curious", label: "Curioso(a)" },
  { value: "practitioner", label: "Praticante" },
  { value: "teacher", label: "Quero ensinar" },
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
