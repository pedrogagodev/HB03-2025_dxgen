import { Footer } from "./footer";
import { footerConfig } from "@/config/landing-page.config";

export function FooterSection() {
  return (
    <Footer
      logo={footerConfig.logo}
      brandName={footerConfig.brandName}
      socialLinks={footerConfig.socialLinks}
      mainLinks={footerConfig.mainLinks}
      legalLinks={footerConfig.legalLinks}
      copyright={footerConfig.copyright}
    />
  );
}
