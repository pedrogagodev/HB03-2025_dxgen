"use client";

import { X, Check } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

interface PointsListCardsProps {
  points: string[];
  variant: "problem" | "solution";
}

export function PointsListCards({ points, variant }: PointsListCardsProps) {
  const isProblem = variant === "problem";

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="space-y-3"
    >
      {points.map((point, index) => (
        <motion.li
          key={index}
          variants={cardVariants}
          className={`flex items-start gap-3 rounded-xl border p-3 backdrop-blur-sm transition-colors ${
            isProblem
              ? "border-red-500/10 bg-red-500/5 hover:bg-red-500/10"
              : "border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10"
          }`}
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              isProblem
                ? "bg-red-500/20 text-red-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {isProblem ? (
              <X className="h-3 w-3" strokeWidth={3} />
            ) : (
              <Check className="h-3 w-3" strokeWidth={3} />
            )}
          </span>
          <span className="text-sm font-light leading-relaxed text-white/80">
            {point}
          </span>
        </motion.li>
      ))}
    </motion.ul>
  );
}
