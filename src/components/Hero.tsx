import {
  ArrowRight,
  Camera,
  Car,
  Compass,
  Globe2,
  Hotel,
  Luggage,
  Map,
  Mountain,
  Palmtree,
  Plane,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { Bubble, RainbowArc, Wave } from "./Brand";

function FeatureChip({
  className,
  icon,
  title,
  text,
}: {
  className?: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className={`absolute z-20 flex min-h-[72px] w-[178px] items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 text-ink shadow-2xl shadow-brand-950/20 ring-1 ring-white/60 backdrop-blur-xl lg:w-[190px] ${className ?? ""}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
        {icon}
      </span>
      <span>
        <span className="block text-[13px] font-extrabold leading-none">{title}</span>
        <span className="mt-1 block text-[11px] font-bold leading-none text-ink-soft">{text}</span>
      </span>
    </div>
  );
}

export default function Hero() {
  const goTours = () => document.getElementById("turlar")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative overflow-hidden bg-brand-600 pt-36 sm:pt-40">
      {/* qatlamli fon */}
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
        {/* brend kamalak — faqat desktop, CTA yonida */}
        <RainbowArc className="absolute -left-24 bottom-4 hidden h-80 w-80 opacity-95 lg:block" flip />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 pb-24 sm:px-6 md:gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28">
        {/* matn — Apple uslubida ulkan tipografika */}
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

        {/* brend pufakchalari va xizmat signallari */}
        <div className="relative mx-auto hidden h-[500px] w-full max-w-[560px] md:block lg:h-[450px]">
          <div className="absolute inset-x-4 bottom-0 top-0 rounded-[40px] bg-white/[0.04] ring-1 ring-white/10" />

          <Bubble className="absolute left-5 top-5 z-0 h-20 w-20 animate-floaty lg:left-2 lg:top-8 lg:h-24 lg:w-24" color="bg-aqua" tail="bl">
            <Globe2 className="h-9 w-9 lg:h-11 lg:w-11" strokeWidth={1.8} />
          </Bubble>
          <Bubble className="absolute right-8 top-4 z-0 h-24 w-24 animate-floaty-slow lg:right-8 lg:top-2 lg:h-28 lg:w-28" color="bg-sun" iconColor="text-tangerine" tail="bl">
            <Palmtree className="h-10 w-10 lg:h-12 lg:w-12" strokeWidth={2} />
          </Bubble>
          <Bubble className="absolute left-1/2 top-[42%] z-0 h-24 w-24 -translate-x-1/2 animate-floaty-slower lg:top-[41%] lg:h-28 lg:w-28" color="bg-aqua" iconColor="text-brand-700" tail="tr">
            <Plane className="h-11 w-11 -rotate-12 lg:h-12 lg:w-12" strokeWidth={2} />
          </Bubble>
          <Bubble className="absolute bottom-10 right-4 z-0 h-20 w-20 animate-floaty lg:bottom-10 lg:right-0 lg:h-24 lg:w-24" color="bg-tangerine" tail="tl">
            <Mountain className="h-9 w-9 lg:h-10 lg:w-10" strokeWidth={2} />
          </Bubble>
          <Bubble className="absolute left-[43%] top-[9%] z-0 h-16 w-16 animate-floaty lg:top-[8%] lg:h-[72px] lg:w-[72px]" color="bg-tangerine" iconColor="text-white" tail="tr">
            <Camera className="h-7 w-7 lg:h-8 lg:w-8" strokeWidth={2} />
          </Bubble>
          <Bubble className="absolute bottom-12 left-6 z-0 h-[68px] w-[68px] animate-floaty-slower lg:left-5 lg:bottom-12 lg:h-20 lg:w-20" color="bg-white" iconColor="text-tangerine" tail="tl">
            <Luggage className="h-8 w-8 lg:h-9 lg:w-9" strokeWidth={2} />
          </Bubble>
          <Bubble className="absolute bottom-4 left-[48%] z-0 h-16 w-16 animate-floaty lg:bottom-3 lg:h-[72px] lg:w-[72px]" color="bg-sun" iconColor="text-brand-700" tail="bl">
            <Compass className="h-7 w-7 lg:h-8 lg:w-8" strokeWidth={2} />
          </Bubble>
          <Bubble className="absolute right-5 top-[43%] z-0 h-16 w-16 animate-floaty-slow lg:right-2 lg:top-[44%] lg:h-[72px] lg:w-[72px]" color="bg-aqua" iconColor="text-white" tail="br">
            <Map className="h-7 w-7 lg:h-8 lg:w-8" strokeWidth={2} />
          </Bubble>

          <FeatureChip
            className="left-8 top-[118px] animate-floaty lg:left-5 lg:top-[118px]"
            icon={<Plane className="h-5 w-5" strokeWidth={2.2} />}
            title="Aviachipta"
            text="qulay reyslar"
          />
          <FeatureChip
            className="right-8 top-[132px] animate-floaty-slow lg:right-5 lg:top-[128px]"
            icon={<Hotel className="h-5 w-5" strokeWidth={2.2} />}
            title="Mehmonxona"
            text="tekshirilgan joylar"
          />
          <FeatureChip
            className="bottom-[116px] left-8 animate-floaty-slower lg:bottom-[92px] lg:left-5"
            icon={<Car className="h-5 w-5" strokeWidth={2.2} />}
            title="Transfer"
            text="kutib olish"
          />
          <FeatureChip
            className="bottom-[88px] right-8 animate-floaty lg:bottom-[66px] lg:right-5"
            icon={<ShieldCheck className="h-5 w-5" strokeWidth={2.2} />}
            title="Hujjatlar"
            text="viza yordami"
          />
        </div>
      </div>

      {/* brend to'lqini — hero'dan turlarga uzluksiz o'tish */}
      <Wave className="relative block h-12 w-full text-white sm:h-20" />
    </section>
  );
}
