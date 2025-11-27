interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  accent?: "emerald" | "sky" | "violet" | "neutral";
}

const accentClasses = {
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  sky: "border-sky-500/30 bg-sky-500/5",
  violet: "border-violet-500/30 bg-violet-500/5",
  neutral: "border-slate-700/70 bg-slate-900/50",
};

const iconAccentClasses = {
  emerald: "text-emerald-400",
  sky: "text-sky-400",
  violet: "text-violet-400",
  neutral: "text-slate-400",
};

export function FeatureCard({
  icon,
  title,
  description,
  accent = "neutral",
}: FeatureCardProps) {
  return (
    <div
      className={`group rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${accentClasses[accent]}`}
    >
      {icon ? (
        <div className={`mb-3 ${iconAccentClasses[accent]}`}>{icon}</div>
      ) : null}
      <h3 className="mb-2 text-sm font-semibold text-slate-100">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}
