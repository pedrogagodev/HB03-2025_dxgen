import Image from "next/image";
import logoImage from "@/assets/logo.png";

type NavLink = {
  label: string;
  href: string;
};

type NavbarProps = {
  subtitle?: string;
  links?: NavLink[];
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
};

export function Navbar({
  subtitle,
  links = [],
  primaryCtaLabel = "Começar grátis",
  secondaryCtaLabel = "Entrar",
}: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 px-6 py-4 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 text-sm text-slate-200">
        <div className="flex items-center gap-3">
          <Image
            src={logoImage}
            alt="DxGen Logo"
            className="h-12 w-auto"
            priority
          />
          {subtitle ? (
            <span className="hidden text-[11px] text-slate-400 md:inline-block">
              {subtitle}
            </span>
          ) : null}
        </div>

        <div className="hidden items-center gap-8 text-xs font-medium md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-slate-50"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          {secondaryCtaLabel ? (
            <button
              type="button"
              className="hidden rounded-full border border-slate-700 px-4 py-1.5 font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50 md:inline-flex"
            >
              {secondaryCtaLabel}
            </button>
          ) : null}
          {primaryCtaLabel ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.8)] hover:bg-emerald-300"
            >
              {primaryCtaLabel}
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
