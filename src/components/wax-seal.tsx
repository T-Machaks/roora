export function WaxSeal({ size = 76 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-full text-secondary"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 35% 30%, var(--primary-dark), var(--primary) 65%)",
        boxShadow:
          "0 6px 14px rgba(0,0,0,0.28), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)",
      }}
    >
      <div
        className="absolute rounded-full border border-secondary/40"
        style={{ inset: size * 0.1 }}
      />
      <span
        className="font-display leading-none"
        style={{ fontSize: size * 0.34, letterSpacing: "0.02em" }}
      >
        B&amp;T
      </span>
    </div>
  );
}
