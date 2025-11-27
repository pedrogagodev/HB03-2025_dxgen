type HeroSectionProps = {
  title: string;
  titleSuffix?: string;
  subtitle: string;
  emailPlaceholder?: string;
  ctaLabel?: string;
  helperText?: string;
};

export function HeroSection({
  title,
  titleSuffix,
  subtitle,
  emailPlaceholder = "Digite seu e-mail de trabalho",
  ctaLabel = "Receber acesso",
  helperText = "Sem spam. Enviaremos apenas novidades sobre o DxGen e acesso antecipado à CLI.",
}: HeroSectionProps) {
  return (
    <section className="flex w-full flex-col items-center text-center md:max-w-3xl">
      <div className="animate-fade-in-up flex flex-col items-center gap-3">
        <h1 className="bg-gradient-to-b from-slate-50 to-slate-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {titleSuffix && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            {titleSuffix}
          </span>
        )}
      </div>

      <p className="animate-fade-in-up stagger-1 mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
        {subtitle}
      </p>

      <form className="animate-fade-in-up stagger-2 mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row">
        <div className="flex w-full items-center rounded-full border border-slate-700/80 bg-slate-900/70 px-4 py-2 text-left text-sm text-slate-200 shadow-[0_18px_60px_rgba(15,23,42,0.9)] transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_30px_rgba(16,185,129,0.2)] sm:py-2.5">
          <input
            type="email"
            placeholder={emailPlaceholder}
            className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-500 sm:text-sm"
          />
          <button
            type="submit"
            className="ml-3 hidden whitespace-nowrap rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-900 transition-all hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] sm:inline-flex"
          >
            {ctaLabel}
          </button>
        </div>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 transition-all hover:bg-emerald-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] sm:hidden"
        >
          {ctaLabel}
        </button>
      </form>

      {helperText ? (
        <p className="animate-fade-in-up stagger-3 mt-3 text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </section>
  );
}
