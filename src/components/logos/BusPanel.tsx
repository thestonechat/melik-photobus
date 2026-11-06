import { useId } from "react";
import { wordParts } from "./Lockup";
import { NEON, tones, toneVars, type Concept } from "./types";

const INK = "var(--color-ink)";
const BODY =
  "M44 62H330Q350 62 366 76L430 130Q446 134 450 146V188Q450 194 442 194H40Q32 194 32 186L36 70Q36 62 44 62Z";

function Wheel({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy={192} r={30} fill="var(--color-paper)" />
      <circle cx={cx} cy={192} r={25} fill={INK} />
      <circle cx={cx} cy={192} r={10} fill="var(--color-ink-faint)" />
    </g>
  );
}

export function BusPanel({ concept }: { concept: Concept }) {
  const clip = useId();
  const { Mark, Word } = concept;
  const [first, second] = wordParts(concept.word);

  return (
    <svg
      viewBox="-16 0 496 228"
      className="w-full"
      role="img"
      aria-label={`${concept.name} applied to the side of the van`}
    >
      <clipPath id={clip}>
        <path d={BODY} />
      </clipPath>
      <path d="M0 38L12 92" stroke={INK} strokeWidth={3} />
      <path d="M52 60L-10 32L-4 22L68 58Z" fill="var(--color-paper)" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <g stroke={INK} strokeWidth={4}>
        <path d="M70 44H340M90 44V62M320 44V62" fill="none" />
        <rect x={120} y={10} width={150} height={34} rx={4} fill={INK} />
      </g>
      <text x={195} y={34} textAnchor="middle" fontSize={21} letterSpacing={4} fill={NEON} className="font-display font-bold">
        PHOTOS
      </text>
      <path d={BODY} fill="var(--color-paper)" />
      <rect x={0} y={118} width={480} height={90} fill="var(--color-primary)" clipPath={`url(#${clip})`} />
      <path d={BODY} fill="none" stroke={INK} strokeWidth={4} />
      <rect x={52} y={76} width={84} height={34} rx={5} fill={INK} />
      <rect x={148} y={76} width={84} height={34} rx={5} fill={INK} />
      <rect x={244} y={76} width={72} height={34} rx={5} fill={INK} />
      <path d="M330 78H348L394 114H330Z" fill={INK} />
      <circle cx={438} cy={158} r={8} fill="var(--color-paper)" stroke={INK} strokeWidth={3} />
      <rect x={424} y={182} width={38} height={14} rx={3} fill={INK} />
      <Wheel cx={94} />
      <Wheel cx={380} />
      <g style={toneVars(tones.yellow)}>
        <svg x={130} y={122} width={64} height={64} viewBox="0 0 64 64">
          <Mark />
        </svg>
        {Word ? (
          <Word x={200} y={138} width={140} height={34} />
        ) : (
          <text
            x={200}
            y={162}
            fontSize={concept.word === "upper" ? 21 : 25}
            fill={INK}
            className="font-display font-bold"
          >
            {first}
            {second}
          </text>
        )}
      </g>
    </svg>
  );
}
