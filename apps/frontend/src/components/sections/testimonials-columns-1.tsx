"use client";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";

const testimonials = [
  {
    text: "DxGen completely changed how we handle documentation. What used to take hours now happens automatically with every push.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus",
    name: "Marcus Chen",
    role: "Senior Engineer @ Vercel",
  },
  {
    text: "The architecture diagrams alone saved us weeks of onboarding time. New devs can understand our codebase in hours, not days.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah",
    name: "Sarah Johnson",
    role: "Tech Lead @ Stripe",
  },
  {
    text: "Finally, documentation that stays in sync with the code. No more outdated READMEs or stale API docs.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex",
    name: "Alex Rivera",
    role: "CTO @ StartupXYZ",
  },
  {
    text: "We integrated DxGen into our CI pipeline and haven't looked back. It's like having a technical writer on the team.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Emily",
    name: "Emily Zhang",
    role: "DevOps Lead @ Shopify",
  },
  {
    text: "The llms.txt output is a game changer. Our AI tools finally understand our codebase context.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=David",
    name: "David Park",
    role: "ML Engineer @ OpenAI",
  },
  {
    text: "Switched from manual docs to DxGen. Our documentation coverage went from 30% to 95% overnight.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Lisa",
    name: "Lisa Thompson",
    role: "Engineering Manager @ Notion",
  },
  {
    text: "The incremental updates feature is brilliant. Only processes what changed, perfect for our large monorepo.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=James",
    name: "James Wilson",
    role: "Staff Engineer @ Meta",
  },
  {
    text: "Zero config, just works. Ran npx dxgen and had beautiful docs in minutes. This is how dev tools should be.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Nina",
    name: "Nina Patel",
    role: "Indie Developer",
  },
  {
    text: "Our API documentation is finally accurate. Clients trust our docs now because they're generated from actual code.",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Michael",
    name: "Michael Brown",
    role: "API Lead @ Twilio",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...(["first", "second"] as const).map((duplicateId) => (
            <React.Fragment key={`duplicate-${duplicateId}`}>
              {props.testimonials.map(({ text, image, name, role }) => (
                <div
                  className="p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg shadow-emerald-500/5 max-w-xs w-full"
                  key={`${duplicateId}-${name}`}
                >
                  <div className="text-white/80">{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <Image
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full bg-white/10"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5 text-white">
                        {name}
                      </div>
                      <div className="leading-5 text-white/50 tracking-tight">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

export function Testimonials() {
  return (
    <section className="py-20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by developers
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join thousands of developers who have transformed their
            documentation workflow
          </p>
        </div>
        <div className="flex justify-center gap-6 h-[600px] overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
          <TestimonialsColumn
            testimonials={firstColumn}
            duration={15}
            className="hidden md:block"
          />
          <TestimonialsColumn testimonials={secondColumn} duration={19} />
          <TestimonialsColumn
            testimonials={thirdColumn}
            duration={17}
            className="hidden lg:block"
          />
        </div>
      </div>
    </section>
  );
}
