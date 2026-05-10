type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
};

export function TitleBlock({ eyebrow, title, sub }: Props) {
  return (
    <div className="px-5 pt-5 pb-[18px]">
      {eyebrow && (
        <div className="mb-[10px] font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-3">
          {eyebrow}
        </div>
      )}
      <h1
        className="m-0 font-display text-[34px] font-normal leading-[1.04] tracking-[-0.015em] text-ink"
        style={{ textWrap: "pretty" }}
      >
        {title}
      </h1>
      {sub && (
        <p
          className="mt-3 font-sans text-[14px] leading-[1.5] text-ink-2"
          style={{ textWrap: "pretty" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export function Italic({ children }: { children: React.ReactNode }) {
  return <span className="font-display italic text-accent">{children}</span>;
}
