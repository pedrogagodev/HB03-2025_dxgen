type FeatureCard = {
  title: string;
  description: string;
  accent?: "emerald" | "sky" | "neutral";
};

type ProductMockupProps = {
  commandLabel?: string;
  sidebarTitle?: string;
  sidebarItems?: string[];
  highlightBadge?: string;
  heading: string;
  description: string;
  features: FeatureCard[];
};

const accentClasses: Record<NonNullable<FeatureCard["accent"]>, string> = {
  emerald: "border-emerald-500/30 bg-slate-900/60 text-emerald-200",
  sky: "border-slate-700/70 bg-slate-900/60 text-sky-200",
  neutral: "border-slate-700/70 bg-slate-900/60 text-slate-200",
};

export function ProductMockup({
  commandLabel = "dxgen init docs",
  sidebarTitle = "Navegação",
  sidebarItems = [
    "Visão geral",
    "Getting started",
    "CLI commands",
    "Configuração",
    "Integrações",
  ],
  highlightBadge = "AI-ready",
  heading,
  description,
  features,
}: ProductMockupProps) {
  return (
    <section
      id="mockup"
      className="pointer-events-none mt-12 flex w-full justify-center md:mt-16"
    >
      <div className="mockup-gradient-border relative w-full max-w-4xl rounded-3xl bg-slate-900/80 p-0.5">
        <div className="glass-surface relative overflow-hidden rounded-[1.4rem]">
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-[10px] text-slate-300">
              {commandLabel}
            </span>
          </div>

          <div className="grid gap-4 px-4 py-4 md:grid-cols-[260px,1fr] md:py-5">
            <div className="space-y-2 border-r border-slate-800/70 pr-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {sidebarTitle}
              </div>
              <div className="space-y-1.5 text-xs">
                {sidebarItems.map((item, index) => {
                  const isFirst = index === 0;
                  return (
                    <div
                      key={item}
                      className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
                        isFirst
                          ? "bg-slate-800/80 text-emerald-200"
                          : "text-slate-300 hover:bg-slate-800/50"
                      }`}
                    >
                      <span>{item}</span>
                      {isFirst && highlightBadge ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                          {highlightBadge}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-200 md:text-[13px]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-50">
                  {heading}
                </h2>
                <span className="hidden rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-300 md:inline-block">
                  dxgen generate --from ./src
                </span>
              </div>

              <p className="text-slate-400">{description}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {features.map((feature) => {
                  const accent = feature.accent ?? "neutral";
                  return (
                    <div
                      key={feature.title}
                      className={`rounded-xl border p-3 ${accentClasses[accent]}`}
                    >
                      <div className="mb-1 text-[11px] font-semibold">
                        {feature.title}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
