// Esse arquivo foi feito com ajuda de IA

"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { DemoSection } from "./demo-section";

gsap.registerPlugin(SplitText, useGSAP);

// ===================== HERO =====================
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const paraRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const microRef = useRef<HTMLUListElement | null>(null);
  const microItem1Ref = useRef<HTMLLIElement | null>(null);
  const microItem2Ref = useRef<HTMLLIElement | null>(null);
  const microItem3Ref = useRef<HTMLLIElement | null>(null);

  useGSAP(
    () => {
      if (!headerRef.current) return;

      document.fonts.ready.then(() => {
        if (!headerRef.current) return;
        const split = new SplitText(headerRef.current, {
          type: "lines",
          wordsClass: "lines",
        });

        gsap.set(split.lines, {
          filter: "blur(16px)",
          yPercent: 30,
          autoAlpha: 0,
          scale: 1.06,
          transformOrigin: "50% 100%",
        });

        if (badgeRef.current) {
          gsap.set(badgeRef.current, { autoAlpha: 0, y: -8 });
        }
        if (paraRef.current) {
          gsap.set(paraRef.current, { autoAlpha: 0, y: 8 });
        }
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { autoAlpha: 0, y: 8 });
        }
        const microItems = [
          microItem1Ref.current,
          microItem2Ref.current,
          microItem3Ref.current,
        ].filter(Boolean);
        if (microItems.length > 0) {
          gsap.set(microItems, { autoAlpha: 0, y: 6 });
        }

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
        });

        if (badgeRef.current) {
          tl.to(badgeRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.0);
        }

        tl.to(
          split.lines,
          {
            filter: "blur(0px)",
            yPercent: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.15,
          },
          0.1,
        );

        if (paraRef.current) {
          tl.to(
            paraRef.current,
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.55",
          );
        }
        if (ctaRef.current) {
          tl.to(
            ctaRef.current,
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.35",
          );
        }
        if (microItems.length > 0) {
          tl.to(
            microItems,
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 },
            "-=0.25",
          );
        }
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden"
    >
      <div className="relative mx-auto flex h-full max-w-7xl items-center gap-8 px-6 md:px-10 lg:gap-12 lg:px-16">
        {/* Left side - Hero Content (50%) */}
        <div className="flex w-full flex-col items-start gap-6 sm:gap-8 lg:w-1/2">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm"
          >
            <span className="text-[10px] font-light uppercase tracking-[0.08em] text-white/70">
              {badgeLabel}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/40" />
            <span className="text-xs font-light tracking-tight text-white/80">
              {badgeText}
            </span>
          </div>

          <h1
            ref={headerRef}
            className="max-w-2xl text-left text-5xl font-extralight leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl"
          >
            {title}
          </h1>

          <p
            ref={paraRef}
            className="max-w-xl text-left text-base font-light leading-relaxed tracking-tight text-white/75 sm:text-lg"
          >
            {description}
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center gap-3 pt-2">
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
          </div>

          <ul
            ref={microRef}
            className="mt-8 flex flex-wrap gap-6 text-xs font-extralight tracking-tight text-white/60"
          >
            {microDetails.map((detail, index) => {
              const refMap = [microItem1Ref, microItem2Ref, microItem3Ref];
              return (
                <li
                  key={detail}
                  ref={refMap[index]}
                  className="flex items-center gap-2"
                >
                  <span className="h-1 w-1 rounded-full bg-white/40" /> {detail}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right side - Demo Section (50%) */}
        <div className="hidden w-1/2 lg:block">
          <DemoSection />
        </div>
      </div>
    </section>
  );
}
