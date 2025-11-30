"use client";

import { useRef } from "react";
import { Brain, FileCode, FileJson, FileText, Network } from "lucide-react";
import { AnimatedBeam } from "../ui/animated-beam";
import { PointsListSimple } from "./points-list-simple";
import { PointsListCards } from "./points-list-cards";

interface ProblemSolutionSectionProps {
  listVariant?: "simple" | "cards";
}

const problemPoints = [
  "README written 6 months ago—now a beautiful lie",
  "API docs are a graveyard of deprecated endpoints",
  "AI agents have zero context about your codebase",
];

const solutionPoints = [
  "Reads your entire codebase, not just one file",
  "Generates accurate, contextual documentation",
  "Always in sync—updates when your code changes",
];

export function ProblemSolutionSection({
  listVariant = "simple",
}: ProblemSolutionSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef1 = useRef<HTMLDivElement>(null);
  const inputRef2 = useRef<HTMLDivElement>(null);
  const inputRef3 = useRef<HTMLDivElement>(null);
  const brainRef = useRef<HTMLDivElement>(null);
  const outputRef1 = useRef<HTMLDivElement>(null);
  const outputRef2 = useRef<HTMLDivElement>(null);
  const outputRef3 = useRef<HTMLDivElement>(null);

  const PointsList = listVariant === "cards" ? PointsListCards : PointsListSimple;

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
        {/* Two-column Problem vs Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0">
          {/* Problem Column */}
          <div className="lg:border-r lg:border-white/10 lg:pr-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-[10px] font-light uppercase tracking-[0.08em] text-red-400/70">
                  Problem
                </span>
                <span className="h-1 w-1 rounded-full bg-red-400/40" />
                <span className="text-xs font-light tracking-tight text-white/80">
                  The challenge
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-tight text-white">
                Documentation is broken
              </h2>

              <PointsList points={problemPoints} variant="problem" />
            </div>
          </div>

          {/* Solution Column */}
          <div className="lg:pl-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-[10px] font-light uppercase tracking-[0.08em] text-emerald-400/70">
                  Solution
                </span>
                <span className="h-1 w-1 rounded-full bg-emerald-400/40" />
                <span className="text-xs font-light tracking-tight text-white/80">
                  The answer
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extralight tracking-tight text-white">
                Docs that write themselves
              </h2>

              <PointsList points={solutionPoints} variant="solution" />
            </div>
          </div>
        </div>

        {/* Animated Beam Diagram */}
        <div
          ref={containerRef}
          className="relative mt-16 lg:mt-24 h-48 md:h-64"
        >
          {/* Input files */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <div
              ref={inputRef1}
              className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <FileCode className="h-5 w-5 text-white/70" />
            </div>
            <div
              ref={inputRef2}
              className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <FileJson className="h-5 w-5 text-white/70" />
            </div>
            <div
              ref={inputRef3}
              className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <FileText className="h-5 w-5 text-white/70" />
            </div>
          </div>

          {/* Center brain */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-cyan-500/20 rounded-full blur-xl opacity-50" />
              <div
                ref={brainRef}
                className="relative p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <Brain className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Output files */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <div
              ref={outputRef1}
              className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <FileText className="h-5 w-5 text-cyan-400/70" />
              <span className="text-xs font-light tracking-tight text-white/60 hidden sm:inline">
                README.md
              </span>
            </div>
            <div
              ref={outputRef2}
              className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <Network className="h-5 w-5 text-emerald-400/70" />
              <span className="text-xs font-light tracking-tight text-white/60 hidden sm:inline">
                diagrams
              </span>
            </div>
            <div
              ref={outputRef3}
              className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <FileJson className="h-5 w-5 text-cyan-400/70" />
              <span className="text-xs font-light tracking-tight text-white/60 hidden sm:inline">
                llms.txt
              </span>
            </div>
          </div>

          {/* Animated beams - inputs to brain */}
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={inputRef1 as React.RefObject<HTMLElement>}
            toRef={brainRef as React.RefObject<HTMLElement>}
            gradientStartColor="#22d3ee"
            gradientStopColor="#10b981"
            pathColor="rgba(255,255,255,0.1)"
            curvature={-30}
            duration={5}
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={inputRef2 as React.RefObject<HTMLElement>}
            toRef={brainRef as React.RefObject<HTMLElement>}
            gradientStartColor="#22d3ee"
            gradientStopColor="#10b981"
            pathColor="rgba(255,255,255,0.1)"
            curvature={0}
            duration={5}
            delay={0.5}
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={inputRef3 as React.RefObject<HTMLElement>}
            toRef={brainRef as React.RefObject<HTMLElement>}
            gradientStartColor="#22d3ee"
            gradientStopColor="#10b981"
            pathColor="rgba(255,255,255,0.1)"
            curvature={30}
            duration={5}
            delay={1}
          />

          {/* Animated beams - brain to outputs */}
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={brainRef as React.RefObject<HTMLElement>}
            toRef={outputRef1 as React.RefObject<HTMLElement>}
            gradientStartColor="#10b981"
            gradientStopColor="#22d3ee"
            pathColor="rgba(255,255,255,0.1)"
            curvature={-30}
            duration={5}
            delay={1.5}
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={brainRef as React.RefObject<HTMLElement>}
            toRef={outputRef2 as React.RefObject<HTMLElement>}
            gradientStartColor="#10b981"
            gradientStopColor="#22d3ee"
            pathColor="rgba(255,255,255,0.1)"
            curvature={0}
            duration={5}
            delay={2}
          />
          <AnimatedBeam
            containerRef={containerRef as React.RefObject<HTMLElement>}
            fromRef={brainRef as React.RefObject<HTMLElement>}
            toRef={outputRef3 as React.RefObject<HTMLElement>}
            gradientStartColor="#10b981"
            gradientStopColor="#22d3ee"
            pathColor="rgba(255,255,255,0.1)"
            curvature={30}
            duration={5}
            delay={2.5}
          />
        </div>
      </div>
    </section>
  );
}
