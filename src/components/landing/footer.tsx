export function Footer() {
  return (
    <footer
      style={{
        padding: "48px clamp(40px, 10vw, 140px)",
        borderTop: "1px solid var(--lp-border-subtle)",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--lp-bg-tertiary)",
            letterSpacing: "1px",
          }}
        >
          VECTR
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--lp-bg-tertiary)",
            letterSpacing: "1px",
            marginTop: "4px",
          }}
        >
          info@vectr.ch
        </div>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--lp-bg-tertiary)",
        }}
      >
        &copy; 2026
      </div>
    </footer>
  );
}
