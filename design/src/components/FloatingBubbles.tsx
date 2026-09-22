// Soft floating circle accents scattered over the saturated cover/closing
// panels — ported from the look in assets/ref/image.png (an earlier promo
// still): a few small bright dots plus one big soft glow bleeding off an
// edge, sitting over the blue gradient. Positions are fractions of the
// panel's own width/height so the same spec works at both the iPhone and
// iPad canvas sizes.
type Bubble = { xPct: number; yPct: number; size: number; opacity: number };

const BUBBLES: Bubble[] = [
  { xPct: 0.1, yPct: 0.07, size: 22, opacity: 0.38 },
  { xPct: 0.88, yPct: 0.045, size: 46, opacity: 0.3 },
  { xPct: 0.05, yPct: 0.4, size: 16, opacity: 0.3 },
  { xPct: 0.93, yPct: 0.52, size: 26, opacity: 0.26 },
  { xPct: 0.14, yPct: 0.63, size: 12, opacity: 0.28 },
  { xPct: -0.04, yPct: 0.82, size: 160, opacity: 0.14 },
  { xPct: 1.02, yPct: 0.92, size: 120, opacity: 0.12 },
];

export default function FloatingBubbles({ width, height }: { width: number; height: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.xPct * width - b.size / 2,
            top: b.yPct * height - b.size / 2,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: "#FFFFFF",
            opacity: b.opacity,
          }}
        />
      ))}
    </div>
  );
}
