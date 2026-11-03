import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { Geist, Space_Grotesk } from "next/font/google";
import "../globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://photobus.ge"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://photobus.ge",
      siteName: "PhotoBus",
      locale: locale === "ka" ? "ka_GE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geist.variable} ${spaceGrotesk.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-cream font-sans text-ink antialiased">
        <NextIntlClientProvider locale={locale as Locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}