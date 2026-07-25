"use client";

import { useState, useEffect } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Headset,
  PlaneTakeoff,
  Search,
  ShieldCheck,
  Wallet,
  X,
  CheckCircle2,
} from "lucide-react";
import { FAQS, TESTIMONIALS } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Bubble } from "./Brand";
import Reveal from "./Reveal";
import { Stars } from "./ui";

/* ---------------- Biz haqimizda + qadamlar ---------------- */

const STEPS = [
  { icon: Search, title: "Turni tanlang", text: "Katalogdan yo'nalish va sanani belgilang." },
  { icon: ClipboardList, title: "Ariza qoldiring", text: "Ism va telefon kifoya — qolgani bizda." },
  { icon: CreditCard, title: "Shartnoma va to'lov", text: "Ofisda yoki onlayn, 30% oldindan." },
  { icon: PlaneTakeoff, title: "Sayohat!", text: "Hujjatlar, chipta va transfer — hammasi tayyor." },
];

export function About() {
  return (
    <section id="haqimizda" className="scroll-mt-24 overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-aqua">Biz haqimizda</p>
          <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[3.2rem]">
            Tajriba.
            <br />
            <span className="text-aqua">Ishonch.</span> Natija.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            bayTrip 2018-yilda ikki do'st tomonidan ochilgan. Bugun biz 14 kishilik
            jamoamiz bilan har yili minglab o'zbekistonliklarni dunyoning 38 ta
            davlatiga yuboramiz — rasmiy litsenziya va sug'urta bilan.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Rasmiy litsenziya: T-0147, O'zbekiston Turizm qo'mitasi",
              "Har bir sayohatchi sug'urtalangan",
              "O'zbek, rus va ingliz tillaridagi gidlar",
              "Ofisimiz: Toshkent, Amir Temur shoh ko'chasi 12",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm font-semibold text-white/90">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aqua text-ink">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5l3.2 3L13 5" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="relative">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "Ishonchli", text: "7 yil, 12 400+ sayohatchi", color: "bg-brand-600/20 text-brand-300" },
              { icon: Wallet, title: "Halol narx", text: "Yashirin to'lovlarsiz", color: "bg-emerald-500/15 text-emerald-400" },
              { icon: Headset, title: "24/7 yordam", text: "Safarda ham yonigizdamiz", color: "bg-sun/15 text-sun" },
              { icon: BadgeCheck, title: "Kafolat", text: "Shartnoma asosida ish", color: "bg-rose-500/15 text-rose-400" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 90}>
                  <div className="group h-full rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:ring-white/20">
                    <span className={cn("mb-3 grid h-11 w-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110", f.color)}>
                      <Icon className="h-5.5 w-5.5" strokeWidth={2} />
                    </span>
                    <h3 className="font-display text-base font-extrabold text-white">{f.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{f.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Bubble className="absolute -right-4 -top-8 h-16 w-16 animate-floaty shadow-lg shadow-brand-950/10" color="bg-sun" iconColor="text-tangerine" tail="bl">
            <PlaneTakeoff className="h-7 w-7" />
          </Bubble>
        </div>
      </div>

      {/* qadamlar */}
      <div className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h3 className="font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">Qanday ishlaydi?</h3>
          <p className="mt-2 text-white/60">Atigi 4 qadam — va siz samolyotda.</p>
        </Reveal>
        <div className="relative mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-white/15 lg:block" aria-hidden />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 100} className="relative">
                <div className="flex flex-col items-center text-center">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
                    <Icon className="h-6 w-6" />
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-sun text-[11px] font-extrabold text-ink">
                      {i + 1}
                    </span>
                  </span>
                  <h4 className="mt-4 font-display text-base font-extrabold text-white">{s.title}</h4>
                  <p className="mt-1.5 max-w-[220px] text-sm text-white/60">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Mijozlar fikri ---------------- */

export function Testimonials() {
  return (
    <section id="fikrlar" className="scroll-mt-24 bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-600">Mijozlar fikri</p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
            Ular biz bilan uchishdi.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-lg text-ink-soft">Haqiqiy sayohatchilarning haqiqiy fikrlari.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <figure className="h-full rounded-[28px] bg-white p-6 ring-1 ring-black/[0.06] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.15)]">
                <div className="flex items-center justify-between">
                  <Stars rating={t.rating} />
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700">{t.trip}</span>
                </div>
                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink">"{t.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-full text-sm font-extrabold text-white", t.hue)}>
                    {t.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <p className="text-sm font-bold text-ink">{t.name}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="savollar" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-600">Savol-javob</p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
            Savollaringiz bormi?
          </h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className={cn("overflow-hidden rounded-2xl border transition-colors", isOpen ? "border-brand-300 bg-brand-50/50" : "border-slate-200 bg-white")}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-[15px] font-extrabold text-ink">{f.q}</span>
                    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all", isOpen ? "rotate-180 bg-brand-600 text-white" : "bg-slate-100 text-slate-500")}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Aloqa ---------------- */

export function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || phone.trim().length < 5) return;
    setSent(true);
  };

  return (
    <section id="aloqa" className="scroll-mt-24 overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-sun">Aloqa</p>
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[3.2rem]">
              Keling, <span className="text-sun">suhbat</span> quramiz.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/75">
              Ism va telefon raqamingizni qoldiring — menejerimiz sizga 15 daqiqa ichida
              qo'ng'iroq qiladi va barcha savollarga javob beradi.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { label: "Telefon", value: "+998 95 748 59 95", href: "tel:+998957485995" },
                { label: "Email", value: "hello@baytrip.uz", href: "mailto:hello@baytrip.uz" },
                { label: "Manzil", value: "Toshkent, Amir Temur ko'ch. 12" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 text-sm">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sun/80">{c.label}</span>
                  {c.href ? (
                    <a href={c.href} className="font-bold text-white/90 hover:text-sun transition">{c.value}</a>
                  ) : (
                    <span className="font-bold text-white/90">{c.value}</span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            {sent ? (
              <div className="flex flex-col items-center rounded-3xl bg-white/10 py-16 text-center ring-1 ring-white/10 backdrop-blur-sm">
                <CheckCircle2 className="h-12 w-12 text-sun" />
                <h4 className="mt-5 font-display text-xl font-extrabold">Xabaringiz qabul qilindi!</h4>
                <p className="mt-2 max-w-xs text-sm text-white/70">Tez orada siz bilan bog'lanamiz.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/10 backdrop-blur-sm sm:p-8">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-white/60">Ismingiz</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alisher"
                    className="w-full rounded-xl bg-white/95 px-4 py-3.5 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-white/60">Telefon raqam</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 95 748 59 95"
                    className="w-full rounded-xl bg-white/95 px-4 py-3.5 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                </label>
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-white/60">Xabar (ixtiyoriy)</span>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Savol yoki taklifingiz..."
                    rows={3}
                    className="w-full rounded-xl bg-white/95 px-4 py-3.5 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                </label>
                <button
                  type="submit"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 text-sm font-extrabold text-ink shadow-xl shadow-brand-950/30 transition-all hover:bg-amber-300 active:scale-95"
                >
                  <SendContactIcon /> Jo'natish
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SendContactIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

/* ---------------- Tost ---------------- */

type Toast = { id: number; message: string; tone: "success" | "info" | "error" };

// Global toast state
let toastsState: Toast[] = [];
let toastListeners: (() => void)[] = [];

function emitToast(message: string, tone: Toast["tone"] = "success") {
  const id = Date.now();
  toastsState = [...toastsState.slice(-2), { id, message, tone }];
  toastListeners.forEach((l) => l());
  setTimeout(() => {
    toastsState = toastsState.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l());
  }, 4200);
}

export function useToast() {
  return emitToast;
}

export function ToastHost() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toastsState.map((t) => (
        <div
          key={t.id}
          className={cn(
            "animate-pop flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-sm font-bold shadow-xl backdrop-blur-md ring-1",
            t.tone === "success" && "bg-emerald-600/95 text-white ring-emerald-400/30",
            t.tone === "error" && "bg-hot/95 text-white ring-rose-300/30",
            t.tone === "info" && "bg-brand-600/95 text-white ring-brand-400/30"
          )}
        >
          {t.message}
          <button
            onClick={() => {
              toastsState = toastsState.filter((x) => x.id !== t.id);
              toastListeners.forEach((l) => l());
            }}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
