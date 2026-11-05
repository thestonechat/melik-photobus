"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CornerDownRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const prints = [
  "asaf.jpg",
  "images.jpg",
  "The-Hangover-2-Quotes.jpg",
  "495a0df2-c368-493f-9821-93c49ff35b79_490x371.jpg",
  "2011hangover2006_a_l.webp",
  "images-1.jpg",
].map((file) => `/photos/placeholder images/${file}`);

export function Gallery() {
  const t = useTranslations("gallery");

  return (
    <section
      id="gallery"
      className="relative scroll-mt-20 border-y-2 border-ink bg-primary-faint py-12 sm:py-14"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}{" "}
              {t("title2") && (
                <>
                  {t("title2")}{" "}
                </>
              )}
              <span className="text-primary-strong">{t("accent")}</span>
            </>
          }
          description={t("description")}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="-mx-5 mt-2 flex snap-x snap-mandatory overflow-x-auto px-5 py-8 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:justify-center lg:overflow-visible lg:px-0 lg:[--overlap:6rem]"
        >
          {/* Slots never move, so hover can't flicker: they set the vars, the card transforms. */}
          {prints.map((src) => (
            <div
              key={src}
              className="peer w-56 shrink-0 snap-center lg:not-first:-ml-(--overlap) hover:[--lift:-1rem] hover:[--skew:-2deg] hover:[--turn:1] peer-hover:[--slide:var(--overlap)] lg:w-48"
            >
              <div className="pointer-events-none h-full border-2 border-ink bg-white p-2.5 pb-3 shadow-[4px_4px_0_0_var(--color-ink)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform:translate(var(--slide,0),var(--lift,0))_scaleX(var(--turn,0.88))_skewY(var(--skew,-8deg))] motion-reduce:transition-none">
                <div className="relative aspect-square overflow-hidden bg-primary-faint">
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2.5 text-center font-display text-xs font-bold leading-snug text-ink">
                  {t("placeholderTitle")}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-center text-sm font-semibold text-ink-muted"
        >
          <CornerDownRight className="h-4 w-4 shrink-0 text-primary-strong" />
          {t("footerNote")}
        </motion.p>
      </div>
    </section>
  );
}