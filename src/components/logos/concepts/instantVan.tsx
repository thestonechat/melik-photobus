import type { Concept } from "../types";
import { FRONT, FRONT_GLASS } from "./van";

function Mark() {
  return (
    <>
      <rect x={18} y={38} width={28} height={24} fill="var(--m-bg)" stroke="var(--m-fg)" strokeWidth={2.5} />
      <rect x={22} y={44} width={20} height={13} fill="var(--m-accent)" stroke="var(--m-fg)" strokeWidth={2} />
      <g transform="translate(3 -7) scale(.906 .86)">
        <path d={FRONT} fill="var(--m-fg)" />
        <path d={FRONT_GLASS} fill="var(--m-bg)" />
        <circle cx={18} cy={42} r={6.5} fill="var(--m-bg)" />
        <circle cx={46} cy={42} r={6.5} fill="var(--m-bg)" />
      </g>
      <path d="M12 3H52" stroke="var(--m-fg)" strokeWidth={3} />
    </>
  );
}

function Small() {
  return (
    <>
      <rect x={15} y={30} width={34} height={33} fill="var(--m-bg)" stroke="var(--m-fg)" strokeWidth={5} />
      <path d="M12 2H52L60 30V38H4V30Z" fill="var(--m-fg)" />
      <path d="M19 8H45L48 20H16Z" fill="var(--m-bg)" />
    </>
  );
}

export const instantVan: Concept = {
  id: "instant-van",
  name: "Instant Van",
  rationale: "Head-on, the van is an instant camera: the bumper line is the slot and a fresh print slides out of it.",
  strengths: ["The clearest statement of the product, you leave with a print", "Print can hold real guest photos in campaigns", "Unusual tall silhouette"],
  weakSpots: ["The print reads as a tongue, charming or silly depending on taste", "Instant-camera language sits close to a well-known category, so keep it free of rainbow stripes"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "lower",
  monoAccent: "bg",
};
