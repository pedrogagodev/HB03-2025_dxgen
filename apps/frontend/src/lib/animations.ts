/**
 * Configurações de animação reutilizáveis para Framer Motion
 * Centralizadas para manter consistência em toda a aplicação
 */

import type { Transition, Variants } from "framer-motion";

// ============================================
// TRANSIÇÕES BASE
// ============================================

export const springTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
};

export const smoothTransition: Transition = {
  type: "tween",
  ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
  duration: 0.6,
};

export const fastTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.3,
};

// ============================================
// VARIANTES DE FADE
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 24,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: smoothTransition,
  },
};

// ============================================
// VARIANTES DE SCALE
// ============================================

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
};

export const scaleInUp: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
};

// ============================================
// VARIANTES DE CONTAINER (STAGGER)
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ============================================
// VARIANTES DE HOVER
// ============================================

export const hoverScale = {
  scale: 1.02,
  transition: fastTransition,
};

export const hoverLift = {
  y: -4,
  transition: fastTransition,
};

export const hoverGlow = {
  boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)",
  transition: fastTransition,
};

// ============================================
// VARIANTES DE TAP
// ============================================

export const tapScale = {
  scale: 0.98,
};

// ============================================
// VARIANTES PARA NAVBAR
// ============================================

export const navbarVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...smoothTransition,
      delay: 0.1,
    },
  },
};

export const mobileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// ============================================
// VARIANTES PARA HERO
// ============================================

export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
    },
  },
};

// ============================================
// VARIANTES PARA CARDS
// ============================================

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
};

// ============================================
// VARIANTES PARA SEÇÕES (SCROLL)
// ============================================

export const sectionVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...smoothTransition,
      duration: 0.7,
    },
  },
};

// ============================================
// VIEWPORT CONFIG PARA SCROLL ANIMATIONS
// ============================================

export const viewportConfig = {
  once: true,
  margin: "-100px",
};

export const viewportConfigEager = {
  once: true,
  margin: "-50px",
};
