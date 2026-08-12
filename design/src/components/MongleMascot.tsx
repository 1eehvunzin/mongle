import type { CSSProperties } from "react";
import mongle from "../assets/mongle.png";

type Props = { size?: number; style?: CSSProperties };

export default function MongleMascot({ size = 100, style }: Props) {
  return (
    <img
      src={mongle}
      alt=""
      style={{ width: size, height: size, objectFit: "contain", display: "block", ...style }}
    />
  );
}
