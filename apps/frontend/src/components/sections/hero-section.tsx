import Hero from "@/components/sections/neural-network-hero";
import { heroConfig } from "@/config/landing-page.config";

export function HeroSection() {
  return (
    <Hero
      title={heroConfig.title}
      description={heroConfig.description}
      badgeLabel={heroConfig.badgeLabel}
      badgeText={heroConfig.badgeText}
      ctaButtons={heroConfig.ctaButtons}
      microDetails={heroConfig.microDetails}
    />
  );
}
