"use client";

/**
 * CTASection - Call to Action final
 * 
 * MELHORIAS APLICADAS:
 * 1. Animação de entrada com fade + scale
 * 2. Botões com hover animado
 * 3. Borda com gradiente sutil
 * 4. Background com glow animado
 */

import { motion } from "framer-motion";
import { sectionVariants } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface CTASectionProps {
  title: string;
  description: string;
  primaryCta: {
    label: string;
    href?: string;
  };
  secondaryCta?: {
    label: string;
    href?: string;
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function CTASection({
  title,
  description,
  primaryCta,
  secondaryCta,
}: CTASectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      className="relative w-full overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-slate-900/50 to-slate-900/50 px-6 py-16 text-center sm:px-12 sm:py-20"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="text-base text-slate-400 sm:text-lg">
          {description}
        </p>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row sm:gap-4">
          <motion.a
            href={primaryCta.href ?? "#"}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{primaryCta.label}</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.a>

          {secondaryCta && (
            <motion.a
              href={secondaryCta.href ?? "#"}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-8 py-3 text-sm font-medium text-slate-200 transition-all hover:border-slate-600 hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {secondaryCta.label}
            </motion.a>
          )}
        </div>
      </div>
    </motion.section>
  );
}
