"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Download, KeyRound, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "found" | "not-found" | "error";

export function PicturesFinder() {
  const t = useTranslations("pictures");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [photos, setPhotos] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    setStatus("loading");
    try {
      const res = await fetch(`/api/photos/${encodeURIComponent(normalized)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos ?? []);
        setStatus(data.photos?.length ? "found" : "not-found");
      } else {
        setStatus("not-found");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-[2rem] border-2 border-ink bg-white p-6 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-9">
      <label htmlFor="picture-code">
        <span className="flex items-center gap-2 text-sm font-bold text-ink">
          <KeyRound className="h-4 w-4 text-primary-strong" />
          {t("codeLabel")}
        </span>
      </label>

      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-col gap-3 sm:flex-row"
      >
        <input
          id="picture-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("codePlaceholder")}
          autoComplete="off"
          spellCheck={false}
          className="w-full flex-1 rounded-xl border-2 border-ink bg-white px-4 py-3 font-mono text-lg font-bold uppercase tracking-widest text-ink placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-faint focus:border-primary-strong focus:bg-primary-faint focus:outline-none"
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="flex h-12 items-center justify-center gap-2 px-6"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {t("submit")}
        </Button>
      </form>

      <div className="mt-6 min-h-[120px]">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 bg-primary-faint p-8 text-center"
            >
              <Camera className="h-8 w-8 text-primary-strong" />
              <p className="text-sm font-semibold text-ink-muted">
                {t("idleHint")}
              </p>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 p-8 text-sm font-semibold text-ink-muted"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary-strong" />
              {t("loading")}
            </motion.div>
          )}

          {status === "found" && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="font-display text-lg font-bold text-ink">
                {t("foundTitle", { count: photos.length })}
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {photos.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.4, ease: "easeOut" }}
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
                        href={src}
                        download
                        className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-primary px-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-primary-strong"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("download")}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {status === "not-found" && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border-2 border-ink bg-primary p-6 text-center shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              <p className="font-display text-lg font-bold text-ink">
                {t("notFound")}
              </p>
              <p className="mt-2 text-sm text-ink/70">{t("notFoundHint")}</p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border-2 border-ink bg-white p-6 text-center shadow-[4px_4px_0_0_var(--color-ink)]"
            >
              <p className="font-display text-lg font-bold text-ink">
                {t("error")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}