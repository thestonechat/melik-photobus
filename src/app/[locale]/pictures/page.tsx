import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PicturesFinder } from "@/components/pictures/PicturesFinder";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "pictures",
  });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PicturesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("pictures");

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-paper pb-24 pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.045)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
          <span className="inline-block -rotate-2 rounded-full border-2 border-ink bg-primary px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-ink shadow-[3px_3px_0_0_var(--color-ink)]">
            {t("eyebrow")}
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.98] tracking-tight text-ink sm:text-6xl">
            {t("title1")}
            <br />
            <span className="text-primary-strong">{t("title2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            {t("description")}
          </p>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl px-5 sm:px-8">
          <PicturesFinder />
        </div>
      </main>
      <Footer />
    </>
  );
}