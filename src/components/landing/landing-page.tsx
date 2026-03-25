"use client";

import { useState, useEffect, useRef } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { ScrollViewport } from "./scroll-viewport";
import { FixedNav } from "./fixed-nav";
import { HeroSection } from "./hero-section";
import { SignalSection } from "./signal-section";
import { CapabilitiesSection } from "./capabilities-section";
import { MissionSection } from "./mission-section";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

function Act3({
  scrollY,
  vh,
  contentRef,
}: {
  scrollY: number;
  vh: number;
  contentRef: React.RefObject<HTMLDivElement | null>;
}) {
  // Act 3 fades in as Act 2 text exits (starting at 0.8vh scroll)
  const act3Progress = Math.max(
    0,
    Math.min(1, (scrollY - vh * 0.8) / (vh * 0.25)),
  );

  // Act 3 starts translating up immediately from 0.8vh
  const scrollStart = vh * 0.8;
  const contentHeight = contentRef.current?.scrollHeight ?? 0;
  const maxTranslate = contentHeight > vh ? contentHeight - vh : 0;
  const rawTranslate = scrollY > scrollStart ? scrollY - scrollStart : 0;
  const translateY = -Math.min(rawTranslate, maxTranslate);

  return (
    <div
      ref={contentRef}
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
  const act3Ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    setVh(window.innerHeight);
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Measure Act 3 content to size the scroll runway exactly
  useEffect(() => {
    if (!act3Ref.current) return;
    const measure = () => setContentHeight(act3Ref.current?.scrollHeight ?? 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(act3Ref.current);
    return () => observer.disconnect();
  }, []);

  // Runway = scroll needed for hero transition + Act 3 content
  // scrollStart (0.8vh) + maxTranslate (contentHeight - vh) + vh
  const scrollStart = vh * 0.8;
  const maxTranslate = contentHeight > vh ? contentHeight - vh : 0;
  const runwayHeight = `${scrollStart + maxTranslate + vh}px`;

  return (
    <div style={{ background: "var(--lp-bg-primary)" }}>
      <FixedNav />
      <ScrollViewport runwayHeight={runwayHeight}>
        <HeroSection scrollY={scrollY} />
        <SignalSection scrollY={scrollY} />
        <Act3 scrollY={scrollY} vh={vh} contentRef={act3Ref} />
      </ScrollViewport>
    </div>
  );
}
