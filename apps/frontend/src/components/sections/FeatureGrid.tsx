"use client";



import { motion } from "framer-motion";
import { staggerContainer, cardVariants } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
  accent?: "emerald" | "sky" | "violet" | "neutral";
}

interface FeatureGridProps {
  badge?: string;
  title: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

// ============================================
// STYLES
// ============================================

const accentStyles = {
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    icon: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/10",
  },
  sky: {
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    icon: "text-sky-400",
    glow: "group-hover:shadow-sky-500/10",
  },
  violet: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    icon: "text-violet-400",
    glow: "group-hover:shadow-violet-500/10",
  },
  neutral: {
    border: "border-slate-700/50",
    bg: "bg-slate-800/30",
    icon: "text-slate-400",
    glow: "group-hover:shadow-slate-500/10",
  },
};

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

// ============================================
// SUBCOMPONENTES
// ============================================

interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
}

function SectionHeader({ badge, title, description }: SectionHeaderProps) {
  return (
    <motion.div
      variants={cardVariants}
      className="flex flex-col items-center gap-4 text-center"
    >
      {badge && (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {description && (
        <p className="max-w-2xl text-base text-slate-400">{description}</p>
      )}
    </motion.div>
  );
}

interface FeatureCardProps {
  feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
  const accent = feature.accent ?? "neutral";
  const styles = accentStyles[accent];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 },
      }}
      className={`group relative rounded-2xl border p-6 transition-shadow duration-300 ${styles.border} ${styles.bg} ${styles.glow} hover:shadow-xl`}
    >
      {/* Icon */}
      {feature.icon && (
        <div className={`mb-4 ${styles.icon}`}>
          {feature.icon}
        </div>
      )}

      {/* Content */}
      <h3 className="mb-2 text-base font-semibold text-white">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-400">
        {feature.description}
      </p>

      {/* Hover glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${accent === 'neutral' ? 'slate' : accent}-500/5 to-transparent`} />
      </div>
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function FeatureGrid({
  badge,
  title,
  description,
  features,
  columns = 4,
}: FeatureGridProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="w-full space-y-12"
    >
      {/* Header */}
      <SectionHeader badge={badge} title={title} description={description} />

      {/* Grid */}
      <div className={`grid gap-4 ${columnClasses[columns]}`}>
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </div>
    </motion.section>
  );
}
