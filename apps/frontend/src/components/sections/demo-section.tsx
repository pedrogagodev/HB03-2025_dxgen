"use client";

import { useEffect, useRef, useState } from "react";

interface TerminalLine {
  type: "command" | "blank" | "prompt" | "status" | "success" | "final";
  text?: string;
  value?: string;
  result?: string;
}

const terminalSession: TerminalLine[] = [
  { type: "command", text: "npx dxgen generate" },
  { type: "blank" },
  { type: "prompt", text: "? Output directory:", value: "./docs" },
  { type: "prompt", text: "? What to generate:", value: "README" },
  { type: "prompt", text: "? Style:", value: "Technical" },
  { type: "blank" },
  {
    type: "status",
    text: "Detecting stack...",
    result: "Next.js + TypeScript",
  },
  { type: "status", text: "Indexing 247 files..." },
  { type: "status", text: "Understanding architecture..." },
  { type: "status", text: "Generating documentation..." },
  { type: "blank" },
  { type: "success", text: "✓ README.md" },
  { type: "success", text: "✓ docs/API.md" },
  { type: "success", text: "✓ docs/ARCHITECTURE.md" },
  { type: "blank" },
  { type: "final", text: "Done in 47s. 3 files generated." },
];

export function DemoSection() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= terminalSession.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [isInView]);

  const renderLine = (line: TerminalLine, index: number) => {
    if (index >= visibleLines) return null;

    switch (line.type) {
      case "command":
        return (
          <div key={index} className="flex items-center gap-2">
            <span className="text-emerald-400">$</span>
            <span className="text-white">{line.text}</span>
          </div>
        );
      case "blank":
        return <div key={index} className="h-3" />;
      case "prompt":
        return (
          <div key={index} className="flex items-center gap-2 text-white/60">
            <span>{line.text}</span>
            <span className="text-emerald-400">{line.value}</span>
          </div>
        );
      case "status":
        return (
          <div key={index} className="flex items-center gap-2 text-white/60">
            <span className="text-emerald-400 animate-spin inline-block">
              ◐
            </span>
            <span>{line.text}</span>
            {line.result && (
              <span className="text-green-400">{line.result}</span>
            )}
          </div>
        );
      case "success":
        return (
          <div key={index} className="text-green-400">
            {line.text}
          </div>
        );
      case "final":
        return (
          <div key={index} className="text-white font-medium">
            {line.text}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="demo" ref={sectionRef} className="w-full">
      <div className="w-full">
        {/* Headline */}
        <div className="mb-6">
          <h2 className="font-(family-name:--font-space-grotesk) text-3xl md:text-4xl font-bold mb-2 text-white">
            47 seconds.
          </h2>
          <p className="text-base text-white/70">From zero to complete docs.</p>
        </div>

        {/* Terminal */}
        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-xl blur-xl opacity-50" />
          <div className="relative bg-[#0D0D12] rounded-xl border border-white/10 overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-3 text-[10px] text-white/50 font-mono">
                terminal
              </span>
            </div>

            {/* Terminal content */}
            <div className="p-4 font-mono text-xs leading-relaxed min-h-[350px]">
              {terminalSession.map((line, index) => renderLine(line, index))}
              {visibleLines < terminalSession.length && (
                <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
