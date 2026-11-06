import type { RefObject } from "react";
import Image from "next/image";

const FRAME = "absolute left-0 top-0 h-auto w-[calc(1640/1080*100%)] max-w-none";

/** The card's half of the shared frame: the rest of it is cropped away by the card itself. */
export function SpinVideo({
  videoRef,
  enabled,
  live,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  live: boolean;
}) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <Image src="/spin/poster.webp" alt="" width={1230} height={810} unoptimized className={FRAME} />
      {enabled && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          disablePictureInPicture
          preload="metadata"
          className={`${FRAME} ${live ? "" : "opacity-0"}`}
        >
          <source src="/spin/spin.webm" type='video/webm; codecs="av01.0.08M.08"' media="(min-width: 1024px)" />
          <source src="/spin/spin.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
