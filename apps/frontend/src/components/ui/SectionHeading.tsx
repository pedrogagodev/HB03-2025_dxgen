interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {badge ? (
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {badge}
        </span>
      ) : null}
      <h2 className="text-xl font-semibold text-slate-50 md:text-2xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm text-slate-400 md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
