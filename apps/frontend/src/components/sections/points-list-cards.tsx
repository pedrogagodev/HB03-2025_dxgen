"use client";

import { X, Check } from "lucide-react";

interface PointsListCardsProps {
  points: string[];
  variant: "problem" | "solution";
}

export function PointsListCards({ points, variant }: PointsListCardsProps) {
  const isProblem = variant === "problem";

  return (
    <ul className="space-y-3">
      {points.map((point, index) => (
        <li
          key={index}
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
        </li>
      ))}
    </ul>
  );
}
