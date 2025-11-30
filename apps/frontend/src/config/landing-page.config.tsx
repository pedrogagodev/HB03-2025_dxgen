import { Github, Linkedin, Twitter } from "lucide-react";

export const heroConfig = {
  title: "Your docs are lying to you",
  description:
    "DxGen reads your actual code and writes documentation that's actually true. README, API docs, diagrams from one command.",
  badgeLabel: "Beta",
  badgeText: "AI Development Platform",
  ctaButtons: [
    { text: "Get Started", href: "/auth/login", primary: true },
    { text: "Learn More", href: "#features" },
  ],
  microDetails: ["Fast deployment", "AI-native", "Scalable"],
};

export const pricingPlans = [
  {
    name: "Free",
    price: "0",
    yearlyPrice: "0",
    period: "month",
    features: [
      "Basic documentation",
      "Limited projects",
      "Community support",
    ],
    description: "Perfect for getting started",
    buttonText: "Get Started",
    href: "/auth/signup",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "10",
    yearlyPrice: "100",
    period: "month",
    features: [
      "Unlimited documentation",
      "Unlimited projects",
      "Priority support",
      "Advanced features",
    ],
    description: "For professional developers",
    buttonText: "Start Free Trial",
    href: "/auth/signup",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "100",
    yearlyPrice: "1000",
    period: "month",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    description: "For teams and organizations",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

export const footerConfig = {
  logo: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-blue-500"
      aria-label="DxGen Logo"
    >
      <title>DxGen Logo</title>
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  brandName: "DxGen",
  socialLinks: [
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/dxgen",
      label: "GitHub",
    },
    {
      icon: <Twitter className="h-5 w-5" />,
      href: "https://twitter.com/dxgen",
      label: "Twitter",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://linkedin.com/company/dxgen",
      label: "LinkedIn",
    },
  ],
  mainLinks: [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "/docs", label: "Documentation" },
    { href: "/blog", label: "Blog" },
  ],
  legalLinks: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  copyright: {
    text: "© 2025 DxGen",
    license: "All rights reserved.",
  },
};
