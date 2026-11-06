import type { Concept } from "../types";

const ARCH = "M1 54V26Q1 17 10 17H36Q43 17 48 22L60 35Q63 38 63 43V54H1Z";

function Holes() {
  return Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return <circle key={i} cx={32 + 12 * Math.cos(a)} cy={41 + 12 * Math.sin(a)} r={2} fill="var(--m-fg)" />;
  });
}

function Mark() {
  return (
    <>
      <path d="M6 10H36M12 10V17M30 10V17" fill="none" stroke="var(--m-fg)" strokeWidth={3} />
      <path d={ARCH} fill="var(--m-fg)" />
      <path d="M41 21L49 30H41Z" fill="var(--m-bg)" />
      <circle cx={32} cy={41} r={22.5} fill="var(--m-bg)" />
      <circle cx={32} cy={41} r={20} fill="var(--m-fg)" />
      <circle cx={32} cy={41} r={15} fill="var(--m-accent)" />
      <Holes />
      <circle cx={32} cy={41} r={7} fill="var(--m-fg)" />
      <circle cx={29.5} cy={38.5} r={2} fill="var(--m-bg)" />
    </>
  );
}

function Small() {
  return (
    <>
      <path d={ARCH} fill="var(--m-fg)" />
      <circle cx={32} cy={41} r={23} fill="var(--m-bg)" />
      <circle cx={32} cy={41} r={20} fill="var(--m-fg)" />
      <circle cx={32} cy={41} r={12} fill="var(--m-accent)" />
      <circle cx={32} cy={41} r={5} fill="var(--m-fg)" />
    </>
  );
}

export const archLens: Concept = {
  id: "arch-lens",
  name: "Big Wheel Lens",
  rationale: "One oversized wheel under a van's nose, its eight-hole rim from our real wheels turning into a lens barrel.",
  strengths: ["Very unusual silhouette, a nose over a giant wheel", "Rim detail comes from the actual van", "Reads as speed and as glass together"],
  weakSpots: ["Cropped view: some people will see a toy car or a boot", "Rim holes close up below 24px"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "upper",
  monoAccent: "bg",
};
