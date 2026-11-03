"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker } from "@daypicker/react";
import "@daypicker/react/style.css";
import {
  CalendarDays,
  Check,
  Mail,
  MapPin,
  PartyPopper,
  Send,
  User,
} from "lucide-react";
import { enUS, ka } from "date-fns/locale";
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";
import type { Locale } from "date-fns";
import type { DateRange } from "react-day-picker";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SparkleButton } from "@/components/ui/SparkleButton";
import { cn } from "@/lib/utils";

interface BookingForm {
  name: string;
  email: string;
  address: string;
  eventType: string;
}

const initialForm: BookingForm = {
  name: "",
  email: "",
  address: "",
  eventType: "",
};

type FieldErrors = Partial<Record<keyof BookingForm | "date", string>>;

const inputStyles =
  "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-ink placeholder:text-ink-faint transition-colors focus:border-primary-strong focus:bg-primary-faint focus:outline-none";

const today = new Date();

function formatRange(
  range: DateRange | undefined,
  dfLocale: Locale,
  full = false,
): string | null {
  if (!range?.from) return null;
  const from = range.from;
  const to =
    range.to && !isSameDay(range.from, range.to) ? range.to : null;

  if (!to) {
    return full
      ? format(from, "EEEE, d MMMM yyyy", { locale: dfLocale })
      : format(from, "d MMM yyyy", { locale: dfLocale });
  }

  if (isSameMonth(from, to)) {
    const right = full ? "d MMMM yyyy" : "d MMM yyyy";
    return `${format(from, "d", { locale: dfLocale })} – ${format(to, right, { locale: dfLocale })}`;
  }
  if (isSameYear(from, to)) {
    const left = full ? "d MMMM" : "d MMM";
    return `${format(from, left, { locale: dfLocale })} – ${format(to, `${left} yyyy`, { locale: dfLocale })}`;
  }
  return `${format(from, "d MMM yyyy", { locale: dfLocale })} – ${format(to, "d MMM yyyy", { locale: dfLocale })}`;
}

export function Booking() {
  const t = useTranslations("booking");
  const locale = useLocale();
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dpLocale = useMemo(() => (locale === "ka" ? ka : enUS), [locale]);
  const summaryDate = range ? formatRange(range, dpLocale, true) : null;
  const shortDate = range ? formatRange(range, dpLocale, false) : null;

  const setField = (field: keyof BookingForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSelect = (next: DateRange | undefined) => {
    setRange(next);
    setErrors((e) => ({ ...e, date: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!range?.from) {
      setErrors((prev) => ({ ...prev, date: t("errors.date") }));
      return;
    }
    const nextErrors: FieldErrors = {};
    if (!form.name.trim()) nextErrors.name = t("errors.name");
    if (!form.email.trim()) {
      nextErrors.email = t("errors.email");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = t("errors.emailInvalid");
    }
    if (!form.address.trim()) nextErrors.address = t("errors.address");
    if (!form.eventType.trim()) nextErrors.eventType = t("errors.eventType");

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 450);
  };

  const reset = () => {
    setForm(initialForm);
    setRange(undefined);
    setErrors({});
    setSubmitted(false);
    setSubmitting(false);
  };

  return (
    <section
      id="book"
      className="relative scroll-mt-20 overflow-hidden bg-paper py-24 sm:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
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

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-5">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lg:col-span-5"
              >
                <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-ink bg-primary p-10 text-center shadow-[8px_8px_0_0_var(--color-ink)]">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-ink bg-white shadow-[3px_3px_0_0_var(--color-ink)]">
                    <Check className="h-8 w-8 text-ink" />
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-bold text-ink">
                    {t("success.title")}
                  </h3>
                  <p className="mt-3 text-ink/70">
                    {t("success.thanks", { name: form.name.trim() })}
                  </p>
                  <ul className="mx-auto mt-6 max-w-sm space-y-2 rounded-2xl border-2 border-ink bg-white/70 p-5 text-left text-sm font-semibold text-ink backdrop-blur-sm">
                    <li className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                      {summaryDate ?? t("success.dateFallback")}
                    </li>
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      {form.address.trim()}
                    </li>
                    <li className="flex items-start gap-3">
                      <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" />
                      {form.eventType.trim()}
                    </li>
                  </ul>
                  <p className="mt-5 text-sm font-medium text-ink/70">
                    {t("success.confirm", { email: form.email.trim() })}
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-7 rounded-full border-2 border-ink bg-white px-6 py-2.5 text-sm font-bold text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-primary"
                  >
                    {t("success.another")}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="booking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:col-span-2"
              >
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  className="rounded-[2rem] border-2 border-ink bg-primary-faint p-7 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-9"
                >
                  <h3 className="font-display text-xl font-bold text-ink">
                    {t("detailsTitle")}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {t("requiredHint")}
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink"
                      >
                        <User className="h-4 w-4 text-primary-strong" />
                        {t("name")} *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder={t("namePlaceholder")}
                        className={inputStyles}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs font-bold text-ink">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink"
                      >
                        <Mail className="h-4 w-4 text-primary-strong" />
                        {t("email")} *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        className={inputStyles}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs font-bold text-ink">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink"
                      >
                        <MapPin className="h-4 w-4 text-primary-strong" />
                        {t("address")} *
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={form.address}
                        onChange={(e) => setField("address", e.target.value)}
                        placeholder={t("addressPlaceholder")}
                        className={inputStyles}
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs font-bold text-ink">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="eventType"
                        className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-ink"
                      >
                        <PartyPopper className="h-4 w-4 text-primary-strong" />
                        {t("eventType")} *
                      </label>
                      <input
                        id="eventType"
                        type="text"
                        value={form.eventType}
                        onChange={(e) => setField("eventType", e.target.value)}
                        placeholder={t("eventPlaceholder")}
                        className={inputStyles}
                      />
                      {errors.eventType && (
                        <p className="mt-1 text-xs font-bold text-ink">
                          {errors.eventType}
                        </p>
                      )}
                    </div>
                  </div>

                  <SparkleButton
                    type="submit"
                    disabled={submitting}
                    className="mt-7 flex w-full px-6 py-3.5"
                  >
                    <Send className="h-4 w-4" />
                    {range?.from ? t("submitRange") : t("submitSingle")}
                  </SparkleButton>

                  <p className="mt-4 text-center text-xs text-ink-muted">
                    {t("noPayment")}
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {!submitted && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-3"
            >
              <div className="rounded-[2rem] border-2 border-ink bg-white p-7 shadow-[6px_6px_0_0_var(--color-ink)] sm:p-9">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-xl font-bold text-ink">
                    {t("calendarTitle")}
                  </h3>
                  <span className="flex items-center gap-2 rounded-full border-2 border-ink bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {shortDate ?? t("pickDays")}
                  </span>
                </div>

                <div className="mt-5 flex justify-center">
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleSelect}
                    disabled={{ before: today }}
                    locale={dpLocale}
                    labels={{
                      labelPrevious: () => t("prevMonth"),
                      labelNext: () => t("nextMonth"),
                    }}
                    animate
                    defaultMonth={today}
                    modifiersClassNames={{
                      today: "today",
                    }}
                  />
                </div>

                <AnimatePresence>
                  {errors.date && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden text-center text-xs font-bold text-ink"
                    >
                      {errors.date}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {range?.from && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className={cn(
                        "mt-5 rounded-2xl border-2 border-dashed border-ink/30 bg-primary-faint p-4 text-center text-sm font-semibold text-ink",
                      )}
                    >
                      {t("viewingPrefix")}{" "}
                      <strong className="text-primary-strong">
                        {summaryDate}
                      </strong>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}