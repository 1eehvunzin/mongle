import MongleMascot from "./MongleMascot";
import { wordmarkBlue } from "../theme";

// The real lockup from app/(onboarding)/splash.tsx: mascot + lowercase
// "mongle" set in Cloudsofa, one accent blue, no badge or circle around it.
// `light` swaps the wordmark to white for the one saturated cover panel.
export default function Wordmark({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.15 }}>
      <MongleMascot size={size} />
      <span
        style={{
          fontFamily: "Cloudsofa",
          fontSize: size * 0.8,
          color: light ? "#FFFFFF" : wordmarkBlue,
          letterSpacing: "-0.02em",
        }}
      >
        mongle
      </span>
    </div>
  );
}
