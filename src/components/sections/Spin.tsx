"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Footprints, Send, Share2, Video } from "lucide-react";
import { SpinBadge } from "@/components/spin/SpinBadge";
import { SpinPhone } from "@/components/spin/SpinPhone";
import { LazyScene } from "@/components/three/LazyScene";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SpinModel = dynamic(() => import("@/components/three/SpinModel"), { ssr: false });

const steps = [
  { key: "stand", icon: Footprints },
  { key: "spin", icon: Video },
  { key: "share", icon: Share2 },
] as const;

export function Spin() {
  const t = useTranslations("spin");
  const stage = useRef<HTMLDivElement>(null);

  return (
    <section id="spin" className="relative scroll-mt-20 overflow-hidden bg-ink py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(250,204,21,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading
              tone="dark"
              align="left"
              eyebrow={t("eyebrow")}
              title={
                <>
                  {t("title1")}
                  <br />
                  <span className="text-primary">{t("title2")}</span>
                </>
              }
              description={t("description")}
            />
            <Button href="#book-spin" size="lg" className="mt-8 border-paper">
              <Send className="h-5 w-5" />
              {t("cta")}
            </Button>
            <p className="mt-4 text-sm text-paper/60">{t("priceHint")}</p>
          </div>

          <div ref={stage} className="relative min-w-0 pb-6 lg:pb-10 lg:pr-10">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border-2 border-paper bg-primary shadow-[8px_8px_0_0_var(--color-primary-strong)]">
              <LazyScene>
                <SpinModel stageRef={stage} />
              </LazyScene>
              <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
                <SpinBadge text={t("badge")} />
              </div>
            </div>
            <div className="absolute bottom-0 right-1 z-10 lg:right-0">
              <SpinPhone label={t("phoneRec")} speed={t("phoneSpeed")} />
            </div>
          </div>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-3">
          {steps.map(({ key, icon: Icon }, i) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="rounded-2xl border-2 border-paper bg-paper p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink bg-primary shadow-[2px_2px_0_0_var(--color-ink)]">
                <Icon className="h-5 w-5 text-ink" />
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-ink">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {t(`steps.${key}.text`)}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
