"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

/**
 * Container que aplica stagger animation nos filhos
 * Use com StaggerItem para efeito cascata
 */
export function StaggerContainer({
  children,
  className,
  delay = 0.1,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-80px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Item filho do StaggerContainer
 * Herda a animação do container pai
 */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}
