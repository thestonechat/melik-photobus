import type { ComponentType, CSSProperties, SVGProps } from "react";

export const NEON = "#ff1a1a";

const INK = "var(--color-ink)";
const WHITE = "var(--color-paper)";
const YELLOW = "var(--color-primary)";

export type WordStyle = "title" | "lower" | "upper";

export type Concept = {
  id: string;
  name: string;
  rationale: string;
  strengths: string[];
  weakSpots: string[];
  /** Full mark, drawn in a 64x64 box using the --m-* tone variables. */
  Mark: ComponentType;
  /** Simplified mark for 16px, and for 32px when `fav32` says so. */
  Small: ComponentType;
  fav32: "mark" | "small";
  favicon: "ink" | "yellow";
  layout: "row" | "stack";
  word: WordStyle;
  /** What the accent colour collapses to in the one-colour version. */
  monoAccent: "fg" | "bg";
  /** Replaces the Space Grotesk wordmark, e.g. drawn tube lettering. */
  Word?: ComponentType<SVGProps<SVGSVGElement>>;
};

type Tone = {
  fg: string;
  bg: string;
  accent: string;
  neon: string;
  core: string;
  glow: string;
  word: string;
  wordAccent: string;
};

export const tones = {
  white: { fg: INK, bg: WHITE, accent: YELLOW, neon: NEON, core: "none", glow: "none", word: INK, wordAccent: INK },
  ink: { fg: YELLOW, bg: INK, accent: WHITE, neon: NEON, core: WHITE, glow: `drop-shadow(0 0 3px ${NEON})`, word: WHITE, wordAccent: YELLOW },
  yellow: { fg: INK, bg: YELLOW, accent: WHITE, neon: INK, core: "none", glow: "none", word: INK, wordAccent: INK },
} satisfies Record<string, Tone>;

function monoTone(fg: string, bg: string, accent: "fg" | "bg"): Tone {
  return {
    fg,
    bg,
    accent: accent === "fg" ? fg : bg,
    neon: fg,
    core: "none",
    glow: "none",
    word: fg,
    wordAccent: fg,
  };
}

export const monoTones = (accent: "fg" | "bg") => ({
  positive: monoTone(INK, WHITE, accent),
  reversed: monoTone(WHITE, INK, accent),
});

export function toneVars(tone: Tone) {
  return {
    "--m-fg": tone.fg,
    "--m-bg": tone.bg,
    "--m-accent": tone.accent,
    "--m-neon": tone.neon,
    "--m-core": tone.core,
    "--m-glow": tone.glow,
    "--m-word": tone.word,
    "--m-word-accent": tone.wordAccent,
  } as CSSProperties;
}
