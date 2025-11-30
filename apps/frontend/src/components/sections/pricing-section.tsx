import { Pricing } from "./pricing";
import { pricingPlans } from "@/config/landing-page.config";

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Pricing plans={pricingPlans} />
      </div>
    </section>
  );
}
