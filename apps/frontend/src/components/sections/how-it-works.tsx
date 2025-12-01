"use client";

import { motion, type Variants } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Run one command",
    description:
      "DxGen walks you through a simple wizard. Pick your output, choose your doc type, and let AI do the rest.",
    code: `$ dxgen generate

? Output directory for docs: ./docs
? Do you want to sync your project? Yes
? What types of documentation? README
? Style of the documentation: Onboarding for new users

◐ Scanning repository...
◐ Building semantic index...
◐ Generating documentation...

✅ Documentation saved!
📄 File: ./docs/README.md`,
    color: "cyan",
  },
  {
    number: "2",
    title: "Context from everywhere",
    description:
      "DxGen doesn't just look at one file. It retrieves relevant context from your entire codebase using RAG—modules, dependencies, patterns.",
    code: `◐ Retrieving relevant context...

Found 23 relevant files:
  src/api/routes.ts
  src/middleware/auth.ts
  src/services/user.service.ts
  ...18 more

◐ Analyzing code patterns...
◐ Building documentation context...

✓ Context ready (847 embeddings)`,
    color: "emerald",
  },
  {
    number: "3",
    title: "Automate forever",
    description:
      "Set up a GitHub Action. DxGen only reprocesses what changed. Your docs stay accurate on every push.",
    code: `# .github/workflows/docs.yml
name: Sync Documentation
on: [push]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g dxgen
      - run: dxgen login --token \${{ secrets.DXGEN_TOKEN }}
      - run: dxgen generate --sync --ci
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'docs: sync documentation'`,
    color: "purple",
  },
];

const colorClasses = {
  cyan: {
    badge: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400/70",
    dot: "bg-cyan-400/40",
    number: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    glow: "from-cyan-500/20 to-cyan-500/5",
  },
  emerald: {
    badge: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400/70",
    dot: "bg-emerald-400/40",
    number: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    glow: "from-emerald-500/20 to-emerald-500/5",
  },
  purple: {
    badge: "border-purple-500/20 bg-purple-500/5 text-purple-400/70",
    dot: "bg-purple-400/40",
    number: "border-purple-500/20 bg-purple-500/10 text-purple-400",
    glow: "from-purple-500/20 to-purple-500/5",
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 backdrop-blur-sm mb-6"
          >
            <span className="text-[10px] font-light uppercase tracking-[0.08em] text-cyan-400/70">
              How it works
            </span>
            <span className="h-1 w-1 rounded-full bg-cyan-400/40" />
            <span className="text-xs font-light tracking-tight text-white/80">
              3 steps
            </span>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extralight tracking-tight text-white"
          >
            From code to docs in minutes
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24 lg:space-y-32">
          {steps.map((step, index) => {
            const colors =
              colorClasses[step.color as keyof typeof colorClasses];
            const isEven = index % 2 === 1;

            return (
              <motion.div
                key={step.title}
                variants={stepContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                {/* Text content */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={isEven ? "lg:order-2" : ""}
                >
                  <div className="space-y-4">
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${colors.number} text-sm font-light`}
                    >
                      {step.number}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white">
                      {step.title}
                    </h3>
                    <p className="text-base sm:text-lg font-light leading-relaxed tracking-tight text-white/75 max-w-md">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Code block */}
                <motion.div
                  variants={fadeInUp}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={isEven ? "lg:order-1" : ""}
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div
                      className={`absolute -inset-4 bg-linear-to-br ${colors.glow} rounded-2xl blur-2xl opacity-50`}
                    />

                    {/* Terminal */}
                    <div className="relative bg-[#0D0D12] rounded-xl border border-white/10 overflow-hidden">
                      {/* Terminal header */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                        <div className="w-3 h-3 rounded-full bg-green-500/60" />
                        <span className="ml-2 text-xs text-white/40 font-light">
                          terminal
                        </span>
                      </div>

                      {/* Code content */}
                      <div className="p-4 sm:p-6 overflow-x-auto">
                        <pre className="font-mono text-xs sm:text-sm text-[#E4E4E7] leading-relaxed whitespace-pre">
                          <code>{step.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
