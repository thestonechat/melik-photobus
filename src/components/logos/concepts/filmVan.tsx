import type { Concept } from "../types";

const BODY = "M6 10H38Q43 10 47 14L59 29Q62 31 62 35V50Q62 52 60 52H4Q2 52 2 50V12Q2 10 6 10Z";

function Row({ y, xs, size }: { y: number; xs: number[]; size: number }) {
  return xs.map((x) => <rect key={x} x={x} y={y} width={size} height={size} fill="var(--m-bg)" />);
}

function Mark() {
  return (
    <>
      <path d={BODY} fill="var(--m-fg)" />
      <Row y={13} xs={[6, 13, 20, 27, 34]} size={4} />
      <Row y={41} xs={[22, 29, 36]} size={4} />
      {[6, 18.5, 31].map((x) => (
        <rect key={x} x={x} y={20} width={10.5} height={16} rx={1} fill="var(--m-accent)" />
      ))}
      <path d="M44 20L54 32V36H44Z" fill="var(--m-accent)" />
      {[12, 50].map((cx) => (
        <circle key={cx} cx={cx} cy={52} r={8} fill="var(--m-fg)" stroke="var(--m-bg)" strokeWidth={2.5} />
      ))}
    </>
  );
}

function Small() {
  return (
    <>
      <path d="M2 8H42L62 30V54H2Z" fill="var(--m-fg)" />
      <rect x={7} y={16} width={13} height={20} fill="var(--m-bg)" />
      <rect x={25} y={16} width={13} height={20} fill="var(--m-bg)" />
      <path d="M43 18L55 32V36H43Z" fill="var(--m-bg)" />
      <circle cx={13} cy={54} r={9} fill="var(--m-fg)" />
      <circle cx={50} cy={54} r={9} fill="var(--m-fg)" />
    </>
  );
}

export const filmVan: Concept = {
  id: "film-van",
  name: "Film Van",
  rationale: "The van's body is a length of film: windows are frames, and the roof rack's crossbars become sprocket holes.",
  strengths: ["One object, two readings, and the rack finally means something", "Windows can fill with real photos", "Great as a long vinyl wrap on the actual van"],
  weakSpots: ["Perforations need about 32px to appear", "At 16px it is a plain, if tidy, van"],
  Mark,
  Small,
  fav32: "mark",
  favicon: "yellow",
  layout: "row",
  word: "title",
  monoAccent: "bg",
};
