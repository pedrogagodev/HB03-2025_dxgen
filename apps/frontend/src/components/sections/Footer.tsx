"use client";

/**
 * Footer - Rodapé da página
 * 
 * MELHORIAS APLICADAS:
 * 1. Animação de entrada suave
 * 2. Links com hover animado
 * 3. Layout responsivo
 * 4. Separação visual clara
 */

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  links?: FooterLink[];
  tagline?: string;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function Footer({
  links = [
    { label: "GitHub", href: "#" },
    { label: "Docs", href: "#" },
    { label: "Discord", href: "#" },
  ],
  tagline = "Feito para times que levam DX a sério.",
}: FooterProps) {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 md:flex-row md:py-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">DxGen</span>
          <span className="text-slate-600">·</span>
          <span className="text-sm text-slate-500">AI Documentation Agent</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="text-sm text-slate-500 transition-colors hover:text-white"
              whileHover={{ y: -1 }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-600">{tagline}</p>
      </div>
    </motion.footer>
  );
}
