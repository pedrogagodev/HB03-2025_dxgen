"use client";

import {
  BadgeDollarSign,
  FileOutput,
  FolderTree,
  Network,
  ScanSearch,
  SquareTerminal,
  Workflow,
  Zap,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const featureVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function FeaturesSection() {
  const features = [
    {
      title: "Built for how developers actually work",
      description:
        "Every feature designed to fit your existing workflow, not replace it.",
      icon: <Workflow />,
    },
    {
      title: "CLI-first, zero config",
      description:
        "No web UI to configure, just login (for usage limit and pricing), npx and go.",
      icon: <SquareTerminal />,
    },
    {
      title: "Pricing like no other",
      description:
        "Our prices are best in the market. No cap, no lock, no credit card required.",
      icon: <BadgeDollarSign />,
    },
    {
      title: "Full codebase context",
      description:
        "Unlike file-by-file tools, DxGen indexes your entire repository. It understands how modules connect, what services depend on what, and the real architecture of your system.",
      icon: <FolderTree />,
    },
    {
      title: "Multiple output formats",
      description:
        "Generate Markdown for humans, JSON for APIs, llms.txt for AI agents. One source of truth, many consumers.",
      icon: <FileOutput />,
    },
    {
      title: "Incremental updates",
      description:
        "After the first run, DxGen only processes what changed. Perfect for CI/CD where every second counts.",
      icon: <Zap />,
    },
    {
      title: "Automatic stack detection",
      description:
        "DxGen detects your language, framework, and patterns. A Next.js app gets different documentation than a NestJS API.",
      icon: <ScanSearch />,
    },
    {
      title: "Architecture diagrams",
      description:
        "Generate Mermaid diagrams of your service dependencies, database schemas, and API flows automatically.",
      icon: <Network />,
    },
  ];
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto"
    >
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </motion.div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  const isLastColumn = index === 3 || index === 7;

  return (
    <motion.div
      variants={featureVariants}
      className={cn(
        "flex flex-col py-10 relative group/feature",
        !isLastColumn && "lg:border-r border-white/10",
        index < 4 && "lg:border-b border-white/10",
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-linear-to-t from-emerald-500/10 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-linear-to-b from-emerald-500/10 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-emerald-400">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-white">
          {title}
        </span>
      </div>
      <p className="text-sm text-white/70 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </motion.div>
  );
};
