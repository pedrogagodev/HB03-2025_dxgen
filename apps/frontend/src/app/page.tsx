import {
  LandingLayout,
  HeroSection,
  ProblemSolutionSection,
  HowItWorks,
  FeaturesSection,
  Testimonials,
  PricingSection,
  FAQSection,
  FooterSection,
} from "@/components/sections";

export default function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <ProblemSolutionSection listVariant="simple" />
      <HowItWorks />
      <FeaturesSection />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <FooterSection />
    </LandingLayout>
  );
}
