"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Camera } from "lucide-react";
import { Canvas, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { COLORS } from "./busArt";
import { PhotoBus } from "./PhotoBus";
import { detectQuality, qualityDpr, useSceneVisible } from "./quality";
import { QualityMonitor } from "./QualityMonitor";
import { WebGLBoundary } from "./WebGLBoundary";

const CAMERA_TARGET = new THREE.Vector3(0, 1.25, 0);
const CAMERA_FOV = 35;
/** Radius around the orbit axis, and half height, the camera must keep in frame at any angle. */
const FRAME_HALF_WIDTH = 3.05;
const FRAME_HALF_HEIGHT = 2;
/** How long a still bus keeps drawing after a click, for the doors to finish moving. */
const DOOR_ANIMATION_MS = 3000;

/** Picks the orbit distance per canvas aspect, so wide mobile canvases don't shrink the bus. */
function FitCamera() {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.viewport.aspect);

  useLayoutEffect(() => {
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2));
    const distance = Math.max(
      FRAME_HALF_HEIGHT / tanHalfFov,
      FRAME_HALF_WIDTH / Math.sin(Math.atan(tanHalfFov * aspect)),
    );
    camera.position.sub(CAMERA_TARGET).setLength(distance).add(CAMERA_TARGET);
  }, [camera, aspect]);

  return null;
}

function BusScene() {
  const root = useRef<HTMLDivElement>(null);
  const visible = useSceneVisible(root);
  const [ceiling] = useState(detectQuality);
  const [quality, setQuality] = useState(ceiling);
  const [doorOpen, setDoorOpen] = useState(false);
  const [doorMoving, setDoorMoving] = useState(false);
  const moving = quality > 0;

  useEffect(() => {
    if (!doorMoving) return;
    const timer = setTimeout(() => setDoorMoving(false), DOOR_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [doorMoving, doorOpen]);

  const toggleDoor = () => {
    setDoorOpen((open) => !open);
    setDoorMoving(true);
  };

  const frameloop = !visible ? "never" : moving || doorMoving ? "always" : "demand";

  return (
    <div ref={root} className="h-full w-full">
      <Canvas
        flat
        dpr={qualityDpr(quality)}
        frameloop={frameloop}
        camera={{ position: [6.9, 3.4, 8], fov: CAMERA_FOV }}
        gl={{ antialias: ceiling > 0, alpha: true }}
      >
        <FitCamera />
        <QualityMonitor ceiling={ceiling} onChange={setQuality} />
        <ambientLight intensity={2.1} color="#ffedd5" />
        <directionalLight position={[3, 7, 6]} intensity={1.6} />

        <Suspense fallback={null}>
          <Float speed={moving ? 1.6 : 0} rotationIntensity={0.25} floatIntensity={0.5}>
            <PhotoBus doorOpen={doorOpen} onToggleDoor={toggleDoor} />
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
          autoRotate={moving && !doorOpen}
          autoRotateSpeed={1.4}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.15}
        />
      </Canvas>
    </div>
  );
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
    <WebGLBoundary fallback={fallback}>
      <BusScene />
    </WebGLBoundary>
  );
}