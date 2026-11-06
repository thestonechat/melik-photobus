import type * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";

/** Length of the seamless loop in seconds. The arm slows to a crawl at its midpoint. */
export const LOOP = 8;
export const BEAT = 0.5;
export const BEATS_PER_POSE = 2;
/** Mid-loop slow motion: the frozen pose shown when animation is reduced. */
export const STILL_TIME = LOOP / 2;
export const TAU = Math.PI * 2;

const ARM_RAMP = 0.8;
const STAGE_RAMP = 0.55;
const ARM_REVOLUTIONS = 3;
/** Where the arm sits on screen-left, framing the dancers when the flash fires. */
export const FLASH_ANGLE = -1.75;
const ARM_START = FLASH_ANGLE - (ARM_REVOLUTIONS * TAU * STILL_TIME) / LOOP;
const FLASH_SHARPNESS = 24;

/** Remaps time so it races at the loop's start and end, and crawls in the middle. */
function ramp(time: number, strength: number) {
  return time + ((strength * LOOP) / TAU) * Math.sin((TAU * time) / LOOP);
}

export function armAngle(time: number) {
  return ARM_START + (ARM_REVOLUTIONS * TAU * ramp(time, ARM_RAMP)) / LOOP;
}

/** Music time: beats, chases and particles all share this speed ramp. */
export function stageTime(time: number) {
  return ramp(time, STAGE_RAMP);
}

/** 1 on the beat, decaying before the next one. */
export function beatPulse(stage: number) {
  return Math.exp(-6 * (((stage % BEAT) + BEAT) % BEAT) / BEAT);
}

/** 0 at full speed, 1 at the bottom of the slow-motion dip. */
export function slowMotion(time: number) {
  return (1 - Math.cos((TAU * time) / LOOP)) / 2;
}

/** Peaks as the ring light passes the flash point. */
export function flashAmount(angle: number) {
  return Math.max(Math.cos(angle - FLASH_ANGLE), 0) ** FLASH_SHARPNESS;
}

/** Runs `animate` every frame, or once at the still pose when motion is reduced. */
export function useSpinFrame(animate: (time: number, camera: THREE.Camera) => void) {
  const reducedMotion = useReducedMotion();
  useFrame(({ clock, camera }) => animate(reducedMotion ? STILL_TIME : clock.elapsedTime, camera));
}
