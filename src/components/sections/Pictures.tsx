"use client";

import { useTranslations } from "next-intl";
import { PicturesFinder } from "@/components/pictures/PicturesFinder";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Pictures() {
  const t = useTranslations("pictures");

  return (
    <section
      id="pictures"
      className="relative scroll-mt-20 border-y-2 border-ink bg-primary-faint pb-16 pt-10 sm:pb-20"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 sm:px-8 lg:grid-cols-[2fr_3fr] lg:gap-12">
        <SectionHeading
          align="left"
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}
              <br />
              <span className="text-primary-strong">{t("title2")}</span>
            </>
          }
          description={t("description")}
        />
        <PicturesFinder />
      </div>
    </section>
  );
}
