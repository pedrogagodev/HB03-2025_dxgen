"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is DxGen?",
    answer:
      "DxGen is an AI-powered documentation platform that reads your actual codebase and generates accurate, up-to-date documentation. It creates READMEs, API docs, and architecture diagrams from a single command.",
  },
  {
    question: "How does AI-powered documentation work?",
    answer:
      "DxGen analyzes your code structure, functions, types, and relationships using advanced AI models. It understands the context and purpose of your code to generate human-readable documentation that accurately reflects what your code actually does.",
  },
  {
    question: "What documentation formats are supported?",
    answer:
      "DxGen supports multiple output formats including Markdown, HTML, and various diagram formats. You can generate READMEs, API reference docs, architecture diagrams, and more—all customizable to fit your project's needs.",
  },
  {
    question: "How do I integrate DxGen into my workflow?",
    answer:
      "Integration is simple. Install our CLI tool, run a single command in your project directory, and DxGen handles the rest. It also integrates with CI/CD pipelines for automated documentation updates on every commit.",
  },
  {
    question: "Is my code secure?",
    answer:
      "Absolutely. Your code is processed securely and never stored on our servers. We use end-to-end encryption for all data transfers, and you can also run DxGen locally for complete privacy.",
  },
];

export function FAQSection() {
  return (
    <section className="relative z-10 py-24 px-4 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Everything you need to know about DxGen
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.question}
                value={item.question}
                className="border border-neutral-800 rounded-lg bg-neutral-900/50 backdrop-blur-sm px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-white hover:no-underline hover:text-blue-400 transition-colors py-5 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
