import type { Metadata } from "next";
import { ConceptCard, FaviconPair } from "@/components/logos/ConceptCard";
import { concepts } from "@/components/logos/concepts";

export const metadata: Metadata = {
  title: "Logo iterations",
  robots: { index: false, follow: false },
};

export default function LogoIterationsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-ink">Logo iterations</h1>
        <p className="mt-2 text-ink-soft">
          Ten ideas built from our van and a camera. Each is shown at real sizes and on the van.
        </p>
      </header>

      <nav aria-label="Concepts" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {concepts.map((concept) => (
          <a
            key={concept.id}
            href={`#${concept.id}`}
            className="flex items-center justify-between gap-2 border-2 border-ink bg-paper p-2 text-xs font-semibold text-ink hover:bg-primary"
          >
            {concept.name}
            <FaviconPair concept={concept} />
          </a>
        ))}
      </nav>

      {concepts.map((concept, index) => (
        <ConceptCard key={concept.id} concept={concept} index={index} />
      ))}
    </main>
  );
}
