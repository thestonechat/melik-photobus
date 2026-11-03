"use client";

import { Component, Suspense, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { Camera } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Float,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";

interface WheelProps {
  position: [number, number, number];
}

function StarDecal({ position }: { position: [number, number, number] }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const outer = 0.5;
    const inner = 0.22;
    const spikes = 5;
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: false,
    });
    geo.center();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={position} scale={0.45} castShadow={false}>
      <meshStandardMaterial color="#facc15" roughness={0.4} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Wheel({ position }: WheelProps) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.28, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.25, 24]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

function Window({ position }: { position: [number, number, number] }) {
  return (
    <RoundedBox args={[0.5, 0.4, 0.06]} radius={0.04} smoothness={3} position={position}>
      <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.6} />
    </RoundedBox>
  );
}

function BusBody() {
  return (
    <group>
      <RoundedBox args={[3.2, 1.35, 1.6]} radius={0.16} smoothness={4} position={[0, 0.9, 0]}>
        <meshStandardMaterial color="#facc15" roughness={0.3} metalness={0.05} />
      </RoundedBox>

      <RoundedBox args={[3.1, 0.35, 1.5]} radius={0.1} smoothness={4} position={[0, 1.79, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </RoundedBox>

      <mesh position={[1.6, 1.08, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.5, 1.05, 0.06]} />
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.6} />
      </mesh>

      <mesh position={[1.63, 0.42, 0]}>
        <boxGeometry args={[0.16, 0.4, 1.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
      </mesh>

      <mesh position={[-1.63, 0.42, 0]}>
        <boxGeometry args={[0.16, 0.4, 1.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
      </mesh>

      <RoundedBox args={[3.2, 0.42, 1.6]} radius={0.1} smoothness={3} position={[0, 0.17, 0]}>
        <meshStandardMaterial color="#0a0a0a" roughness={0.6} />
      </RoundedBox>

      <Window position={[-0.82, 1.12, 0.82]} />
      <Window position={[0, 1.12, 0.82]} />
      <Window position={[0.82, 1.12, 0.82]} />
      <Window position={[-0.82, 1.12, -0.82]} />
      <Window position={[0, 1.12, -0.82]} />
      <Window position={[0.82, 1.12, -0.82]} />

      <StarDecal position={[0.85, 1.97, 0.78]} />
      <StarDecal position={[-0.6, 0.92, -0.84]} />

      <Wheel position={[1.15, 0.35, 0.9]} />
      <Wheel position={[-1.15, 0.35, 0.9]} />
      <Wheel position={[1.15, 0.35, -0.9]} />
      <Wheel position={[-1.15, 0.35, -0.9]} />
    </group>
  );
}

function BusScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [6.5, 3, 7.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 8, 5]} intensity={1.4} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#fff7ed" />
      <pointLight position={[0, 4, 2]} intensity={0.6} color="#facc15" />

      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.7}>
          <BusBody />
        </Float>
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={7}
          blur={2.4}
          far={3}
          color="#0a0a0a"
        />
      </Suspense>

      <OrbitControls
        makeDefault
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