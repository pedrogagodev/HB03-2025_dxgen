"use client";

import { useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-slate-800/60 bg-slate-950/60 px-4 py-3 backdrop-blur-lg md:px-6 md:py-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 text-sm text-slate-200">
        <div className="flex flex-1 items-center gap-3">
          <a href="#" className="flex items-center gap-3">
            <Image
              src={logoImage}
              alt="DxGen Logo"
              className="h-10 w-auto md:h-12"
              priority
            />
            {subtitle ? (
              <span className="hidden text-[11px] text-slate-400 md:inline-block">
                {subtitle}
              </span>
            ) : null}
          </a>
        </div>

        <div className="hidden items-center gap-8 text-xs font-medium md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-300 transition-colors hover:text-slate-50"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 text-xs md:flex">
          {secondaryCtaLabel ? (
            <button
              type="button"
              className="rounded-full border border-slate-700 px-4 py-1.5 font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-slate-50"
            >
              {secondaryCtaLabel}
            </button>
          ) : null}
          {primaryCtaLabel ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-colors hover:bg-emerald-300"
            >
              {primaryCtaLabel}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          aria-label="Abrir menu de navegação"
          className="inline-flex items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/70 p-2 text-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.9)] md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="sr-only">Alternar menu</span>
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>

      {isMenuOpen ? (
        <div className="mx-auto mt-3 max-w-6xl rounded-2xl border border-slate-800/80 bg-slate-950/95 px-4 py-3 text-sm text-slate-100 shadow-[0_18px_80px_rgba(15,23,42,0.95)] md:hidden">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 text-xs font-medium">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-2 py-1.5 text-slate-300 hover:bg-slate-800/80 hover:text-slate-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2 text-xs">
              {secondaryCtaLabel ? (
                <button
                  type="button"
                  className="w-full rounded-full border border-slate-700 px-4 py-1.5 font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50"
                >
                  {secondaryCtaLabel}
                </button>
              ) : null}
              {primaryCtaLabel ? (
                <button
                  type="button"
                  className="w-full rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.8)] hover:bg-emerald-300"
                >
                  {primaryCtaLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
