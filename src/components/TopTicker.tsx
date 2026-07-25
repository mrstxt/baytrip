import { Flame, Palmtree } from "lucide-react";
import { TOURS, formatPrice } from "../data";

export default function TopTicker() {
  const goTours = () => document.getElementById("turlar")?.scrollIntoView({ behavior: "smooth" });

  const items = TOURS.map((t) => ({
    flag: t.flag,
    city: t.city,
    days: t.days,
    price: t.price,
    discount: t.oldPrice ? Math.round((1 - t.price / t.oldPrice) * 100) : 0,
  }));

  const Row = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {items.map((m, i) => (
        <button
          key={i}
          onClick={goTours}
          tabIndex={ariaHidden ? -1 : 0}
          className="flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap px-4 text-[12px] font-bold text-white/90 transition hover:text-white focus:outline-none focus-visible:text-white sm:px-5 sm:text-[13px]"
        >
          <span className="text-base leading-none sm:text-lg">{m.flag}</span>
          <span className="max-w-[92px] truncate sm:max-w-none">{m.city}</span>
          <span className="hidden text-white/45 sm:inline">· {m.days} kun</span>
          <span className="font-display font-extrabold text-sun">{formatPrice(m.price)} dan</span>
          {m.discount > 0 && (
            <span className="rounded-full bg-hot px-2 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm shadow-hot/30">
              −{m.discount}%
            </span>
          )}
          <Palmtree className="ml-2 h-3.5 w-3.5 text-aqua/60 sm:ml-4" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="group fixed inset-x-0 top-0 z-[60] h-11 overflow-hidden border-b border-white/10 bg-brand-950 shadow-lg shadow-brand-950/20">
      {/* yuqori yaltirash chizig'i */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* aylanuvchi lenta */}
      <div className="absolute inset-y-0 left-36 right-0 sm:left-52">
        <div className="flex h-full w-max items-center animate-marquee will-change-transform group-hover:[animation-play-state:paused]">
          <Row />
          <Row ariaHidden />
        </div>
      </div>

      {/* chapdagi brend yorlig'i */}
      <button
        onClick={goTours}
        className="absolute left-0 top-0 z-10 flex h-full w-36 items-center justify-center gap-1.5 bg-gradient-to-r from-sun to-amber-300 pl-2 pr-5 text-ink shadow-lg shadow-black/10 transition hover:brightness-105 sm:w-52 sm:pl-0 sm:pr-6"
        style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)" }}
      >
        <Flame className="h-4 w-4 shrink-0 fill-tangerine text-tangerine animate-hot" />
        <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.08em] sm:text-xs sm:tracking-[0.14em]">
          Qaynoq takliflar
        </span>
      </button>
      {/* yorliqdan keyingi xiralashish */}
      <div className="pointer-events-none absolute inset-y-0 left-36 z-[5] w-12 bg-gradient-to-r from-brand-950 to-transparent sm:left-52" />

      {/* o'ng tomon xiralashish */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-brand-950 to-transparent" />
    </div>
  );
}
