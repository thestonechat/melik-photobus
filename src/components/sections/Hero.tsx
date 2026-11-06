"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { LazyScene } from "@/components/three/LazyScene";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const busLoading = (
  <div className="flex h-full w-full items-center justify-center">
    <span className="h-12 w-12 animate-spin rounded-full border-4 border-ink border-t-primary" />
  </div>
);

const BusModel = dynamic(() => import("@/components/three/BusModel"), {
  ssr: false,
  loading: () => busLoading,
});

/** CSS, not Motion: the headline animates in with the first paint, without waiting for hydration. */
const rise = "animate-rise-in motion-reduce:animate-none";
const stagger = (step: number) => ({ animationDelay: `${100 + step * 120}ms` });

const ctaLayout = "grow whitespace-nowrap px-2.5 text-base sm:grow-0 sm:px-8 sm:text-lg";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-44 top-12 h-120 w-120 bg-radial from-primary/30 to-transparent to-70%" />
        <div className="absolute -right-36 top-28 h-104 w-104 bg-radial from-primary/40 to-transparent to-70%" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.045)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative mx-auto grid min-h-[min(calc(100svh-9rem),48rem)] max-w-6xl grid-rows-[auto_minmax(9rem,1fr)] gap-4 px-5 pb-4 pt-18 sm:px-8 lg:grid-cols-2 lg:grid-rows-[1fr] lg:items-center lg:gap-8 lg:pb-6 lg:pt-20">
        <div className="relative z-10">
          <span
            style={stagger(0)}
            className={cn(
              "inline-block -rotate-2 rounded-full border-2 border-ink bg-primary px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-ink shadow-[3px_3px_0_0_var(--color-ink)]",
              rise,
            )}
          >
            {t("eyebrow")}
          </span>

          <h1
            style={stagger(1)}
            className={cn(
              "mt-4 font-display text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:mt-6 sm:text-6xl xl:text-7xl",
              rise,
            )}
          >
            {t("title1")}
            <br />
            <span className="relative inline-block">
              <span className="relative z-10">{t("title2")}</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-[-2%] bottom-[4%] z-0 block h-[38%] -rotate-1 rounded-sm bg-primary"
              />
            </span>
          </h1>

          <p
            style={stagger(2)}
            className={cn("mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:mt-6 sm:text-lg", rise)}
          >
            {t("subtitle")}
          </p>

          <div style={stagger(3)} className={cn("mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4", rise)}>
            <Button href="#book" size="lg" className={ctaLayout}>
              {t("ctaBook")}
            </Button>
            <Button
              href="#about"
              size="lg"
              variant="outline"
              className={cn(ctaLayout, "shadow-none")}
            >
              {t("ctaBus")}
            </Button>
          </div>

          <a
            href="#pictures"
            style={stagger(4)}
            className={cn(
              "mt-4 inline-flex items-center gap-2 text-sm font-bold text-ink underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary-strong",
              rise,
            )}
          >
            <Camera className="h-4 w-4 shrink-0 text-primary-strong" />
            {t("ctaPictures")}
          </a>
        </div>

        <div className="relative z-10 animate-fade-in motion-reduce:animate-none lg:self-stretch">
          <div className="absolute inset-0">
            <LazyScene afterIdle fallback={busLoading}>
              <BusModel />
            </LazyScene>
          </div>
        </div>
      </div>
    </section>
  );
}