"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <p className="text-sm text-slate-600">
        Falta algum interesse na lista? Sugira pra gente — a admin avalia e adiciona pra todos.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Ex: Stand-up comedy, Apicultura..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
        <Button type="button" variant="secondary" onClick={submit} disabled={pending || name.trim().length < 2}>
          {pending ? "Enviando..." : "Sugerir"}
        </Button>
      </div>
      {shown === "ok" && (
        <p className="text-sm text-emerald-700">✅ Sugestão enviada. Obrigada!</p>
      )}
      {shown === "invalid" && (
        <p className="text-sm text-red-600">Sugestão inválida (use entre 2 e 80 caracteres).</p>
      )}
    </div>
  );
}
