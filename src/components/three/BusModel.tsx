"use client";

import { Component, Suspense, useLayoutEffect, type ReactNode } from "react";
import * as THREE from "three";
import { Camera } from "lucide-react";
import { Canvas, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { COLORS } from "./busArt";
import { PhotoBus } from "./PhotoBus";

const CAMERA_TARGET = new THREE.Vector3(0, 1.25, 0);
const CAMERA_FOV = 35;
/** World-space half extents the camera must keep in frame at any orbit angle. */
const FRAME_HALF_WIDTH = 3.05;
const FRAME_HALF_HEIGHT = 2;

/** Picks the orbit distance per canvas aspect, so wide mobile canvases don't shrink the bus. */
function FitCamera() {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.viewport.aspect);

  useLayoutEffect(() => {
    const halfHeight = Math.max(FRAME_HALF_HEIGHT, FRAME_HALF_WIDTH / aspect);
    const distance = halfHeight / Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2));
    camera.position.sub(CAMERA_TARGET).setLength(distance).add(CAMERA_TARGET);
  }, [camera, aspect]);

  return null;
}

function BusScene() {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      camera={{ position: [6.9, 3.4, 8], fov: CAMERA_FOV }}
      gl={{ antialias: true, alpha: true }}
    >
      <FitCamera />
      <ambientLight intensity={2.1} color="#ffedd5" />
      <directionalLight position={[3, 7, 6]} intensity={1.6} />

      <Suspense fallback={null}>
        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.5}>
          <PhotoBus />
        </Float>
        <mesh rotation-x={-Math.PI / 2} position-y={0.005} scale={[2.5, 1.15, 1]}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial color={COLORS.ink} transparent opacity={0.14} />
        </mesh>
      </Suspense>

      <OrbitControls
        makeDefault
        target={CAMERA_TARGET}
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