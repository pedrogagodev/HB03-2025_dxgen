"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInUp, fadeInDown, fadeInLeft, fadeInRight, fadeIn } from "@/lib/animations";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const directionVariants: Record<Direction, Variants> = {
  up: fadeInUp,
  down: fadeInDown,
  left: fadeInLeft,
  right: fadeInRight,
  none: fadeIn,
};

/**
 * Componente de fade-in reutilizável
 * Suporta diferentes direções e delays customizados
 */
export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration,
  className,
  once = true,
}: FadeInProps) {
  const variants = directionVariants[direction];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={variants}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
