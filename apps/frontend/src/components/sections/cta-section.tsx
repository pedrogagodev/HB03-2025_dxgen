"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="relative z-10 py-24 px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
          Ready to transform your documentation?
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          See how DxGen can save your team hours of documentation work. Schedule
          a personalized demo with our team.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-t from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border border-blue-500 shadow-lg shadow-blue-800/30 px-8"
          >
            <a href="/contact">Schedule a Demo</a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-neutral-700 text-white hover:bg-neutral-800 px-8"
          >
            <a href="mailto:sales@dxgen.dev">Contact Sales</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
