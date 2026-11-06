import type { ComponentProps, ReactNode } from "react";
import { Outlines } from "@react-three/drei";
import { COLORS, toonGradient } from "./busArt";

export function Toon({
  color,
  outline = 0.024,
  children,
  ...mesh
}: ComponentProps<"mesh"> & { color: string; outline?: number; children?: ReactNode }) {
  return (
    <mesh {...mesh}>
      {children}
      <meshToonMaterial color={color} gradientMap={toonGradient} />
      <Outlines screenspace thickness={outline} color={COLORS.ink} />
    </mesh>
  );
}
