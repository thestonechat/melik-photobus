import type { Concept } from "../types";
import { VAN, WINDSCREEN, Wheels } from "./van";

function Mark() {
  return (
    <>
      <path d="M12 23L16 12H40L44 23Z" fill="var(--m-fg)" />
      <rect x={21} y={15.5} width={14} height={3.5} fill="var(--m-accent)" />
      <path d={VAN} transform="translate(0 3)" fill="var(--m-fg)" />
      <path d={WINDSCREEN} transform="translate(0 3)" fill="var(--m-bg)" />
      <circle cx={28} cy={37} r={11} fill="var(--m-bg)" />
      <circle cx={28} cy={37} r={7.5} fill="var(--m-fg)" />
      <circle cx={28} cy={37} r={3.5} fill="var(--m-accent)" />
      <Wheels cy={52} left={11} right={51} r={6.5} />
    </>
  );
}

function Small() {
  return (
    <>
      <path d="M13 22L18 6H40L45 22Z" fill="var(--m-fg)" />
      <path d="M3 20H42L62 36V54H3Z" fill="var(--m-fg)" />
      <circle cx={27} cy={36} r={12} fill="var(--m-bg)" />
      <circle cx={27} cy={36} r={5} fill="var(--m-fg)" />
    </>
  );
}

export const signPrism: Concept = {
  id: "sign-prism",
  name: "Roof Prism",
  rationale: "The roof sign becomes an SLR's viewfinder hump, so van and camera share one body with a sloped nose.",
  strengths: ["Most direct merger of the two objects, readable in a second", "Lens sits where the side door is, a big simple target", "Works in every colour"],
  weakSpots: ["Closest to a stock camera icon of this set", "Loses the rack and hatch, the most ownable real features"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "title",
  monoAccent: "bg",
};
