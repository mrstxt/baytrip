import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Headset,
  Info,
  MapPin,
  PlaneTakeoff,
  Search,
  Send,
  ShieldCheck,
  Clock,
  MessageCircle,
  Phone,
  Wallet,
  X,
  XCircle,
  Globe2,
} from "lucide-react";
import { FAQS, TESTIMONIALS } from "../data";
import { sendLead } from "../lib/leads";
import { useApp } from "../store";
import { cn } from "../utils/cn";
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
                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink">“{t.quote}”</blockquote>
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
  const { toast } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (name.trim().length < 3) return setErr("Ismingizni kiriting.");
    if (!/^\+?[\d\s()-]{9,}$/.test(phone.trim())) return setErr("Telefon raqamini to'g'ri kiriting.");
    setErr("");
    setSending(true);

    try {
      await sendLead({
        type: "contact",
        name,
        phone,
        message: msg,
        source: "Aloqa formasi",
      });
      setDone(true);
      toast("Rahmat! Menejerimiz tez orada bog'lanadi.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Murojaatni yuborib bo'lmadi.";
      setErr(message);
      toast(message, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="aloqa" className="relative scroll-mt-24 overflow-hidden bg-brand-950 py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-tangerine/15 blur-3xl" />
      </div>
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-sun">Aloqa</p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">
            Keling, sayohatni boshlaymiz.
          </h2>
          <p className="mt-3 max-w-md text-brand-200">
            Ofisga tashrif buyuring, qo'ng'iroq qiling yoki ariza qoldiring —
            qaysi biri qulay bo'lsa.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Phone, label: "Telefon", value: "+998 95 748 59 95", href: "tel:+998957485995" },
              { icon: MessageCircle, label: "Telegram kanal", value: "@baytripuz", href: "https://t.me/baytripuz" },
              { icon: Globe2, label: "Instagram (Ichki turizm)", value: "@baytrip.uz", href: "https://instagram.com/baytrip.uz" },
              { icon: Globe2, label: "Instagram (Tashqi turizm)", value: "@baytrip.travel", href: "https://instagram.com/baytrip.travel" },
              { icon: MapPin, label: "Manzil", value: "Toshkent sh., Amir Temur shoh ko'chasi 12", href: undefined },
              { icon: Clock, label: "Ish vaqti", value: "Dush–Shan: 9:00 – 19:00", href: undefined },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.label} className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-sun ring-1 ring-white/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-300">{c.label}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                        className="mt-0.5 inline-block text-sm font-bold text-white transition hover:text-sun hover:underline"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-white">{c.value}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl bg-white p-6 text-ink shadow-2xl shadow-brand-950/40 sm:p-8">
            {done ? (
              <div className="flex flex-col items-center py-14 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 animate-pop">
                  <CheckCircle2 className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-display text-xl font-extrabold">Arizangiz qabul qilindi!</h3>
                <p className="mt-2 max-w-xs text-sm text-ink-soft">
                  Ish vaqtida 15 daqiqa ichida javob beramiz. Rahmat, {name.split(" ")[0]}!
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h3 className="font-display text-xl font-extrabold">Qo'ng'iroq buyurtma qilish</h3>
                <p className="mt-1 text-sm text-ink-soft">Ma'lumotlaringizni qoldiring — biz sizga qayta aloqaga chiqamiz.</p>
                <label className="mt-5 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Ismingiz</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aziza Karimova"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Telefon</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 95 748 59 95"
                    inputMode="tel"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Qaysi tur qiziqtiradi? (ixtiyoriy)</span>
                  <textarea
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    rows={3}
                    placeholder="Masalan: iyul oyida 2 kishiga Maldiv…"
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </label>
                {err && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{err}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-xl hover:shadow-brand-600/40 hover:brightness-110 active:scale-[0.98]"
                >
                  <Send className="h-4 w-4" /> {sending ? "Yuborilmoqda..." : "Yuborish"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Toast host ---------------- */

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    info: <Info className="h-5 w-5 text-brand-500" />,
    error: <XCircle className="h-5 w-5 text-rose-500" />,
  };
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2.5">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-white p-4 shadow-2xl shadow-brand-950/25 ring-1 ring-slate-100 animate-rise"
        >
          {icons[t.tone]}
          <p className="flex-1 text-sm font-semibold text-ink">{t.message}</p>
          <button aria-label="Yopish" onClick={() => dismissToast(t.id)} className="text-slate-300 transition hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
