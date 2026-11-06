import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import type { Concept, WordStyle } from "./types";

const WORD: Record<WordStyle, readonly [string, string]> = {
  title: ["Photo", "graph"],
  lower: ["photo", "graph"],
  upper: ["PHOTO", "GRAPH"],
};

export function wordParts(style: WordStyle) {
  return WORD[style];
}

export function MarkSvg({
  Mark,
  className,
  size,
}: {
  Mark: ComponentType;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <Mark />
    </svg>
  );
}

export function Wordmark({
  concept,
  className,
  tubeClassName,
}: {
  concept: Concept;
  className?: string;
  tubeClassName?: string;
}) {
  const { Word } = concept;
  if (Word) return <Word className={tubeClassName} aria-label="Photograph" />;
  const [first, second] = wordParts(concept.word);
  return (
    <span
      className={cn(
        "font-display font-bold tracking-tight text-(--m-word)",
        className,
      )}
    >
      {first}
      <span className="text-(--m-word-accent)">{second}</span>
    </span>
  );
}

export function Lockup({
  concept,
  markClassName,
  textClassName,
  tubeClassName,
}: {
  concept: Concept;
  markClassName: string;
  textClassName: string;
  tubeClassName: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center",
        concept.layout === "stack" ? "flex-col gap-2" : "gap-3",
      )}
    >
      <MarkSvg Mark={concept.Mark} className={markClassName} />
      <Wordmark
        concept={concept}
        className={textClassName}
        tubeClassName={tubeClassName}
      />
    </div>
  );
}
