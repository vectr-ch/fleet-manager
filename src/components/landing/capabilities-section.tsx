import { BorderGlowCard } from "./border-glow-card";

const capabilities = [
  {
    label: "CONNECTIVITY",
    heading: "Operates Without Connectivity",
    body: "Full autonomous operation at the edge. No cloud dependency, no single point of failure.",
  },
  {
    label: "RESILIENCE",
    heading: "Self-Healing Mesh",
    body: "Decentralized network that routes around failures. If a node drops, the fleet adapts.",
  },
  {
    label: "AWARENESS",
    heading: "Real-Time Awareness",
    body: "Live telemetry from every node in the fleet. Observe, command, and react in real-time.",
  },
  {
    label: "SECURITY",
    heading: "Zero-Trust Security",
    body: "mTLS from device to cloud. Every connection authenticated, every payload encrypted.",
  },
];

export function CapabilitiesSection() {
  return (
    <section
      style={{
        padding: "120px clamp(40px, 10vw, 140px)",
        borderTop: "1px solid var(--lp-border-subtle)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "32px",
        }}
      >
        {capabilities.map((cap) => (
          <BorderGlowCard key={cap.label}>
            <div
              style={{
                fontFamily: "var(--lp-font-mono)",
                fontSize: "11px",
                color: "var(--lp-text-secondary)",
                letterSpacing: "2px",
                textTransform: "uppercase" as const,
                marginBottom: "16px",
              }}
            >
              {cap.label}
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--lp-text-secondary)",
                marginBottom: "12px",
              }}
            >
              {cap.heading}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--lp-text-faint)",
                lineHeight: 1.6,
              }}
            >
              {cap.body}
            </div>
          </BorderGlowCard>
        ))}
      </div>
    </section>
  );
}
