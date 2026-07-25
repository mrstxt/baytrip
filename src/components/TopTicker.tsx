"use client";

import { Flame, Palmtree } from "lucide-react";
import { TOURS, formatPrice } from "@/lib/data";

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
          className="flex shrink-0 items-center gap-2.5 px-5 text-[13px] font-bold text-white/90 transition hover:text-white"
        >
          <span className="text-base leading-none">{m.flag}</span>
          <span>{m.city}</span>
          <span className="hidden text-white/45 sm:inline">· {m.days} kun</span>
          <span className="font-display font-extrabold text-sun">{formatPrice(m.price)} dan</span>
          {m.discount > 0 && (
            <span className="rounded-full bg-hot px-2 py-0.5 text-[10px] font-extrabold text-white">
              −{m.discount}%
            </span>
          )}
          <Palmtree className="ml-4 h-3.5 w-3.5 text-aqua/60" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="group fixed inset-x-0 top-0 z-[60] h-10 overflow-hidden bg-brand-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="absolute inset-y-0 left-44 right-0 sm:left-52">
        <div className="flex h-full w-max items-center animate-marquee will-change-transform group-hover:[animation-play-state:paused]">
          <Row />
          <Row ariaHidden />
        </div>
      </div>

      <button
        onClick={goTours}
        className="absolute left-0 top-0 z-10 flex h-full w-44 items-center justify-center gap-1.5 bg-sun text-ink transition hover:bg-amber-300 sm:w-52"
        style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)" }}
      >
        <Flame className="h-4 w-4 fill-tangerine text-tangerine animate-hot" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] sm:text-xs">
          Qaynoq takliflar
        </span>
      </button>
      <div className="pointer-events-none absolute inset-y-0 left-44 z-[5] w-10 bg-gradient-to-r from-brand-950 to-transparent sm:left-52" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-brand-950 to-transparent" />
    </div>
  );
}
