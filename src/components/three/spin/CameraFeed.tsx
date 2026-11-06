"use client";

import { type RefObject, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type { Quality } from "../quality";
import { FEED_HEIGHT, FEED_WIDTH, spinFeed } from "@/components/spin/spinFeed";
import { COLORS } from "../busArt";
import { OUTLINE_NAME } from "../Toon";
import { tipX, tipZ } from "./SpinArm";
import { armAngle, flashAmount, LOOP, slowMotion, STILL_TIME, TAU } from "./timeline";

const LENS_FOV = 64;
/** The arm's bearing, pulled back so a phone in portrait fits her whole body and the room. */
const LENS_REACH = 2.35;
const LENS_Y = 1.4;
const LOOK_Y = 1.15;
/** The phone's video frame rate. Time based, so a 120Hz screen doesn't double the work. */
const FEED_FPS: Record<Quality, number> = { 0: 8, 1: 20, 2: 30 };
const FRAME_SLACK_MS = 4;
const FLASH_STRENGTH = 0.35;
const RENDER_AFTER_SCENE = 1;
const lens = new THREE.PerspectiveCamera(LENS_FOV, FEED_WIDTH / FEED_HEIGHT, 0.1, 20);
const clear = new THREE.Color(COLORS.inkSoft);

/** Paints the arm camera's view into the phone from this same context and frame. */
export function CameraFeed({
  rigRef,
  backdropRef,
  stageX,
  guestYaw,
}: {
  rigRef: RefObject<THREE.Group | null>;
  backdropRef: RefObject<THREE.Group | null>;
  stageX: number;
  guestYaw: number;
}) {
  const reducedMotion = useReducedMotion();
  const lastFeed = useRef(-Infinity);
  const outlines = useRef<THREE.Object3D[]>(null);

  useFrame(({ gl, scene, camera, clock }) => {
    const { screen, screenVisible, quality } = spinFeed;
    const now = performance.now();
    if (screen && screenVisible && now - lastFeed.current >= 1000 / FEED_FPS[quality] - FRAME_SLACK_MS) {
      lastFeed.current = now;
      const time = reducedMotion ? STILL_TIME : clock.elapsedTime;
      const angle = armAngle(time);
      const facing = guestYaw - Math.PI / 2;
      spinFeed.clip.set(time % LOOP);
      spinFeed.orbit.set((((angle - facing) % TAU) + TAU) % TAU * (360 / TAU));
      spinFeed.slow.set(slowMotion(time));

      const canvas = gl.domElement;
      const height = Math.min(FEED_HEIGHT, canvas.height);
      const width = (height * FEED_WIDTH) / FEED_HEIGHT;
      const ratio = gl.getPixelRatio();

      lens.position.set(stageX + tipX(angle) * LENS_REACH, LENS_Y, tipZ(angle) * LENS_REACH);
      lens.lookAt(stageX, LOOK_Y, 0);
      lens.updateMatrixWorld();

      if (!outlines.current) {
        const found: THREE.Object3D[] = [];
        scene.traverse((object) => object.name === OUTLINE_NAME && found.push(object));
        outlines.current = found;
      }
      const drawOutlines = quality === 2;
      if (!drawOutlines) outlines.current.forEach((outline) => (outline.visible = false));
      rigRef.current!.visible = false;
      backdropRef.current!.visible = true;
      gl.setClearColor(clear, 1);
      gl.setScissorTest(true);
      gl.setScissor(0, 0, width / ratio, height / ratio);
      gl.setViewport(0, 0, width / ratio, height / ratio);
      gl.render(scene, lens);
      screen.drawImage(canvas, 0, canvas.height - height, width, height, 0, 0, FEED_WIDTH, FEED_HEIGHT);
      screen.globalAlpha = flashAmount(angle) * FLASH_STRENGTH;
      screen.fillStyle = COLORS.paper;
      screen.fillRect(0, 0, FEED_WIDTH, FEED_HEIGHT);
      screen.globalAlpha = 1;

      if (!drawOutlines) outlines.current.forEach((outline) => (outline.visible = true));
      rigRef.current!.visible = true;
      backdropRef.current!.visible = false;
      gl.setScissorTest(false);
      gl.setViewport(0, 0, canvas.width / ratio, canvas.height / ratio);
      gl.setClearColor(clear, 0);
    }
    gl.render(scene, camera);
  }, RENDER_AFTER_SCENE);

  return null;
}
