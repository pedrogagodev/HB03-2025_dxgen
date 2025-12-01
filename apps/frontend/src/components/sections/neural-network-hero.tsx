"use client";

import { motion, type Variants } from "framer-motion";
import { DemoSection } from "./demo-section";
import { AnimatedText } from "@/components/ui/animated-text";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const fadeInFromTop: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0 },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface HeroProps {
  title: string;
  description: string;
  badgeText?: string;
  badgeLabel?: string;
  ctaButtons?: Array<{ text: string; href: string; primary?: boolean }>;
  microDetails?: Array<string>;
}

export default function Hero({
  title,
  description,
  badgeText = "Generative Surfaces",
  badgeLabel = "New",
  ctaButtons = [
    { text: "Get started", href: "#get-started", primary: true },
    { text: "View showcase", href: "#showcase" },
  ],
  microDetails = ["Low‑weight font", "Tight tracking", "Subtle motion"],
}: HeroProps) {
  return (
    <section className="relative h-screen w-screen overflow-hidden">
      <div className="relative mx-auto flex h-full max-w-7xl items-center gap-8 px-6 md:px-10 lg:gap-12 lg:px-16">
        <div className="flex w-full flex-col items-start gap-6 sm:gap-8 lg:w-1/2">
          <motion.div
            variants={fadeInFromTop}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="text-[10px] font-light uppercase tracking-[0.08em] text-white/70">
              {badgeLabel}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="text-xs font-light tracking-tight text-white/80">
              {badgeText}
            </span>
          </motion.div>

          <AnimatedText
            text={title}
            as="h1"
            className="max-w-xl text-left text-5xl font-extralight leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
            delay={0.1}
            stagger={0.15}
            duration={0.9}
            inView={false}
          />

          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.6,
            }}
            className="max-w-xl text-left text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg"
          >
            {description}
          </motion.p>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.75,
            }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            {ctaButtons.map((button) => (
              <a
                key={button.href}
                href={button.href}
                className={`rounded-2xl border border-white/10 px-5 py-3 text-sm font-light tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 duration-300 ${
                  button.primary
                    ? "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                    : "text-white/80 hover:bg-white/5"
                }`}
              >
                {button.text}
              </a>
            ))}
          </motion.div>

          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.9 }}
            className="mt-8 flex flex-wrap gap-6 text-xs font-extralight tracking-tight text-white/60"
          >
            {microDetails.map((detail) => (
              <motion.li
                key={detail}
                variants={fadeIn}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="flex items-center gap-2"
              >
                <span className="h-1 w-1 rounded-full bg-white/40" /> {detail}
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="hidden w-1/2 lg:block">
          <DemoSection />
        </div>
      </div>
    </section>
  );
}
