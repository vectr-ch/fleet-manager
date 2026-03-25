"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { useViewportHeight } from "@/hooks/use-viewport-height";
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
  contentHeight,
  onRef,
}: {
  scrollY: number;
  vh: number;
  contentHeight: number;
  onRef: (el: HTMLDivElement | null) => void;
}) {
  const act3Progress = Math.max(
    0,
    Math.min(1, (scrollY - vh * 0.8) / (vh * 0.25)),
  );

  const scrollStart = vh * 0.8;
  const maxTranslate = contentHeight > vh ? contentHeight - vh : 0;
  const rawTranslate = scrollY > scrollStart ? scrollY - scrollStart : 0;
  const translateY = -Math.min(rawTranslate, maxTranslate);

  return (
    <div
      ref={onRef}
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
  const vh = useViewportHeight();
  const act3Ref = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure Act 3 content via callback ref + ResizeObserver
  const observerRef = useRef<ResizeObserver | null>(null);
  const onAct3Ref = useCallback((el: HTMLDivElement | null) => {
    // Clean up old observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    act3Ref.current = el;
    if (el) {
      setContentHeight(el.scrollHeight);
      observerRef.current = new ResizeObserver(() => {
        setContentHeight(el.scrollHeight);
      });
      observerRef.current.observe(el);
    }
  }, []);

  // Clean up observer on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  // Runway = scroll needed for hero transition + Act 3 content
  const scrollStart = vh * 0.8;
  const maxTranslate = contentHeight > vh ? contentHeight - vh : 0;
  const runwayHeight = `${scrollStart + maxTranslate + vh}px`;

  return (
    <div style={{ background: "var(--lp-bg-primary)" }}>
      <FixedNav />
      <ScrollViewport runwayHeight={runwayHeight}>
        <HeroSection scrollY={scrollY} />
        <SignalSection scrollY={scrollY} />
        <Act3 scrollY={scrollY} vh={vh} contentHeight={contentHeight} onRef={onAct3Ref} />
      </ScrollViewport>
    </div>
  );
}
