import type { Metadata } from "next";
import { connection } from "next/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Camera } from "lucide-react";
import { PhotoGrid } from "@/components/pictures/PhotoGrid";
import type { Locale } from "@/i18n/routing";
import { getPhotos, normalizeCode } from "@/lib/photos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function GuestPhotosPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale as Locale);
  await connection();

  const t = await getTranslations("pictures");
  const photos = await getPhotos(normalizeCode(code));

  return (
    <main className="mx-auto min-h-svh max-w-3xl px-5 py-6 sm:px-8">
      <a href={`/${locale}`} className="inline-flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-[2px_2px_0_0_var(--color-primary)]">
          <Camera className="h-4.5 w-4.5 text-primary" />
        </span>
        <span className="font-display text-xl font-bold tracking-tight text-ink">
          Photo<span className="text-primary-strong">graph</span>
        </span>
      </a>

      {photos?.length ? (
        <>
          <h1 className="mt-8 font-display text-3xl font-bold text-ink">
            {t("guestTitle")}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{t("guestHint")}</p>
          <PhotoGrid photos={photos} />
        </>
      ) : (
        <div
          className={cn(
            "mt-8 rounded-2xl border-2 border-ink p-6 text-center shadow-[4px_4px_0_0_var(--color-ink)]",
            photos ? "bg-primary" : "bg-white",
          )}
        >
          <p className="font-display text-lg font-bold text-ink">
            {photos ? t("notFound") : t("error")}
          </p>
          {photos && (
            <p className="mt-2 text-sm text-ink/70">{t("guestNotFoundHint")}</p>
          )}
        </div>
      )}
    </main>
  );
}
