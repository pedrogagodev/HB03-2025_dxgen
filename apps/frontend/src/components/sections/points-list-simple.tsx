"use client";

import { X, Check } from "lucide-react";

interface PointsListSimpleProps {
  points: string[];
  variant: "problem" | "solution";
}

export function PointsListSimple({ points, variant }: PointsListSimpleProps) {
  const isProblem = variant === "problem";

  return (
    <ul className="space-y-4">
      {points.map((point, index) => (
        <li key={index} className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              isProblem
                ? "bg-red-500/10 text-red-400"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {isProblem ? (
              <X className="h-3 w-3" strokeWidth={3} />
            ) : (
              <Check className="h-3 w-3" strokeWidth={3} />
            )}
          </span>
          <span className="text-sm font-light leading-relaxed text-white/70">
            {point}
          </span>
        </li>
      ))}
    </ul>
  );
}
