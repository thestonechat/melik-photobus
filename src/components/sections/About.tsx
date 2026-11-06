"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  Building2,
  Heart,
  HeartHandshake,
  MapPin,
  Music,
  PartyPopper,
  Printer,
  Sparkles,
  Zap,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type CardKey = "weddings" | "birthdays" | "corporate" | "festivals";

const cards: Record<
  CardKey,
  {
    icon: typeof HeartHandshake;
    shell: string;
    iconShell: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  weddings: {
    icon: HeartHandshake,
    shell: "bg-gradient-to-br from-pink-100 via-rose-50 to-white",
    iconShell: "bg-pink-500",
    iconColor: "text-white",
    titleColor: "text-pink-700",
  },
  birthdays: {
    icon: PartyPopper,
    shell: "bg-gradient-to-br from-amber-100 via-yellow-50 to-white",
    iconShell: "bg-amber-400",
    iconColor: "text-ink",
    titleColor: "text-amber-700",
  },
  corporate: {
    icon: Building2,
    shell: "bg-gradient-to-br from-sky-100 via-blue-50 to-white",
    iconShell: "bg-sky-500",
    iconColor: "text-white",
    titleColor: "text-sky-700",
  },
  festivals: {
    icon: Music,
    shell: "bg-gradient-to-br from-fuchsia-100 via-purple-50 to-emerald-100",
    iconShell: "bg-fuchsia-500",
    iconColor: "text-white",
    titleColor: "text-fuchsia-700",
  },
};

const decor: Record<CardKey, React.ReactNode> = {
  weddings: (
    <>
      <Heart
        className="absolute -right-3 -top-3 h-16 w-16 rotate-12 text-pink-300/70"
        fill="currentColor"
      />
      <Heart
        className="absolute bottom-6 right-8 h-6 w-6 -rotate-45 text-pink-200"
        fill="currentColor"
      />
    </>
  ),
  birthdays: (
    <>
      <Sparkles className="absolute -right-3 -top-4 h-14 w-14 -rotate-12 text-amber-300/90" />
      <Sparkles
        className="absolute right-10 top-24 h-6 w-6 rotate-12 text-amber-500/70"
        strokeWidth={3}
      />
    </>
  ),
  corporate: (
    <>
      <Building2
        className="absolute -bottom-4 -right-4 h-20 w-20 text-sky-200/80"
        strokeWidth={1.5}
      />
      <span className="absolute right-9 top-10 h-2 w-2 rounded-full bg-sky-300" />
    </>
  ),
  festivals: (
    <>
      <span className="absolute -right-2 top-12 h-3 w-3 rotate-12 rounded-full bg-fuchsia-400" />
      <span className="absolute -top-2 right-20 h-2.5 w-2.5 rounded-full bg-emerald-400" />
      <span className="absolute -right-5 bottom-10 h-4 w-4 rotate-45 rounded-[4px] bg-orange-400" />
      <span className="absolute right-24 top-40 h-2 w-2 rounded-full bg-sky-400" />
    </>
  ),
};

const statKeys: Array<{
  key: "map" | "studio" | "keepsakes";
  icon: typeof MapPin;
}> = [
  { key: "map", icon: MapPin },
  { key: "studio", icon: Zap },
  { key: "keepsakes", icon: Printer },
];

export function About() {
  const t = useTranslations("about");

  return (
    <section
      id="about"
      className="relative scroll-mt-20 overflow-hidden border-y-2 border-ink bg-primary-faint pb-24 pt-10 sm:pb-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-display text-[18vw] font-bold leading-none tracking-tight text-outline opacity-[0.06]"
      >
        SMILE
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          reveal={false}
          eyebrow={t("eyebrow")}
          title={
            <>
              {t("title1")}
              <br />
              {t("title2")}{" "}
              <span className="text-primary-strong">{t("accent")}</span>
            </>
          }
          description={t("description")}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(cards) as CardKey[]).map((key, i) => {
            const card = cards[key];
            const Icon = card.icon;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: "easeOut" }}
                whileHover={{ y: -6, rotate: -0.5 }}
                className="h-full"
              >
                <div
                  className={cn(
                    "relative h-full overflow-hidden rounded-3xl border-2 border-ink p-8 shadow-[4px_4px_0_0_var(--color-ink)]",
                    card.shell,
                  )}
                >
                  <div className="pointer-events-none absolute inset-0">
                    {decor[key]}
                  </div>
                  <span
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink shadow-[3px_3px_0_0_var(--color-ink)]",
                      card.iconShell,
                    )}
                  >
                    <Icon className={cn("h-6 w-6", card.iconColor)} />
                  </span>
                  <h3
                    className={cn(
                      "relative mt-5 font-display text-xl font-bold",
                      card.titleColor,
                    )}
                  >
                    {t(`${key}.title`)}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">
                    {t(`${key}.text`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-14 grid gap-6 rounded-[2rem] border-2 border-ink bg-ink p-8 shadow-[8px_8px_0_0_var(--color-primary)] sm:grid-cols-3 sm:p-10"
        >
          {statKeys.map((stat) => (
            <div key={stat.key} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-primary">
                <stat.icon className="h-5 w-5 text-ink" />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-paper">
                  {t(`stats.${stat.key}.value`)}
                </p>
                <p className="mt-0.5 text-sm text-white/60">
                  {t(`stats.${stat.key}.label`)}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}