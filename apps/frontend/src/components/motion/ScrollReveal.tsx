"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { sectionVariants, viewportConfig } from "@/lib/animations";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

/**
 * Componente para revelar conteúdo no scroll
 * Ideal para seções inteiras da página
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
