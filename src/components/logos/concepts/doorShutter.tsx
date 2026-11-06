import type { Concept } from "../types";
import { VAN, WINDSCREEN, Wheels } from "./van";

function Body({ small }: { small?: boolean }) {
  return (
    <g transform="translate(0 -13)">
      <path d={small ? "M3 18H42L62 36V52H3Z" : VAN} fill="var(--m-fg)" />
      {!small && <path d={WINDSCREEN} fill="var(--m-bg)" />}
    </g>
  );
}

function Mark() {
  return (
    <>
      <path d="M8 4H36" stroke="var(--m-fg)" strokeWidth={3} />
      <Body />
      <path d="M23 36H33L50 60H6Z" fill="var(--m-accent)" stroke="var(--m-fg)" strokeWidth={2} strokeLinejoin="round" />
      <rect x={23} y={12} width={10} height={24} fill="var(--m-bg)" />
      <Wheels cy={36} left={12} right={47} r={6} />
    </>
  );
}

function Small() {
  return (
    <>
      <Body small />
      <path d="M20 39H36L58 63H-2Z" fill="var(--m-accent)" stroke="var(--m-fg)" strokeWidth={3} />
      <rect x={20} y={8} width={16} height={31} fill="var(--m-bg)" />
    </>
  );
}

export const doorShutter: Concept = {
  id: "door-shutter",
  name: "Door Shutter",
  rationale: "The sliding door opens like a shutter, and light pours out onto the ground. Something is happening in there.",
  strengths: ["Most story in the fewest shapes", "No lens or camera cliche at all", "Light spill animates beautifully on the site"],
  weakSpots: ["Needs a moment: the camera link is implied, not shown", "Could suggest a removal van or a stage until you read the name"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "ink",
  layout: "row",
  word: "lower",
  monoAccent: "fg",
};
