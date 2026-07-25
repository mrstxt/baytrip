import { AtSign, Check, Send, Sparkles, Users, X } from "lucide-react";
import { useState } from "react";
import { BayMark } from "./Brand";
import Reveal from "./Reveal";
import { sendLead } from "../lib/leads";
import { useApp } from "../store";

const cardDesigns = [
  {
    type: "Men",
    holder: "AZIZBEK KARIMOV",
    number: "4589 2034 7712 6408",
    accent: "#111827",
    second: "#ffc21a",
    chip: "#f6c453",
    background:
      "linear-gradient(135deg, #05070d 0%, #111827 46%, #1f2937 72%, #0b5cf0 100%)",
    icon: "plane",
    delay: 120,
  },
  {
    type: "Women",
    holder: "MADINA ALIEVA",
    number: "4589 2034 8825 1936",
    accent: "#ff3b30",
    second: "#ffc21a",
    chip: "#ffd7cf",
    background:
      "linear-gradient(135deg, #8f1024 0%, #ff3b30 48%, #f97a1f 76%, #ffc21a 100%)",
    icon: "palm",
    delay: 200,
  },
  {
    type: "Family",
    holder: "KARIMOV FAMILY",
    number: "4589 2034 9360 2271",
    accent: "#21d0f0",
    second: "#ffc21a",
    chip: "#b7f3ff",
    background:
      "linear-gradient(135deg, #0b5cf0 0%, #1289f2 48%, #21d0f0 76%, #ffc21a 100%)",
    icon: "family",
    delay: 280,
  },
];

const plans = [
  {
    title: "3 oy",
    price: "299 000 so'm",
    oldPrice: "399 000 so'm",
    badge: "Start",
    featured: false,
    text: "BayClub'ni sinab ko'rish va yaqin safarda chegirma olish uchun.",
    benefits: ["3 oy davomida amal qiladi", "Har bir tur paketiga 20% chegirma", "Aksiya va yangi turlardan xabar"],
  },
  {
    title: "12 oy",
    price: "899 000 so'm",
    oldPrice: "1 299 000 so'm",
    badge: "Eng foydali",
    featured: true,
    text: "Yil davomida oilaviy yoki doimiy sayohatlar uchun eng foydali tanlov.",
    benefits: [
      "12 oy davomida amal qiladi",
      "Har bir tur paketiga 20% chegirma",
      "Maxsus bayram va mavsumiy takliflar",
      "Yangi turlar bo'yicha birinchi xabar",
      "Menejer bilan ustuvor bron yordami",
    ],
  },
  {
    title: "6 oy",
    price: "499 000 so'm",
    oldPrice: "699 000 so'm",
    badge: "Ommabop",
    featured: false,
    text: "Mavsum davomida bir necha bor sayohat qiladiganlar uchun.",
    benefits: ["6 oy davomida amal qiladi", "Har bir tur paketiga 20% chegirma", "BayClub takliflarida ustuvor aloqa", "Mavsumiy aksiyalar"],
  },
];

function CardChip({ color }: { color: string }) {
  return (
    <div
      className="grid h-9 w-12 place-items-center rounded-lg shadow-lg shadow-brand-950/15 ring-1 ring-white/35"
      style={{ backgroundColor: color }}
    >
      <div className="grid h-7 w-9 grid-cols-2 overflow-hidden rounded-md border border-ink/20">
        <span className="border-b border-r border-ink/20" />
        <span className="border-b border-ink/20" />
        <span className="border-r border-ink/20" />
        <span />
      </div>
    </div>
  );
}

function CardIcon({ type }: { type: string }) {
  if (type === "family") {
    return <Users className="h-9 w-9 text-white" strokeWidth={2.2} />;
  }

  if (type === "plane") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10 text-white" fill="currentColor" aria-hidden>
        <path d="M39.8 8.3c1.2 1.2.8 3.7-.8 5.3l-8.3 8.3 4.1 15.2-3.6 3.6-7.3-12-7.7 7.7.5 5-2.9 2.9-2.8-7-7-2.8 2.9-2.9 5 .5 7.7-7.7-12-7.3 3.6-3.6 15.2 4.1 8.3-8.3c1.6-1.7 4.1-2 5.3-.8Z" />
      </svg>
    );
  }

  return <BayMark className="h-11 w-11 text-white" />;
}

function BayClubPlasticCard({
  design,
  index,
}: {
  design: (typeof cardDesigns)[number];
  index: number;
}) {
  return (
    <Reveal delay={design.delay}>
      <div
        className="group relative mx-auto aspect-[1.586/1] w-full max-w-[360px] animate-floaty overflow-hidden rounded-[26px] p-5 text-white shadow-[0_28px_70px_-30px_rgba(14,36,82,0.85)] ring-1 ring-white/30 transition duration-500 hover:-translate-y-2 hover:rotate-[-1deg] hover:shadow-[0_34px_85px_-28px_rgba(14,36,82,0.95)]"
        style={{
          animationDelay: `${index * 0.8}s`,
          background: design.background,
        }}
      >
        <div
          className="absolute inset-0 opacity-85"
          style={{
            background: `radial-gradient(circle at 16% 20%, ${design.accent} 0 12%, transparent 13% 100%), radial-gradient(circle at 88% 18%, rgba(255,255,255,0.15) 0 17%, transparent 18% 100%), radial-gradient(circle at 92% 92%, ${design.second} 0 17%, transparent 18% 100%)`,
          }}
        />
        <div className="absolute -right-12 top-12 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -right-4 top-20 h-44 w-44 rounded-full bg-white/10" />
        <div className="absolute -bottom-11 -left-10 h-28 w-28 rounded-full border-[14px]" style={{ borderColor: design.accent }} />
        <div className="absolute -bottom-2 -left-12 h-24 w-24 rounded-full border-[14px]" style={{ borderColor: design.second }} />
        <div
          className="absolute right-5 top-14 grid h-16 w-16 place-items-center rounded-full"
          style={{ backgroundColor: design.second }}
        >
          <CardIcon type={design.icon} />
          <span className="absolute -bottom-1 right-3 h-5 w-5 rotate-45 rounded-[5px]" style={{ backgroundColor: design.second }} />
        </div>
        <div className="absolute left-0 top-0 h-full w-1/3 -skew-x-12 bg-white/20 opacity-0 blur-lg transition duration-700 group-hover:translate-x-[380px] group-hover:opacity-100" />
        <div className="absolute -left-3.5 top-2.5 z-10 flex h-12 w-[180px] items-center">
          <img
            src="/bayclub.png"
            alt="bayClub"
            className="h-11 w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.28)]"
            draggable={false}
          />
        </div>
        <span className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ring-1 ring-white/20">
          {design.type}
        </span>

        <div className="relative flex h-full flex-col justify-between">
          <div className="h-10" />

          <div>
            <CardChip color={design.chip} />
            <p className="mt-4 font-display text-[20px] font-extrabold tracking-[0.12em] text-white drop-shadow-sm">
              {design.number}
            </p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/65">Card holder</p>
              <p className="mt-1 text-[12px] font-extrabold uppercase tracking-[0.12em]">{design.holder}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/80">Discount</p>
              <p className="font-display text-4xl font-extrabold leading-none text-white">20%</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export default function BayClub() {
  const { toast } = useApp();
  const [cardType, setCardType] = useState(cardDesigns[0].type);
  const [planTitle, setPlanTitle] = useState(plans[1].title);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const selectedPlan = plans.find((plan) => plan.title === planTitle) ?? plans[1];

  const openForm = (title: string) => {
    setPlanTitle(title);
    setErr("");
    setShowForm(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    if (name.trim().length < 3) return setErr("Ism va familyangizni kiriting.");
    if (!/^\+?[\d\s()-]{9,}$/.test(phone.trim())) return setErr("Telefon raqamini to'g'ri kiriting.");
    const normalizedTelegram = telegramUsername.trim().replace(/^@+/, "");
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(normalizedTelegram)) {
      return setErr("Telegram username'ni to'g'ri kiriting. Masalan: bayclub_user");
    }

    setErr("");
    setSending(true);
    try {
      await sendLead({
        type: "bayclub-card",
        name,
        phone,
        telegramUsername: `@${normalizedTelegram}`,
        cardType,
        plan: selectedPlan.title,
        price: selectedPlan.price,
        source: "BayClub Card bo'limi",
      });
      toast("BayClub Card arizangiz yuborildi.");
      setName("");
      setPhone("");
      setTelegramUsername("");
      setShowForm(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "BayClub arizasini yuborib bo'lmadi.";
      setErr(message);
      toast(message, "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="bayclub" className="overflow-hidden bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            BayClub Card
          </p>
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
            Har bir tur paketidan 20% chegirma
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
            3, 6 yoki 12 oylik obunani tanlang. Amal qilish muddati davomida
            BayClub Card bilan xarid qilingan tur paketlariga chegirma ishlaydi.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {cardDesigns.map((design, index) => (
            <BayClubPlasticCard key={design.type} design={design} index={index} />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-4 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Reveal key={plan.title} delay={180 + index * 80}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl p-6 text-center shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                  plan.featured
                    ? "bg-white text-ink shadow-brand-600/20 ring-2 ring-brand-400 md:-mt-4 md:mb-4"
                    : "bg-white text-ink shadow-brand-950/[0.06] ring-1 ring-black/[0.06] hover:shadow-brand-950/[0.12]"
                }`}
              >
                {plan.featured && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-brand-600 via-aqua to-sun" />
                    <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-aqua/20" />
                    <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-sun/25" />
                    <div className="absolute bottom-5 right-6 h-16 w-16 rounded-full bg-tangerine/15" />
                  </>
                )}
                <p
                  className={`relative inline-flex self-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] ${
                    plan.featured ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"
                  }`}
                >
                  {plan.badge}
                </p>
                <h3 className={`relative mt-4 font-display text-3xl font-extrabold ${plan.featured ? "text-brand-700" : "text-ink"}`}>{plan.title}</h3>
                <p className={`relative mt-2 font-display text-2xl font-extrabold ${plan.featured ? "text-tangerine" : "text-brand-700"}`}>{plan.price}</p>
                <p className="relative mt-1 text-sm font-extrabold text-ink-soft/55 line-through">{plan.oldPrice}</p>
                <p className="relative mx-auto mt-3 max-w-[240px] text-sm leading-relaxed text-ink-soft">{plan.text}</p>
                <ul className="relative mt-5 flex-1 space-y-2 text-left">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm font-semibold leading-snug text-ink">
                      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.featured ? "bg-brand-600 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                        <Check className="h-3 w-3" />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => openForm(plan.title)}
                  className={`relative flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-extrabold transition active:scale-[0.98] ${plan.featured ? "mt-8" : "mt-auto"} ${
                    plan.featured
                      ? "bg-gradient-to-r from-brand-600 to-aqua text-white shadow-lg shadow-brand-600/25 hover:brightness-110"
                      : "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700"
                  }`}
                >
                  Card olish
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center bg-ink/55 px-4 py-6 backdrop-blur-sm">
            <form onSubmit={submit} className="relative max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl shadow-brand-950/30 ring-1 ring-black/[0.06] sm:p-8">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Yopish"
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-surface text-ink-soft transition hover:bg-slate-200 hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">BayClub ariza</p>
                <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                  Kartangiz turini tanlang
                </h3>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {cardDesigns.map((design) => (
                    <button
                      key={design.type}
                      type="button"
                      onClick={() => setCardType(design.type)}
                      className={`rounded-2xl px-3 py-3 text-sm font-extrabold ring-1 transition ${
                        cardType === design.type
                          ? "bg-brand-600 text-white ring-brand-600"
                          : "bg-brand-50 text-brand-700 ring-brand-100 hover:bg-brand-100"
                      }`}
                    >
                      {design.type}
                    </button>
                  ))}
                </div>
                <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm font-bold text-ink">
                  Tanlov: {cardType} karta, {selectedPlan.title} obuna — {selectedPlan.price}
                </p>
              </div>

              <div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Ism familya</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Azizbek Karimov"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Telefon</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 95 748 59 95"
                      inputMode="tel"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Telegram username</span>
                    <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
                      <AtSign className="h-4 w-4 text-brand-600" />
                      <input
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        placeholder="bayclub_user"
                        autoCapitalize="none"
                        autoCorrect="off"
                        className="w-full bg-transparent text-sm font-semibold outline-none"
                      />
                    </span>
                  </label>
                </div>
                {err && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">{err}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Yuborilmoqda..." : "BayClub Card olish"}
                </button>
              </div>
            </div>
          </form>
          </div>
        )}
      </div>
    </section>
  );
}
