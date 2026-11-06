"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

const NEAR_VIEWPORT = "800px";
const IDLE_TIMEOUT = 2500;

/**
 * Mounts a 3D scene, and so fetches its chunk, only once it is close to the viewport.
 * `afterIdle` also waits for the browser to finish hydrating and painting the page.
 */
export function LazyScene({
  afterIdle = false,
  fallback,
  children,
}: {
  afterIdle?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const near = useInView(root, { once: true, margin: NEAR_VIEWPORT });
  const [idle, setIdle] = useState(!afterIdle);

  useEffect(() => {
    if (idle) return;
    const markIdle = () => setIdle(true);
    if (!("requestIdleCallback" in window)) {
      const timer = setTimeout(markIdle, IDLE_TIMEOUT / 2);
      return () => clearTimeout(timer);
    }
    const handle = requestIdleCallback(markIdle, { timeout: IDLE_TIMEOUT });
    return () => cancelIdleCallback(handle);
  }, [idle]);

  return (
    <div ref={root} className="h-full w-full">
      {near && idle ? children : fallback}
    </div>
  );
}
