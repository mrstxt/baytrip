import { useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  MapPin,
  Star,
} from "lucide-react";
import { CATEGORIES, TOURS, formatPrice, type Tour } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import Reveal from "./Reveal";
import TourModal from "./TourModal";
import { BrandPattern } from "./Brand";

const isHot = (t: Tour) => !!t.oldPrice || t.seatsLeft <= 5 || !!t.tag;

function HotPill({ seats }: { seats?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-hot to-tangerine px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white shadow-lg shadow-hot/40">
      <Flame className="h-3.5 w-3.5 fill-sun text-sun animate-hot" />
      Qaynoq
      {seats !== undefined && seats <= 6 && <span className="opacity-90">· {seats} joy</span>}
    </span>
  );
}

export default function Tours() {
  const { category, setCategory } = useApp();
  const [selected, setSelected] = useState<Tour | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const hot = useMemo(() => TOURS.filter(isHot).sort((a, b) => b.reviews - a.reviews), []);
  const filtered = useMemo(
    () => (category === "all" ? TOURS : TOURS.filter((t) => t.category === category)),
    [category]
  );

  const scrollBy = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 380, behavior: "smooth" });

  return (
    <section id="turlar" className="relative scroll-mt-24 overflow-hidden bg-white pb-24 pt-16 sm:pb-28">
      {/* brend naqshi */}
      <BrandPattern className="pointer-events-none absolute -left-24 top-24 h-72 w-72 text-brand-100/70" />
      <BrandPattern className="pointer-events-none absolute -right-28 bottom-40 h-80 w-80 rotate-180 text-sun/20" />

      {/* ---- QAYNOQ TAKLIFLAR ---- */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-hot">
              <Flame className="h-4 w-4 fill-sun text-sun" />
              Qaynoq takliflar
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
              Shu hafta eng ko'p olinayotgan turlar
            </h2>
          </div>
          <div className="hidden gap-1.5 sm:flex">
            <button
              aria-label="Orqaga"
              onClick={() => scrollBy(-1)}
              className="grid h-11 w-11 place-items-center rounded-full bg-surface text-ink transition-all hover:bg-gradient-to-br hover:from-brand-500 hover:to-brand-700 hover:text-white hover:shadow-lg hover:shadow-brand-600/30 active:scale-90"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Oldinga"
              onClick={() => scrollBy(1)}
              className="grid h-11 w-11 place-items-center rounded-full bg-surface text-ink transition-all hover:bg-gradient-to-br hover:from-brand-500 hover:to-brand-700 hover:text-white hover:shadow-lg hover:shadow-brand-600/30 active:scale-90"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 lg:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
      >
        {hot.map((t, i) => (
          <Reveal key={t.id} delay={i * 70} className="w-[300px] shrink-0 snap-start sm:w-[350px]">
            <button
              onClick={() => setSelected(t)}
              className="group relative block h-[460px] w-full overflow-hidden rounded-[30px] text-left shadow-xl shadow-brand-950/15 ring-1 ring-black/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-950/30"
            >
              <img
                src={t.image}
                alt={t.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
              />
              {/* qatlamlar */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/30 to-brand-950/5" />
              <div className="absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/10" />
              {/* hover yaltirashi */}
              <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              {/* yuqori badge'lar */}
              <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <HotPill seats={t.seatsLeft} />
                  {t.oldPrice && (
                    <span className="rounded-full bg-sun px-3 py-1.5 text-[11px] font-extrabold text-ink shadow-lg shadow-black/20">
                      −{Math.round((1 - t.price / t.oldPrice) * 100)}%
                    </span>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-extrabold text-white ring-1 ring-white/25 backdrop-blur-md">
                  <Star className="h-3.5 w-3.5 fill-sun text-sun" />
                  {t.rating}
                </span>
              </div>

              {/* pastki kontent */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-sun">
                  <MapPin className="h-4 w-4" />
                  {t.flag} {t.city}, {t.country}
                </p>
                <h3 className="mt-1.5 line-clamp-2 font-display text-[22px] font-extrabold leading-tight tracking-tight text-white">
                  {t.title}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                    {t.days} kun / {t.nights} tun
                  </span>
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                    {t.nextDates[0]}
                  </span>
                  <span className="rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-bold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                    {t.seatsLeft} joy qoldi
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
                  <div>
                    {t.oldPrice && (
                      <p className="text-xs font-semibold text-white/50 line-through">{formatPrice(t.oldPrice)}</p>
                    )}
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60">dan boshlab</p>
                    <p className="font-display text-[30px] font-extrabold leading-none tracking-tight text-sun">
                      {formatPrice(t.price)}
                    </p>
                  </div>
                  <span className="rounded-full bg-sun px-4 py-2.5 text-xs font-extrabold text-ink shadow-lg shadow-black/25 transition-all group-hover:bg-amber-300">
                    Batafsil →
                  </span>
                </div>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* ---- BARCHA TURLAR ---- */}
      <div className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">
              Barcha yo'nalishlar
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
              Qayerga boramiz?
            </h2>
          </div>
          {/* Apple segment-kontrol uslubidagi filtr */}
          <div className="flex flex-wrap gap-1 rounded-full bg-surface p-1 ring-1 ring-black/5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] font-bold transition-all active:scale-95",
                  category === c.id
                    ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30"
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
              <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-black/[0.07] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_64px_-24px_rgba(14,36,82,0.3)]">
                {/* qaynoq turlar uchun yuqori aksent chizig'i */}
                {isHot(t) && (
                  <span className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-hot to-tangerine" />
                )}

                <button onClick={() => setSelected(t)} className="relative block h-56 overflow-hidden text-left">
                  <img
                    src={t.image}
                    alt={t.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-transparent to-transparent" />
                  {/* hover yaltirashi */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-2">
                    {isHot(t) && <HotPill />}
                    {t.oldPrice && (
                      <span className="rounded-full bg-sun px-2.5 py-1 text-[11px] font-extrabold text-ink shadow-lg shadow-black/20">
                        −{Math.round((1 - t.price / t.oldPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* manzil — rasm ustida, yaqqol ko'rinadi */}
                  <span className="absolute bottom-3 left-3.5 inline-flex max-w-[calc(100%-1.75rem)] items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-extrabold text-ink shadow-lg shadow-black/20 backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-600" />
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
                      <Clock className="h-3 w-3 text-brand-500" /> {t.days} kun / {t.nights} tun
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 ring-1 ring-black/[0.04]">
                      <Star className="h-3 w-3 fill-sun text-sun" /> {t.rating}
                      <span className="font-semibold text-slate-400">({t.reviews})</span>
                    </span>
                    <span className="rounded-full bg-surface px-2.5 py-1 ring-1 ring-black/[0.04]">
                      {t.nextDates[0]}
                    </span>
                  </div>

                  {/* narx — yirik va aniq */}
                  <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between gap-3 border-t border-black/[0.06] pt-4">
                      <div>
                        {t.oldPrice && (
                          <p className="text-xs font-semibold text-slate-400 line-through">{formatPrice(t.oldPrice)}</p>
                        )}
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-soft">dan boshlab</p>
                        <p className="font-display text-[26px] font-extrabold leading-none tracking-tight text-brand-600">
                          {formatPrice(t.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelected(t)}
                        className="rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-brand-600/30 transition-all hover:shadow-lg hover:shadow-brand-600/40 hover:brightness-110 active:scale-95"
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

      {selected && <TourModal tour={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
