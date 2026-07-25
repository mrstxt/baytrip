"use client";

import { ArrowRight, Globe2, Mountain, Palmtree, Plane } from "lucide-react";
import { Bubble, RainbowArc, Wave } from "./Brand";

export default function Hero() {
  const goTours = () => document.getElementById("turlar")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative overflow-hidden bg-brand-600 pt-36 sm:pt-40">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_20%_0%,#2f83ff_0%,#1668f0_48%,#0f52cf_100%)]" />
        <div className="absolute -right-44 top-1/2 h-[1150px] w-[1150px] -translate-y-1/2 opacity-[0.12] animate-rays">
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.9) 0deg 6deg, transparent 6deg 18deg)",
            }}
          />
        </div>
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-aqua/25 blur-3xl" />
        <RainbowArc className="absolute -left-24 bottom-4 hidden h-80 w-80 opacity-95 lg:block" flip />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/90 ring-1 ring-white/25 animate-rise">
            bayTrip · Toshkent tur agentligi
          </p>
          <h1
            className="font-display text-[2.9rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-[4.2rem] animate-rise"
            style={{ animationDelay: "80ms" }}
          >
            Sayohat.
            <br />
            <span className="text-sun">Oddiy.</span> Ajoyib.
          </h1>
          <p
            className="mt-6 max-w-md text-lg font-medium leading-relaxed text-brand-100 animate-rise"
            style={{ animationDelay: "160ms" }}
          >
            Aviachipta, mehmonxona va to'liq tur dasturi — bitta joyda,
            shaffof narxda. 8 ta yo'nalish. Bir qadam qoldi.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4 animate-rise" style={{ animationDelay: "240ms" }}>
            <button
              onClick={goTours}
              className="group inline-flex items-center gap-2 rounded-full bg-sun px-7 py-3.5 text-[15px] font-extrabold text-ink shadow-xl shadow-brand-950/30 transition-all hover:-translate-y-0.5 hover:bg-amber-300 active:translate-y-0"
            >
              Turlarni ko'rish
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="tel:+998957485995"
              className="text-[15px] font-bold text-white underline-offset-4 transition hover:text-sun hover:underline"
            >
              Yoki qo'ng'iroq qiling →
            </a>
          </div>
        </div>

        <div className="relative hidden h-[400px] lg:block" aria-hidden>
          <Bubble className="left-2 top-4 h-24 w-24 animate-floaty" color="bg-aqua" tail="bl">
            <Globe2 className="h-11 w-11" strokeWidth={1.8} />
          </Bubble>
          <Bubble className="right-6 top-0 h-28 w-28 animate-floaty-slow" color="bg-sun" iconColor="text-tangerine" tail="bl">
            <Palmtree className="h-12 w-12" strokeWidth={2} />
          </Bubble>
          <Bubble className="left-[34%] top-[40%] h-32 w-32 animate-floaty-slower" color="bg-aqua" iconColor="text-brand-700" tail="tr">
            <Plane className="h-14 w-14 -rotate-12" strokeWidth={2} />
          </Bubble>
          <Bubble className="bottom-4 right-0 h-24 w-24 animate-floaty" color="bg-tangerine" tail="tl">
            <Mountain className="h-10 w-10" strokeWidth={2} />
          </Bubble>
          <RainbowArc className="absolute -right-12 bottom-8 h-52 w-52 animate-floaty-slow" />
        </div>
      </div>

      <Wave className="relative block h-12 w-full text-white sm:h-20" />
    </section>
  );
}
