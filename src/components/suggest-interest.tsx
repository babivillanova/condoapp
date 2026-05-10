"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import { suggestInterestAction } from "@/lib/actions";

export function SuggestInterest({ initialState }: { initialState: "ok" | "invalid" | null }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [shown, setShown] = useState<typeof initialState>(initialState);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const fd = new FormData();
    fd.set("name", trimmed);
    startTransition(() => {
      suggestInterestAction(fd);
      setName("");
      setShown("ok");
    });
  }

  return (
    <div className="space-y-3">
      <FieldLabel>Falta algum?</FieldLabel>
      <p className="font-sans text-[12.5px] leading-[1.5] text-ink-3">
        Sugira pra gente — a admin avalia e adiciona pra todos.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Ex: Stand-up, Apicultura..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
        <Button type="button" variant="ghost" full={false} onClick={submit} disabled={pending || name.trim().length < 2}>
          {pending ? "Enviando..." : "Sugerir"}
        </Button>
      </div>
      {shown === "ok" && <p className="font-sans text-[12.5px] text-accent">✓ Sugestão enviada. Obrigada!</p>}
      {shown === "invalid" && (
        <p className="font-sans text-[12.5px] text-[color:var(--danger)]">
          Sugestão inválida (use entre 2 e 80 caracteres).
        </p>
      )}
    </div>
  );
}
