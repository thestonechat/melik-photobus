import type { RefObject } from "react";
import Image from "next/image";
import { SpinHud } from "@/components/spin/SpinHud";

const SCREEN_WIDTH = 405;
const SCREEN_HEIGHT = 720;

/** The arm's camera: the poster's feed crop until `useSpinVideo` paints the canvas. */
export function SpinPhone({
  screenRef,
  live,
  label,
  speed,
}: {
  screenRef: RefObject<HTMLCanvasElement | null>;
  live: boolean;
  label: string;
  speed: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="w-32 rotate-3 rounded-[1.75rem] border-2 border-paper bg-ink p-1.5 shadow-[6px_6px_0_0_var(--color-primary-strong)] sm:w-52"
    >
      <div className="relative aspect-[9/16] overflow-hidden rounded-[1.35rem] bg-ink-soft">
        <Image
          src="/spin/poster.webp"
          alt=""
          width={1230}
          height={810}
          unoptimized
          className="absolute left-[calc(-1100/540*100%)] top-0 h-auto w-[calc(1640/540*100%)] max-w-none"
        />
        <canvas
          ref={screenRef}
          width={SCREEN_WIDTH}
          height={SCREEN_HEIGHT}
          className={`absolute inset-0 h-full w-full ${live ? "" : "invisible"}`}
        />
        <SpinHud label={label} speed={speed} />
      </div>
    </div>
  );
}
