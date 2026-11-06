import type { Concept } from "../types";
import { FRONT, FRONT_GLASS, FRONT_LOWER } from "./van";

function Lens({ cx, r }: { cx: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={43} r={r} fill="var(--m-fg)" />
      <circle cx={cx} cy={43} r={r * 0.62} fill="var(--m-bg)" />
      <circle cx={cx} cy={43} r={r * 0.28} fill="var(--m-fg)" />
    </>
  );
}

function Mark() {
  return (
    <>
      <path d="M14 6H50M20 6V12M44 6V12" fill="none" stroke="var(--m-fg)" strokeWidth={3} />
      <path d={FRONT} fill="var(--m-bg)" />
      <path d={FRONT_LOWER} fill="var(--m-accent)" />
      <path d={FRONT} fill="none" stroke="var(--m-fg)" strokeWidth={3} />
      <path d={FRONT_GLASS} fill="var(--m-fg)" />
      <Lens cx={19} r={8.5} />
      <Lens cx={45} r={8.5} />
      <rect x={3} y={53} width={58} height={7} rx={2} fill="var(--m-fg)" />
    </>
  );
}

function Small() {
  return (
    <>
      <path d={FRONT} transform="translate(0 -8) scale(1 1.12)" fill="var(--m-fg)" />
      <path d="M17 12H47L50 26H14Z" fill="var(--m-bg)" />
      <circle cx={19} cy={43} r={9} fill="var(--m-bg)" />
      <circle cx={45} cy={43} r={9} fill="var(--m-bg)" />
    </>
  );
}

export const headlightLenses: Concept = {
  id: "headlight-lenses",
  name: "Lens Eyes",
  rationale: "Head-on, the two round headlights are camera lenses, so the van looks straight back at you.",
  strengths: ["The van gets a face, which makes it a character", "Only side of the vehicle that fills a square", "Two-tone waist is literally our paint job"],
  weakSpots: ["Without the rack it could be any retro minibus front", "Friendly more than clever: the camera half is the quieter half"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "lower",
  monoAccent: "bg",
};
