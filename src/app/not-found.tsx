import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 text-center">
      <div>
        <h1 className="text-[clamp(3rem,10vw,6rem)] font-bold leading-none tracking-tight text-ink">
          404
        </h1>
        <p className="mt-4 text-lg text-ink-faint">Page not found</p>
        <Link
          href="/en"
          className="mt-8 inline-block rounded-full border-2 border-ink bg-primary px-6 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_0_var(--color-ink)] transition-all hover:-translate-y-0.5"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}