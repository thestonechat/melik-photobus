import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Booking } from "@/components/sections/Booking";
import { Footer } from "@/components/sections/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Booking />
      </main>
      <Footer />
    </>
  );
}