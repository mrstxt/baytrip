"use client";

import { useState } from "react";
import { Check, Crown, Sparkles, Star, Zap, X } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/lib/data";
import { cn } from "@/lib/cn";
import { BrandPattern } from "./Brand";
import Reveal from "./Reveal";

const PLAN_ICONS = [Zap, Crown, Sparkles];
const PLAN_COLORS = ["from-brand-500 to-brand-700", "from-sun to-tangerine", "from-aqua to-brand-600"];

export default function SubscriptionPlans() {
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const plan = SUBSCRIPTION_PLANS.find((p) => p.months.toString() === selected);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return setErr("Obuna turini tanlang.");
    if (name.trim().length < 3) return setErr("Ismingizni to'liq kiriting.");
    if (!/^\+?[\d\s()-]{9,}$/.test(phone.trim())) return setErr("Telefon raqamini to'g'ri kiriting.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Email manzilini to'g'ri kiriting.");
    setErr("");

    try {
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          planType: selected,
          price: plan?.totalPrice,
        }),
      });
    } catch {
      // ignore
    }

    setSent(true);
  };

  return (
    <section id="obuna" className="relative scroll-mt-24 overflow-hidden bg-gradient-to-br from-brand-950 via-ink to-brand-950 py-20 sm:py-28">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,104,240,0.3)_0%,transparent_70%)]" />
      </div>
      <BrandPattern className="pointer-events-none absolute -right-28 -top-20 h-80 w-80 rotate-12 text-brand-600/20" />
      <BrandPattern className="pointer-events-none absolute -left-28 bottom-10 h-80 w-80 -rotate-12 text-sun/10" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-sun ring-1 ring-white/20">
            <Star className="h-3.5 w-3.5 fill-sun" />
            Obuna tizimi
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-white sm:text-5xl">
            Maxsus <span className="text-sun">imtiyozlar</span> to'plami
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            3, 6 yoki 12 oylik obuna bo'ling va turlarga maksimal chegirma, 
            shaxsiy menejer va boshqa imtiyozlarga ega bo'ling.
          </p>
        </Reveal>

        {/* Plan cards */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((p, i) => {
            const Icon = PLAN_ICONS[i];
            const isSelected = selected === p.months.toString();
            const isPopular = p.popular;

            return (
              <Reveal key={p.months} delay={i * 100}>
                <button
                  onClick={() => setSelected(p.months.toString())}
                  className={cn(
                    "group relative flex w-full flex-col overflow-hidden rounded-[32px] p-6 sm:p-7 text-left transition-all duration-500 hover:-translate-y-2",
                    isSelected
                      ? "bg-gradient-to-br from-brand-600 to-brand-800 text-white ring-2 ring-sun shadow-2xl shadow-brand-600/40"
                      : "bg-white/5 text-white/90 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/30"
                  )}
                >
                  {isPopular && (
                    <div className="absolute -right-12 top-5 w-40 rotate-45 bg-sun py-1.5 text-center text-[11px] font-extrabold uppercase tracking-wider text-ink shadow-lg">
                      Eng yaxshi
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110",
                      isSelected ? "bg-white/20" : "bg-white/10"
                    )}>
                      <Icon className={cn("h-6 w-6", isPopular ? "text-sun" : "")} />
                    </span>
                    <span className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide",
                      isSelected ? "bg-white/15 text-sun" : "bg-white/10 text-white/60"
                    )}>
                      {p.label}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-2xl font-extrabold">{p.sublabel}</h3>
                  <p className="mt-1 text-sm text-white/50">{p.sublabel === "Oltin" ? "Eng ommabop" : p.sublabel === "Premium" ? "Cheksiz imkoniyatlar" : "Boshlang'ich bosqich"}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className={cn(
                      "font-display text-4xl font-extrabold tracking-tight",
                      isPopular ? "text-sun" : isSelected ? "text-sun" : "text-white"
                    )}>
                      ${p.pricePerMonth}
                    </span>
                    <span className="text-sm font-semibold text-white/50">/oy</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold",
                      isSelected ? "text-white/70" : "text-white/40"
                    )}>
                      Jami: ${p.totalPrice}
                    </span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                      isPopular
                        ? "bg-sun/20 text-sun"
                        : isSelected
                          ? "bg-white/15 text-sun"
                          : "bg-emerald-500/20 text-emerald-400"
                    )}>
                      {p.savings} tejash
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm font-medium">
                        <span className={cn(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                          isSelected ? "bg-sun/20 text-sun" : "bg-white/10 text-white/60"
                        )}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className={isSelected ? "text-white/85" : "text-white/60"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-6">
                    <span className={cn(
                      "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition-all active:scale-95",
                      isSelected
                        ? "bg-sun text-ink shadow-lg shadow-sun/30"
                        : "bg-white/10 text-white group-hover:bg-white/20"
                    )}>
                      {isSelected ? "✓ Tanlandi" : "Obuna bo'lish"}
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Registration form */}
        {selected && !sent && (
          <Reveal className="mx-auto mt-12 max-w-xl">
            <form onSubmit={submit} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm sm:p-8 animate-pop">
              <h3 className="font-display text-xl font-extrabold text-white">
                {plan?.sublabel} — {plan?.label} obunasi
              </h3>
              <p className="mt-1 text-sm text-white/50">
                Jami: ${plan?.totalPrice} (${plan?.pricePerMonth}/oy × {plan?.months} oy)
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">Ismingiz</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alisher"
                    className="w-full rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">Telefon</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 95 748 59 95"
                    className="w-full rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-white/50">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alisher@example.com"
                    className="w-full rounded-xl bg-white/95 px-4 py-3 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                </label>
              </div>

              {err && (
                <p className="mt-3 text-sm font-bold text-hot">{err}</p>
              )}

              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 text-sm font-extrabold text-ink shadow-xl shadow-sun/30 transition-all hover:bg-amber-300 active:scale-95"
              >
                Obunani faollashtirish
              </button>
            </form>
          </Reveal>
        )}

        {/* Success */}
        {sent && (
          <Reveal className="mx-auto mt-12 max-w-xl">
            <div className="flex flex-col items-center rounded-3xl bg-white/5 py-16 text-center ring-1 ring-white/10 backdrop-blur-sm animate-pop">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-sun/20 text-sun">
                <Check className="h-8 w-8" strokeWidth={2.5} />
              </span>
              <h4 className="mt-5 font-display text-xl font-extrabold text-white">
                Obunangiz qabul qilindi!
              </h4>
              <p className="mt-2 max-w-xs text-sm text-white/60">
                {plan?.sublabel} — {plan?.label} obunangiz faollashtirildi. 
                Tafsilotlar email manzilingizga yuborildi.
              </p>
              <p className="mt-4 text-sm font-bold text-sun">
                ${plan?.totalPrice} · {plan?.months} oy
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
