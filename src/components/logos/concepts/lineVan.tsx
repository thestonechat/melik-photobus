import type { SVGProps } from "react";
import type { Concept } from "../types";

const X = 14;
const B = 34;
const bowl = (x: number) => `M${x} 24a10 10 0 1 1 20 0a10 10 0 1 1 -20 0`;
const GLYPHS = {
  p: { w: 22, d: `M2 46V14${bowl(2)}` },
  h: { w: 22, d: `M2 0V${B}M2 24a10 10 0 0 1 20 0V${B}` },
  o: { w: 20, d: bowl(0) },
  t: { w: 16, d: `M7 3V28Q7 ${B} 13 ${B}H16M1 ${X}H15` },
  g: { w: 22, d: `${bowl(2)}M22 ${X}V38Q22 46 12 46Q6 46 3 42` },
  r: { w: 14, d: `M2 ${X}V${B}M2 24Q2 ${X} 14 ${X}` },
  a: { w: 22, d: `${bowl(2)}M22 ${X}V${B}` },
} as const;

const LETTERS = ["p", "h", "o", "t", "o", "g", "r", "a", "p", "h"] as const;
const GAP = 7;
const placed = LETTERS.reduce<{ d: string; x: number }[]>((all, letter, i) => {
  const prev = all[i - 1];
  const x = prev ? prev.x + GLYPHS[LETTERS[i - 1]].w + GAP : 2;
  return [...all, { d: GLYPHS[letter].d, x }];
}, []);
const WIDTH = placed[placed.length - 1].x + 24;

function Tube({ d, width, core }: { d: string; width: number; core: number }) {
  return (
    <>
      <path d={d} fill="none" stroke="var(--m-neon)" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--m-core)" strokeWidth={core} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Word(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox={`-2 -2 ${WIDTH + 4} 52`} style={{ filter: "var(--m-glow)" }} {...props}>
      {placed.map(({ d, x }) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <Tube d={d} width={4.6} core={1.2} />
        </g>
      ))}
    </svg>
  );
}

const OUTLINE =
  "M0 11L12 18H38L60 36V50H54A8 8 0 0 0 38 50H24A8 8 0 0 0 8 50H4V20L12 18";

function Mark() {
  return (
    <g style={{ filter: "var(--m-glow)" }}>
      <Tube d={OUTLINE} width={3.6} core={1} />
      <path d="M36 24V35H51" fill="none" stroke="var(--m-fg)" strokeWidth={2.5} strokeLinecap="round" />
      <path d="M16 11H36" stroke="var(--m-fg)" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={16} cy={50} r={3.5} fill="var(--m-fg)" />
      <circle cx={46} cy={50} r={3.5} fill="var(--m-fg)" />
    </g>
  );
}

function Small() {
  return <Tube d="M2 11L14 18H40L60 36V54H5V18" width={8} core={2} />;
}

export const lineVan: Concept = {
  id: "line-van",
  name: "One Tube",
  rationale: "The whole van, hatch up, bent from a single neon tube like the sign on its roof, with matching tube lettering.",
  strengths: ["Comes straight from the real neon on the van", "Spectacular on dark and at night events", "Gives a real custom wordmark"],
  weakSpots: ["Depends on glow: on white and yellow it is an ordinary line", "No camera in the mark, the neon carries the idea alone"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "ink",
  layout: "row",
  word: "lower",
  monoAccent: "fg",
  Word,
};
