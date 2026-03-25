"use client";

import { useState, useEffect } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { ScrollViewport } from "./scroll-viewport";
import { FixedNav } from "./fixed-nav";
import { HeroSection } from "./hero-section";
import { SignalSection } from "./signal-section";
import { CapabilitiesSection } from "./capabilities-section";
import { MissionSection } from "./mission-section";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

function Act3({ scrollY, vh }: { scrollY: number; vh: number }) {
  const act3Progress = Math.max(
    0,
    Math.min(1, (scrollY - vh * 0.8) / (vh * 0.25)),
  );

  const transitionEnd = vh * 1.5;
  const translateY =
    scrollY > transitionEnd ? -(scrollY - transitionEnd) : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3,
        paddingTop: "100vh",
        opacity: act3Progress,
        transform: `translateY(${translateY}px)`,
        willChange: "transform, opacity",
      }}
    >
      <CapabilitiesSection />
      <MissionSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

export function LandingPage() {
  const scrollY = useScrollProgress();
  const [vh, setVh] = useState(800);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={{ background: "var(--lp-bg-primary)" }}>
      <FixedNav />
      <ScrollViewport>
        <HeroSection scrollY={scrollY} />
        <SignalSection scrollY={scrollY} />
        <Act3 scrollY={scrollY} vh={vh} />
      </ScrollViewport>
    </div>
  );
}
