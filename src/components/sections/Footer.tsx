import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Camera, Mail, MapPin, Phone } from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const explore = [
  { key: "about", href: "#about" },
  { key: "gallery", href: "#gallery" },
  { key: "pictures", href: "/pictures", page: true },
  { key: "book", href: "#book" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="relative overflow-hidden border-t-2 border-ink bg-ink text-paper">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-paper bg-primary shadow-[2px_2px_0_0_var(--color-ink)]">
              <Camera className="h-4.5 w-4.5 text-ink" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-paper">
              Photo<span className="text-primary">Bus</span>
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {t("blurb")}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            {t("exploreTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {explore.map((item) => (
              <li key={item.href}>
                {"page" in item ? (
                  <Link
                    href={item.href}
                    className="text-sm font-semibold text-white/80 transition-colors hover:text-primary"
                  >
                    {t(item.key)}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="text-sm font-semibold text-white/80 transition-colors hover:text-primary"
                  >
                    {t(item.key)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            {t("contact")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-white/80">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-primary" />
              <a
                href="mailto:hello@photobus.ge"
                className="transition-colors hover:text-primary"
              >
                hello@photobus.ge
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-primary" />
              <a
                href="tel:+995000000000"
                className="transition-colors hover:text-primary"
              >
                +995 000 00 00 00
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-primary" />
              {t("location")}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            {t("follow")}
          </h3>
          <p className="mt-4 text-sm text-white/60">{t("followText")}</p>
          <div className="mt-4 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-paper/20 text-white/80 transition-all hover:border-primary hover:bg-primary hover:text-ink"
            >
              <InstagramIcon className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-paper/20 text-white/80 transition-all hover:border-primary hover:bg-primary hover:text-ink"
            >
              <FacebookIcon className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-white/50 sm:flex-row sm:px-8">
          <span>{t("rights", { year: new Date().getFullYear() })}</span>
          <span>{t("madeWith")}</span>
        </div>
      </div>
    </footer>
  );
}