"use client";

import React, { useEffect, useId, useState } from "react";

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  gradientStartColor?: string;
  gradientStopColor?: string;
  pathColor?: string;
  pathWidth?: number;
  curvature?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  className?: string;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  gradientStartColor = "#3b82f6",
  gradientStopColor = "#8b5cf6",
  pathColor = "rgba(255, 255, 255, 0.2)",
  pathWidth = 2,
  curvature = 0,
  duration = 3,
  delay = 0,
  reverse = false,
  className,
}: AnimatedBeamProps) {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current || !fromRef.current || !toRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
      const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
      const toX = toRect.left + toRect.width / 2 - containerRect.left;
      const toY = toRect.top + toRect.height / 2 - containerRect.top;

      const midX = (fromX + toX) / 2;
      const midY = (fromY + toY) / 2 + curvature;

      const path = `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;

      setPathD(path);
      setSvgDimensions({
        width: containerRect.width,
        height: containerRect.height,
      });
    };

    updatePath();

    const resizeObserver = new ResizeObserver(updatePath);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updatePath);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
    };
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      className={`pointer-events-none absolute inset-0 ${className || ""}`}
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        zIndex: 1,
      }}
    >
      <defs>
        <linearGradient
          id={`gradient-${id}`}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="5%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="95%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
          <animate
            attributeName="x1"
            values={reverse ? "100%;0%" : "0%;100%"}
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values={reverse ? "200%;100%" : "100%;200%"}
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>

      {pathD && (
        <>
          {/* Background path */}
          <path
            d={pathD}
            fill="none"
            stroke={pathColor}
            strokeWidth={pathWidth}
            strokeLinecap="round"
          />

          {/* Animated gradient path */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#gradient-${id})`}
            strokeWidth={pathWidth}
            strokeLinecap="round"
            opacity="0.8"
          />
        </>
      )}
    </svg>
  );
}
