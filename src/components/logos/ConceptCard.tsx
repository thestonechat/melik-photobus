import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BusPanel } from "./BusPanel";
import { Lockup, MarkSvg, Wordmark } from "./Lockup";
import { monoTones, tones, toneVars, type Concept } from "./types";

const PANEL = "border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]";

function Slot({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <figure className={cn("min-w-0", className)}>
      <figcaption className="mb-1.5 text-xs font-semibold text-ink-muted">{label}</figcaption>
      {children}
    </figure>
  );
}

function Surface({ tone, concept, className }: { tone: keyof typeof tones; concept: Concept; className?: string }) {
  return (
    <div
      style={toneVars(tones[tone])}
      className={cn(PANEL, "flex min-h-40 items-center justify-center bg-(--m-bg) p-4", className)}
    >
      <Lockup concept={concept} markClassName="size-14" textClassName="text-2xl" tubeClassName="h-8 w-auto max-w-full" />
    </div>
  );
}

function Favicon({ concept, size }: { concept: Concept; size: 16 | 32 }) {
  const Mark = size === 32 && concept.fav32 === "mark" ? concept.Mark : concept.Small;
  return (
    <span
      style={{ ...toneVars(tones[concept.favicon]), width: size, height: size }}
      className="block overflow-hidden rounded-[18%] bg-(--m-bg)"
      title={`${size}px`}
    >
      <MarkSvg Mark={Mark} size={size} />
    </span>
  );
}

export function FaviconPair({ concept }: { concept: Concept }) {
  return (
    <div className="flex items-center gap-3">
      <Favicon concept={concept} size={32} />
      <Favicon concept={concept} size={16} />
    </div>
  );
}

function Notes({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-ink">{title}</h3>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-soft">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ConceptCard({ concept, index }: { concept: Concept; index: number }) {
  const mono = monoTones(concept.monoAccent);

  return (
    <article id={concept.id} className={cn(PANEL, "scroll-mt-6 bg-paper p-4 sm:p-6")}>
      <header className="mb-5">
        <p className="text-xs font-semibold text-ink-muted">{String(index + 1).padStart(2, "0")}</p>
        <h2 className="font-display text-2xl font-bold text-ink">{concept.name}</h2>
        <p className="mt-1 text-sm text-ink-soft">{concept.rationale}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <Slot label="Primary on white">
          <div style={toneVars(tones.white)} className={cn(PANEL, "flex min-h-40 items-center justify-center bg-paper p-4")}>
            <Lockup concept={concept} markClassName="size-16" textClassName="text-3xl" tubeClassName="h-9 w-auto max-w-full" />
          </div>
        </Slot>
        <Slot label="On ink"><Surface tone="ink" concept={concept} /></Slot>
        <Slot label="On yellow"><Surface tone="yellow" concept={concept} /></Slot>

        <Slot label="Navbar, real size (36px mark)">
          <div style={toneVars(tones.white)} className={cn(PANEL, "flex h-16 items-center gap-2.5 bg-paper px-4")}>
            <MarkSvg Mark={concept.Mark} size={36} />
            <Wordmark concept={concept} className="text-xl" tubeClassName="h-6 w-auto" />
          </div>
        </Slot>
        <Slot label="Favicon, real 32px and 16px">
          <div className="grid h-16 grid-cols-2">
            <div className="flex items-center justify-center border-2 border-r-0 border-ink bg-paper-soft">
              <FaviconPair concept={concept} />
            </div>
            <div className="flex items-center justify-center border-2 border-ink bg-ink-soft">
              <FaviconPair concept={concept} />
            </div>
          </div>
        </Slot>
        <Slot label="One colour, positive and reversed">
          <div className="grid h-16 grid-cols-2">
            {[mono.positive, mono.reversed].map((tone, i) => (
              <div key={i} style={toneVars(tone)} className="flex items-center justify-center border-2 border-ink bg-(--m-bg)">
                <MarkSvg Mark={concept.Mark} size={48} />
              </div>
            ))}
          </div>
        </Slot>

        <Slot label="On the bus" className="lg:col-span-2">
          <div className="border-2 border-ink bg-primary-faint p-2"><BusPanel concept={concept} /></div>
        </Slot>
        <div className="space-y-4">
          <Notes title="Strengths" items={concept.strengths} />
          <Notes title="Weak spots" items={concept.weakSpots} />
        </div>
      </div>
    </article>
  );
}
