import type { Concept } from "../types";
import { VAN, WINDSCREEN } from "./van";

const CAMERA = "M6 16H19L23 7H41L45 16H58Q62 16 62 20V54Q62 58 58 58H6Q2 58 2 54V20Q2 16 6 16Z";

function Cutout({ transform, r }: { transform: string; r: number }) {
  return (
    <g transform={transform}>
      <path d={VAN} fill="var(--m-bg)" />
      <rect x={9} y={26} width={13} height={9} rx={1} fill="var(--m-fg)" />
      <rect x={26} y={26} width={13} height={9} rx={1} fill="var(--m-fg)" />
      <path d={WINDSCREEN} fill="var(--m-fg)" />
      <circle cx={15} cy={49} r={r} fill="var(--m-fg)" />
      <circle cx={47} cy={49} r={r} fill="var(--m-fg)" />
    </g>
  );
}

function Mark() {
  return (
    <>
      <path d={CAMERA} fill="var(--m-fg)" />
      <Cutout transform="translate(4.8 2) scale(.85)" r={7} />
    </>
  );
}

function Small() {
  return (
    <>
      <path d={CAMERA} fill="var(--m-fg)" />
      <Cutout transform="translate(2 -2) scale(.94)" r={8} />
    </>
  );
}

export const vanCutout: Concept = {
  id: "van-cutout",
  name: "Van Inside",
  rationale: "A solid camera with the van cut out of it where the lens should be: the van is what the camera sees through.",
  strengths: ["Very strong figure and ground in one colour", "Bold enough for a van door or a sticker", "Holds at 16px"],
  weakSpots: ["The outer shape is a generic camera", "Below 24px the windows close up"],
  Mark,
  Small,
  fav32: "small",
  favicon: "yellow",
  layout: "row",
  word: "upper",
  monoAccent: "fg",
};
