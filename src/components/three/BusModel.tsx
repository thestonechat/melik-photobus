"use client";

import { Component, Suspense, type ReactNode } from "react";
import { Camera } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { COLORS } from "./busArt";
import { PhotoBus } from "./PhotoBus";

function BusScene() {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ position: [6.5, 3.2, 7.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={2.1} color="#ffedd5" />
      <directionalLight position={[3, 7, 6]} intensity={1.6} />

      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.5}>
          <PhotoBus />
        </Float>
        <mesh rotation-x={-Math.PI / 2} position-y={0.005} scale={[3, 1.35, 1]}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial color={COLORS.ink} transparent opacity={0.14} />
        </mesh>
      </Suspense>

      <OrbitControls
        makeDefault
        target={[0, 1.25, 0]}
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}

class BusErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const fallback = (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-ink bg-primary shadow-[4px_4px_0_0_var(--color-ink)]">
        <Camera className="h-9 w-9 text-ink" />
      </span>
      <p className="max-w-[220px] text-sm font-medium text-ink-muted">
        The 3D bus needs WebGL - here&apos;s a photo placeholder instead.
      </p>
    </div>
  </div>
);

export default function BusModel() {
  return (
    <BusErrorBoundary fallback={fallback}>
      <BusScene />
    </BusErrorBoundary>
  );
}