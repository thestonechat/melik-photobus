import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

// Browsers ignore `download` on cross-origin links, so photos hosted on Blob
// ask its CDN for an attachment response instead (see the SDK's getDownloadUrl).
function downloadHref(src: string) {
  return src.startsWith("/") ? src : `${src}&download=1`;
}

export function PhotoGrid({ photos }: { photos: string[] }) {
  const t = useTranslations("pictures");

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      {photos.map((src, i) => (
        <div
          key={src}
          className="overflow-hidden rounded-2xl border-2 border-ink bg-primary-faint shadow-[4px_4px_0_0_var(--color-ink)]"
        >
          <div className="aspect-[4/3] overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={t("photoAlt", { n: i + 1 })}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-between gap-2 p-3">
            <span className="truncate text-xs font-bold text-ink-muted">
              {t("photoAlt", { n: i + 1 })}
            </span>
            <a
              href={downloadHref(src)}
              download
              className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-primary px-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-primary-strong"
            >
              <Download className="h-3.5 w-3.5" />
              {t("download")}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
