"use client";

import { Button } from "@/components/ui/button";

type Props = { onDismiss: () => void };

export function LevelHintModal({ onDismiss }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(28,26,23,0.45)" }}
      onClick={onDismiss}
    >
      <div
        className="m-3 max-w-[440px] rounded-2xl border border-rule bg-bg px-6 py-7 shadow-lg"
        style={{ borderRadius: 14 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
          Dica · uso dos níveis
        </div>
        <h2
          className="mt-2 font-display font-normal leading-[1.05] tracking-[-0.015em] text-ink"
          style={{ fontSize: 28 }}
        >
          Diz pra gente o quanto você <span className="font-display italic text-accent">manja</span>.
        </h2>
        <p className="mt-3 font-sans text-[14px] leading-[1.5] text-ink-2">
          Sempre que um interesse fica selecionado, aparece um nível ao lado. Toque pra alternar:
        </p>

        <ul className="mt-4 flex flex-col gap-2.5">
          <LevelRow short="I" label="Iniciante" hint="curioso(a), nunca pratiquei ou pratico pouco" />
          <LevelRow short="II" label="Intermediário" hint="pratico com alguma frequência" />
          <LevelRow short="III" label="Avançado" hint="domino bem — topo ajudar a ensinar" />
        </ul>

        <p className="mt-5 font-sans text-[12.5px] text-ink-3">
          A admin usa isso pra dividir turmas e achar quem pode ensinar.
        </p>

        <div className="mt-6">
          <Button type="button" onClick={onDismiss}>
            Entendi →
          </Button>
        </div>
      </div>
    </div>
  );
}

function LevelRow({ short, label, hint }: { short: string; label: string; hint: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[11px] font-bold tracking-[0.05em] text-white">
        {short}
      </span>
      <div>
        <div className="font-sans text-[14px] font-semibold text-ink">{label}</div>
        <div className="font-sans text-[12.5px] text-ink-3">{hint}</div>
      </div>
    </li>
  );
}
