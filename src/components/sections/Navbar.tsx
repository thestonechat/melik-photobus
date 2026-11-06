"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { cn } from "@/lib/utils";

const links = [
  { key: "about", href: "#about" },
  { key: "pictures", href: "#pictures" },
  { key: "gallery", href: "#gallery" },
  { key: "spin", href: "#spin" },
  { key: "book", href: "#book" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b-2 border-ink bg-white/80 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-ink shadow-[2px_2px_0_0_var(--color-primary)] transition-transform group-hover:-rotate-6">
            <BrandMark fg="var(--color-primary)" bg="var(--color-ink)" className="h-7 w-7" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Photo<span className="text-primary-strong">graph</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-primary hover:text-ink"
            >
              {t(link.key)}
            </a>
          ))}
          <LocaleSwitcher />
          <Button href="#book" size="sm" className="ml-3">
            {t("cta")}
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white text-ink md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b-2 border-ink bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-5 pt-2">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-ink transition-colors hover:bg-primary"
                >
                  {t(link.key)}
                </a>
              ))}
              <div className="mt-2 flex items-center justify-between gap-3">
                <LocaleSwitcher />
                <Button
                  href="#book"
                  size="sm"
                  className="flex-none"
                  onClick={() => setOpen(false)}
                >
                  {t("cta")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}