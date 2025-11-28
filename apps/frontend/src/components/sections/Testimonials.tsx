"use client";

/**
 * Testimonials - Seção de depoimentos
 * 
 * MELHORIAS APLICADAS:
 * 1. Animação staggered nos cards
 * 2. Hover com elevação e borda iluminada
 * 3. Avatar com gradiente animado
 * 4. Layout responsivo
 */

import { motion } from "framer-motion";
import { staggerContainer, cardVariants } from "@/lib/animations";

// ============================================
// TYPES
// ============================================

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface TestimonialsProps {
  badge?: string;
  title: string;
  description?: string;
  testimonials: Testimonial[];
}

// ============================================
// SUBCOMPONENTES
// ============================================

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  // Cores alternadas para os avatares
  const gradients = [
    "from-emerald-400 to-cyan-400",
    "from-violet-400 to-purple-400",
    "from-sky-400 to-blue-400",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        y: -6,
        transition: { duration: 0.2 },
      }}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 transition-all duration-300 hover:border-slate-600/50 hover:bg-slate-800/50"
    >
      {/* Quote icon */}
      <div className="absolute right-6 top-6 text-4xl text-slate-800">"</div>

      {/* Quote */}
      <p className="relative mb-6 text-sm leading-relaxed text-slate-300">
        {testimonial.quote}
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-sm font-bold text-slate-950`}>
          {testimonial.author.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{testimonial.author}</p>
          <p className="text-xs text-slate-500">
            {testimonial.role} · {testimonial.company}
          </p>
        </div>
      </div>

      {/* Hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function Testimonials({
  badge = "Quem usa",
  title,
  description,
  testimonials,
}: TestimonialsProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="w-full space-y-12"
    >
      {/* Header */}
      <motion.div 
        variants={cardVariants}
        className="flex flex-col items-center gap-4 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {badge}
        </span>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{title}</h2>
        {description && (
          <p className="max-w-2xl text-base text-slate-400">{description}</p>
        )}
      </motion.div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.author}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
}
