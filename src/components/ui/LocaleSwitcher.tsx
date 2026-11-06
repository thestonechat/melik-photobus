"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const shortLabels: Record<(typeof routing.locales)[number], string> = {
  en: "EN",
  ka: "ქა",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("localeSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(nextLocale: (typeof routing.locales)[number]) {
    startTransition(() => {
      router.replace(`${pathname}${window.location.hash}`, {
        locale: nextLocale,
        scroll: false,
      });
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-0.5 rounded-full border-2 border-ink bg-white p-0.5"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={isPending}
          onClick={() => onSelectChange(loc)}
          aria-label={
            loc === "en" ? t("switchToEn") : t("switchToKa")
          }
          aria-pressed={loc === locale}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold uppercase transition-colors",
            loc === locale
              ? "bg-primary text-ink"
              : "text-ink-muted hover:bg-primary-soft hover:text-ink",
          )}
        >
          {shortLabels[loc]}
        </button>
      ))}
    </div>
  );
}