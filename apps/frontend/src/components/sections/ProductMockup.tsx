"use client";

/**
 * ProductMockup - Mockup visual do produto
 * 
 * MELHORIAS APLICADAS:
 * 1. Animação de entrada com scale + fade
 * 2. Hover sutil no container
 * 3. Código mais limpo e organizado
 * 4. Melhor responsividade
 */

import { motion } from "framer-motion";
import { sectionVariants, cardVariants } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface FeatureItem {
  title: string;
  description: string;
  accent?: "emerald" | "sky" | "neutral";
}

interface ProductMockupProps {
  commandLabel?: string;
  sidebarTitle?: string;
  sidebarItems?: string[];
  highlightBadge?: string;
  heading: string;
  description: string;
  features: FeatureItem[];
}

// ============================================
// STYLES
// ============================================

const accentStyles = {
  emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
  sky: "border-sky-500/30 bg-sky-500/5 text-sky-300",
  neutral: "border-slate-700/50 bg-slate-800/30 text-slate-300",
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

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
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
      className="w-full"
    >
      <motion.div
        className="relative mx-auto max-w-4xl"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient border effect */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-sky-500/20 opacity-50" />
        
        {/* Main container */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          {/* Window header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-700" />
              <span className="h-3 w-3 rounded-full bg-slate-700" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-400">
              {commandLabel}
            </span>
          </div>

          {/* Content */}
          <div className="grid gap-6 p-5 md:grid-cols-[240px,1fr] md:p-6">
            {/* Sidebar */}
            <div className="space-y-3 border-b border-slate-800/50 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {sidebarTitle}
              </p>
              <div className="space-y-1">
                {sidebarItems.map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                      index === 0
                        ? "bg-slate-800/60 text-emerald-300"
                        : "text-slate-400 hover:bg-slate-800/30"
                    }`}
                  >
                    <span>{item}</span>
                    {index === 0 && highlightBadge && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-400">
                        {highlightBadge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-white">{heading}</h3>
                <span className="hidden rounded-full bg-slate-800/60 px-3 py-1 text-[10px] text-slate-400 sm:inline-block">
                  dxgen generate --from ./src
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-400">
                {description}
              </p>

              {/* Feature cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                {features.map((feature) => {
                  const accent = feature.accent ?? "neutral";
                  return (
                    <motion.div
                      key={feature.title}
                      variants={cardVariants}
                      className={`rounded-xl border p-3 ${accentStyles[accent]}`}
                    >
                      <p className="mb-1 text-[11px] font-semibold">
                        {feature.title}
                      </p>
                      <p className="text-[10px] leading-relaxed text-slate-500">
                        {feature.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
