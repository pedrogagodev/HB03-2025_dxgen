"use client";

import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: [
          "hsl(var(--primary))",
          "hsl(var(--accent))",
          "hsl(var(--secondary))",
          "hsl(var(--muted))",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
          {title}
        </h2>
        <p className="text-white/75 text-lg whitespace-pre-line">
          {description}
        </p>
      </div>

      <div className="relative z-10 flex justify-center items-center gap-3 mb-10">
        <span
          className={cn(
            "font-semibold",
            isMonthly ? "text-white" : "text-white/50",
          )}
        >
          Monthly
        </span>
        <Switch
          ref={switchRef}
          checked={!isMonthly}
          onCheckedChange={handleToggle}
          className="data-[state=unchecked]:bg-white/20 data-[state=checked]:bg-emerald-500 [&_span]:bg-white"
        />
        <span
          className={cn(
            "font-semibold",
            !isMonthly ? "text-white" : "text-white/50",
          )}
        >
          Annual <span className="text-emerald-400">(Save 20%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ y: 50, opacity: 1 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -20 : 0,
                    opacity: 1,
                  }
                : {}
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.4,
              opacity: { duration: 0.5 },
            }}
            className={cn(
              `rounded-2xl border p-6 bg-white/5 backdrop-blur-sm text-center lg:flex lg:flex-col lg:justify-center relative`,
              plan.isPopular ? "border-white/20 border-2" : "border-white/10",
              "flex flex-col",
            )}
          >
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-primary py-0.5 px-2 rounded-bl-xl rounded-tr-xl flex items-center">
                <Star className="text-primary-foreground h-4 w-4 fill-current" />
                <span className="text-primary-foreground ml-1 font-sans font-semibold">
                  Popular
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <p className="text-base font-semibold text-white/60">
                {plan.name}
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-white">
                  <NumberFlow
                    value={
                      isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)
                    }
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{
                      duration: 500,
                      easing: "ease-out",
                    }}
                    willChange
                    className="font-variant-numeric: tabular-nums"
                  />
                </span>
                {plan.period !== "Next 3 months" && (
                  <span className="text-sm font-semibold leading-6 tracking-wide text-white/60">
                    / {isMonthly ? "month" : "year"}
                  </span>
                )}
              </div>

              <p className="text-xs leading-5 text-white/60">
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              <ul className="mt-5 gap-2 flex flex-col">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 mt-1 shrink-0" />
                    <span className="text-left text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-4 border-white/10" />

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: "outline",
                  }),
                  "group relative w-full gap-2 overflow-hidden text-lg font-semibold tracking-tighter",
                  "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:bg-primary hover:text-primary-foreground",
                  plan.isPopular
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-white",
                )}
              >
                {plan.buttonText}
              </Link>
              <p className="mt-6 text-xs leading-5 text-white/60">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
