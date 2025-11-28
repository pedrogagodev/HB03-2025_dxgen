"use client";

/**
 * HeroSection - Seção principal da landing page
 * 
 * MELHORIAS APLICADAS:
 * 1. Animações staggered com Framer Motion (título, badge, subtítulo, form)
 * 2. Efeito de blur no texto durante a animação
 * 3. Badge com animação de pulse mais suave
 * 4. Input com animação de foco melhorada
 * 5. Código mais limpo e componentizado
 * 6. Melhor responsividade mobile-first
 */

import { motion } from "framer-motion";
import { heroContainerVariants, heroItemVariants } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface HeroSectionProps {
  title: string;
  titleSuffix?: string;
  subtitle: string;
  emailPlaceholder?: string;
  ctaLabel?: string;
  helperText?: string;
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface BadgeProps {
  text: string;
}

function Badge({ text }: BadgeProps) {
  return (
    <motion.span
      variants={heroItemVariants}
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {text}
    </motion.span>
  );
}

interface EmailFormProps {
  placeholder: string;
  ctaLabel: string;
}

function EmailForm({ placeholder, ctaLabel }: EmailFormProps) {
  return (
    <motion.form
      variants={heroItemVariants}
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e: React.FormEvent) => e.preventDefault()}
    >
      {/* Input container */}
      <div className="group relative flex-1">
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-sky-500/20 opacity-0 blur transition-opacity group-focus-within:opacity-100" />
        <input
          type="email"
          placeholder={placeholder}
          className="relative w-full rounded-full border border-slate-700/50 bg-slate-900/80 px-5 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-emerald-500/50 focus:bg-slate-900"
        />
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
      >
        {ctaLabel}
      </motion.button>
    </motion.form>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function HeroSection({
  title,
  titleSuffix,
  subtitle,
  emailPlaceholder = "Digite seu e-mail de trabalho",
  ctaLabel = "Receber acesso",
  helperText = "Sem spam. Enviaremos apenas novidades sobre o DxGen.",
}: HeroSectionProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={heroContainerVariants}
      className="flex w-full flex-col items-center px-4 text-center"
    >
      {/* Badge */}
      {titleSuffix && <Badge text={titleSuffix} />}

      {/* Title */}
      <motion.h1
        variants={heroItemVariants}
        className="mt-6 max-w-4xl bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={heroItemVariants}
        className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
      >
        {subtitle}
      </motion.p>

      {/* Email Form */}
      <div className="mt-10 w-full max-w-md">
        <EmailForm placeholder={emailPlaceholder} ctaLabel={ctaLabel} />
      </div>

      {/* Helper Text */}
      {helperText && (
        <motion.p
          variants={heroItemVariants}
          className="mt-4 text-xs text-slate-500"
        >
          {helperText}
        </motion.p>
      )}
    </motion.section>
  );
}
