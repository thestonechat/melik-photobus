"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const BusModel = dynamic(() => import("@/components/three/BusModel"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-ink border-t-primary" />
    </div>
  ),
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const ctaLayout = "grow whitespace-nowrap px-3 text-base sm:grow-0 sm:px-8 sm:text-lg";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.045)_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative mx-auto grid min-h-[min(calc(100svh-9rem),48rem)] max-w-6xl grid-rows-[auto_minmax(9rem,1fr)] gap-4 px-5 pb-4 pt-18 sm:px-8 lg:grid-cols-2 lg:grid-rows-[1fr] lg:items-center lg:gap-8 lg:pb-6 lg:pt-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          <motion.span
            variants={item}
            className="inline-block -rotate-2 rounded-full border-2 border-ink bg-primary px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-ink shadow-[3px_3px_0_0_var(--color-ink)]"
          >
            {t("eyebrow")}
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-4 font-display text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:mt-6 sm:text-6xl xl:text-7xl"
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
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:mt-6 sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div variants={item} className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
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
          </motion.div>

          <motion.a
            variants={item}
            href="#pictures"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-ink underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary-strong"
          >
            <Camera className="h-4 w-4 shrink-0 text-primary-strong" />
            {t("ctaPictures")}
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
          className="relative z-10 lg:self-stretch"
        >
          <div className="absolute inset-0">
            <BusModel />
          </div>
        </motion.div>
      </div>
    </section>
  );
}