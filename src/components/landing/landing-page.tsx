import { Navbar } from "./navbar";
import { CyberBackground } from "./cyber-background";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { CommandSection } from "./command-section";
import { NetworkSection } from "./network-section";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";
import { GlowCursor } from "./glow-cursor";

export function LandingPage() {
  return (
    <>
      <CyberBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CommandSection />
      <NetworkSection />
      <CtaSection />
      <Footer />
      <GlowCursor />
    </>
  );
}
