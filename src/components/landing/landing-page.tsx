"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { ScrollViewport } from "./scroll-viewport";
import { HeroSection } from "./hero-section";
import { SignalSection } from "./signal-section";
import { FixedNav } from "./fixed-nav";

export function LandingPage() {
  const scrollY = useScrollProgress();

  return (
    <div style={{ background: "var(--lp-bg-primary)" }}>
      <FixedNav />
      <ScrollViewport>
        <HeroSection scrollY={scrollY} />
        <SignalSection scrollY={scrollY} />
      </ScrollViewport>
    </div>
  );
}
