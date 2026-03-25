export function MissionSection() {
  return (
    <section
      style={{
        padding: "60px clamp(40px, 10vw, 140px)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--lp-font-mono)",
          fontSize: "10px",
          color: "var(--lp-text-faint)",
          letterSpacing: "4px",
          textTransform: "uppercase",
          marginBottom: "24px",
        }}
      >
        WHY
      </div>
      <h2
        style={{
          fontSize: "28px",
          fontWeight: 300,
          color: "var(--lp-text-secondary)",
          letterSpacing: "-0.3px",
          margin: "0 0 24px",
        }}
      >
        The infrastructure gap
      </h2>
      <p
        style={{
          fontSize: "15px",
          color: "var(--lp-text-muted)",
          lineHeight: 1.8,
          maxWidth: "520px",
          margin: 0,
        }}
      >
        Autonomous drone fleets will reshape how we survey, deliver, and respond.
        But the infrastructure to coordinate them — real mesh networking, edge-first
        compute, swarm-level control — doesn&apos;t exist yet. That&apos;s what we&apos;re building.
      </p>
    </section>
  );
}
