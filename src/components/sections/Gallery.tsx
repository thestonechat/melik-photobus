"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Camera, CornerDownRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const slots = [1, 2, 3, 4, 5, 6];

export function Gallery() {
  const t = useTranslations("gallery");

  return (
    <section
      id="gallery"
      className="relative scroll-mt-20 border-y-2 border-ink bg-primary-faint py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}
              <br />
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

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, i) => (
            <motion.div
              key={slot}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="group flex aspect-[4/3] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-ink/25 bg-white/40 p-6 text-center transition-colors hover:border-ink/60"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink/25 bg-white text-ink/40 transition-all group-hover:-rotate-6 group-hover:border-ink group-hover:bg-primary group-hover:text-ink">
                <Camera className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink">
                  {t("placeholderTitle")}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {t("placeholderText")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-2 text-sm font-semibold text-ink-muted"
        >
          <CornerDownRight className="h-4 w-4 text-primary-strong" />
          {t("footerNote")}
        </motion.p>
      </div>
    </section>
  );
}