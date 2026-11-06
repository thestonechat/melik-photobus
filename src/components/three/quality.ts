"use client";

import { type RefObject, useSyncExternalStore } from "react";
import { useInView } from "motion/react";

/** 0 is the cheapest mode a weak device can hold, 2 is the full look. */
export type Quality = 0 | 1 | 2;

const MAX_DPR: Record<Quality, number> = { 0: 1, 1: 1.5, 2: 2 };

export const qualityDpr = (quality: Quality): [number, number] => [1, MAX_DPR[quality]];

/** True only when the browser would give us a software rasterizer instead of a GPU. */
function isSoftwareWebGL() {
  const context = document
    .createElement("canvas")
    .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  context?.getExtension("WEBGL_lose_context")?.loseContext();
  return !context;
}

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

let detected: Quality | undefined;

/** The most this device should attempt. Scenes only ever step down from here at runtime. */
export function detectQuality(): Quality {
  if (detected !== undefined) return detected;
  const { hardwareConcurrency: cores = 8, deviceMemory: memory = 8, connection } =
    navigator as NavigatorHints;
  if (connection?.saveData || cores <= 2 || memory <= 2 || isSoftwareWebGL()) detected = 0;
  else detected = cores <= 4 || memory <= 4 ? 1 : 2;
  return detected;
}

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Whether a scene is worth drawing: its element is on screen and the tab is showing. */
export function useSceneVisible(target: RefObject<Element | null>) {
  const inView = useInView(target);
  const pageShown = useSyncExternalStore(
    subscribeToVisibility,
    () => !document.hidden,
    () => true,
  );
  return inView && pageShown;
}
