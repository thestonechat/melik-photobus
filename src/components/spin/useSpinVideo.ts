"use client";

import { type RefObject, useEffect, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { FEED_HEIGHT, FEED_WIDTH, FEED_X, FRAME_WIDTH, LOOP, showSpinTime, STILL_TIME } from "@/components/spin/spinFeed";
import { useSceneVisible } from "@/components/three/quality";

const NEAR_VIEWPORT = "400px";

const saveData = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * Plays the one video and copies its feed crop into the phone's canvas as each frame lands, so
 * card, phone and HUD cannot disagree. Stays on the poster until a frame actually arrives, which
 * covers reduced motion, Save-Data and blocked autoplay alike.
 */
export function useSpinVideo(
  stageRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  screenRef: RefObject<HTMLCanvasElement | null>,
) {
  const near = useInView(stageRef, { once: true, margin: NEAR_VIEWPORT });
  const visible = useSceneVisible(stageRef);
  const reducedMotion = useReducedMotion();
  const enabled = near && !reducedMotion && !saveData();
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    if (!enabled) showSpinTime(STILL_TIME);
  }, [enabled]);

  useEffect(() => {
    const video = videoRef.current;
    const screen = screenRef.current?.getContext("2d");
    if (!enabled || !visible || !video || !screen) return;

    const paint = (time: number) => {
      const scale = video.videoWidth / FRAME_WIDTH;
      screen.drawImage(
        video,
        FEED_X * scale,
        0,
        FEED_WIDTH * scale,
        FEED_HEIGHT * scale,
        0,
        0,
        screen.canvas.width,
        screen.canvas.height,
      );
      showSpinTime((time + STILL_TIME) % LOOP);
      if (!video.paused) setPainted(true);
    };

    let stop: () => void;
    if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
      let frame: number;
      const onFrame: VideoFrameRequestCallback = (_, { mediaTime }) => {
        paint(mediaTime);
        frame = video.requestVideoFrameCallback(onFrame);
      };
      frame = video.requestVideoFrameCallback(onFrame);
      stop = () => video.cancelVideoFrameCallback(frame);
    } else {
      let frame: number;
      const onFrame = () => {
        if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) paint(video.currentTime);
        frame = requestAnimationFrame(onFrame);
      };
      frame = requestAnimationFrame(onFrame);
      stop = () => cancelAnimationFrame(frame);
    }

    // Rejected when autoplay is blocked, as in iOS Low Power Mode: the poster simply stays.
    video.play().catch(() => {});
    return () => {
      stop();
      video.pause();
    };
  }, [enabled, visible, videoRef, screenRef]);

  return { enabled, live: enabled && painted };
}
