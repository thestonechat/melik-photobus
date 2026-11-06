import type { Concept } from "../types";
import { VAN, WINDSCREEN, Wheels } from "./van";

const CORNERS = "M3 17V3H17M47 3H61V17M61 47V61H47M17 61H3V47";

function Mark() {
  return (
    <>
      <path d={CORNERS} fill="none" stroke="var(--m-fg)" strokeWidth={4} />
      <path d="M13 15H37" stroke="var(--m-fg)" strokeWidth={2.5} />
      <g transform="translate(5 2)  scale(.9)">
        <path d={VAN} fill="var(--m-fg)" />
        <path d={WINDSCREEN} fill="var(--m-bg)" />
        <Wheels />
      </g>
      <rect x={19} y={25} width={14} height={14} fill="none" stroke="var(--m-accent)" strokeWidth={2.5} />
      <circle cx={26} cy={32} r={2} fill="var(--m-accent)" />
    </>
  );
}

function Small() {
  return (
    <>
      <path d={CORNERS} fill="none" stroke="var(--m-fg)" strokeWidth={7} />
      <path d="M12 24H37L53 37V47H12Z" fill="var(--m-fg)" />
    </>
  );
}

export const viewfinderVan: Concept = {
  id: "viewfinder-van",
  name: "In Focus",
  rationale: "The van caught in a viewfinder with the focus box locked on its headlight: we are the subject, always in frame.",
  strengths: ["Square by nature, an easy avatar", "Frame can crop any photo in campaigns", "Instantly understood"],
  weakSpots: ["Two objects next to each other, the least merged idea here", "Detail is thin below 24px, the focus box drops out"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "title",
  monoAccent: "fg",
};
