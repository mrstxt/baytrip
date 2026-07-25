import { useMemo, useState } from "react";
import { Clock, Compass, MapPin, Sparkles, Star } from "lucide-react";
import { DOMESTIC_CATEGORIES, DOMESTIC_TOURS, formatPrice, type DomesticTour } from "../data";
import { cn } from "../utils/cn";
import { BrandPattern } from "./Brand";
import Reveal from "./Reveal";
import TourModal from "./TourModal";

const isFeatured = (t: DomesticTour) => !!t.tag || !!t.oldPrice;

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.5a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" />
  </svg>
);

export default function DomesticTours() {
  const [category, setCategory] = useState<(typeof DOMESTIC_CATEGORIES)[number]["id"]>("all");
  const [selected, setSelected] = useState<DomesticTour | null>(null);

  const filtered = useMemo(
    () => (category === "all" ? DOMESTIC_TOURS : DOMESTIC_TOURS.filter((t) => t.category === category)),
    [category]
  );

  return (
    <section id="ichki-turizm" className="relative scroll-mt-24 overflow-hidden bg-surface py-20 sm:py-28">
      <BrandPattern className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 text-emerald-200/40" />
      <BrandPattern className="pointer-events-none absolute -left-28 bottom-0 h-80 w-80 rotate-180 text-brand-200/40" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">
              <Compass className="h-3.5 w-3.5" />
              Ichki turizm
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
              O'zbekiston va Markaziy Osiyoni kashf eting
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              Registondan Issiqko'lgacha — vatanimiz va qo'shni davlatlar bo'ylab
              qulay narxlarda tashkil qilingan tur paketlari.
            </p>
            <a
              href="https://instagram.com/baytrip.uz"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 hover:underline"
            >
              <InstagramIcon className="h-4 w-4" />
              @baytrip.uz — ichki turizm yangiliklari
            </a>
          </div>

          {/* segment-kontrol filtri */}
          <div className="flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
            {DOMESTIC_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-all active:scale-95",
                  category === c.id
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/30"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <Reveal key={t.id} delay={i * 60}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.07] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_64px_-24px_rgba(6,95,70,0.25)]">
                {isFeatured(t) && (
                  <span className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-emerald-500 to-brand-500" />
                )}

                <button onClick={() => setSelected(t)} className="relative block h-56 overflow-hidden text-left">
                  <img
                    src={t.image}
                    alt={t.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-2">
                    {t.tag && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-lg shadow-emerald-900/30">
                        <Sparkles className="h-3.5 w-3.5" />
                        {t.tag}
                      </span>
                    )}
                    {t.oldPrice && (
                      <span className="rounded-full bg-sun px-2.5 py-1 text-[11px] font-extrabold text-ink shadow-lg shadow-black/20">
                        −{Math.round((1 - t.price / t.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-3 left-3.5 inline-flex max-w-[calc(100%-1.75rem)] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-ink shadow-lg shadow-black/20 backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="truncate">
                      {t.flag} {t.city}, {t.country}
                    </span>
                  </span>
                </button>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 font-display text-lg font-extrabold leading-snug tracking-tight text-ink">
                    {t.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-black/[0.04]">
                      <Clock className="h-3 w-3 text-emerald-600" /> {t.days} kun / {t.nights} tun
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-black/[0.04]">
                      <Star className="h-3 w-3 fill-sun text-sun" /> {t.rating}
                      <span className="font-semibold text-slate-400">({t.reviews})</span>
                    </span>
                    <span className="rounded-full bg-surface px-2.5 py-1 ring-1 ring-black/[0.04]">
                      {t.nextDates[0]}
                    </span>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between gap-3 border-t border-black/[0.06] pt-4">
                      <div>
                        {t.oldPrice && (
                          <p className="text-xs font-semibold text-slate-400 line-through">
                            {formatPrice(t.oldPrice, t.currency)}
                          </p>
                        )}
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">dan boshlab</p>
                        <p className="font-display text-[22px] font-extrabold leading-none tracking-tight text-emerald-700 sm:text-[24px]">
                          {formatPrice(t.price, t.currency)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelected(t)}
                        className="rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-emerald-600/30 transition-all hover:shadow-lg hover:shadow-emerald-600/40 hover:brightness-110 active:scale-95"
                      >
                        Batafsil
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {selected && <TourModal tour={selected} requestType="domestic-tour" onClose={() => setSelected(null)} />}
    </section>
  );
}
