import type { Concept } from "../types";
import { VAN, WINDSCREEN, Wheels } from "./van";

const HATCH = "M15 24L0 18L2 12L21 22Z";
const BODY = "translate(7 3) scale(.92 1)";

function Mark() {
  return (
    <>
      <path d="M3 8L2 3M11 10L14 4M19 14L25 8" stroke="var(--m-fg)" strokeWidth={3} strokeLinecap="round" />
      <path d={VAN} transform={BODY} fill="var(--m-fg)" />
      <path d={WINDSCREEN} transform={BODY} fill="var(--m-bg)" />
      <path d={HATCH} fill="var(--m-accent)" stroke="var(--m-fg)" strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={31} cy={37} r={7.5} fill="var(--m-bg)" />
      <circle cx={31} cy={37} r={3.5} fill="var(--m-fg)" />
      <Wheels cy={52} left={19} right={50} r={6.5} />
    </>
  );
}

function Small() {
  return (
    <>
      <path d="M8 7L10 2M22 12L27 5" stroke="var(--m-fg)" strokeWidth={5} strokeLinecap="round" />
      <path d="M11 24H42L62 38V54H11Z" fill="var(--m-fg)" />
      <path d="M15 28L0 19L3 11L24 23Z" fill="var(--m-fg)" />
      <circle cx={33} cy={39} r={8} fill="var(--m-bg)" />
    </>
  );
}

export const hatchFlash: Concept = {
  id: "hatch-flash",
  name: "Pop-up Flash",
  rationale: "The van's lifted rear hatch is a camera's pop-up flash, already raised and firing.",
  strengths: ["The hatch wedge is a shape no stock van has", "True of the real vehicle: open the hatch and it matches the logo", "Silhouette survives at 16px"],
  weakSpots: ["Facing-right wedge needs width, so it sits small in square slots", "The rays can look like a cartoon surprise if drawn any larger"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "title",
  monoAccent: "bg",
};
