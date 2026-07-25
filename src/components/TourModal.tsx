"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  Users,
  X,
} from "lucide-react";
import { formatPrice, type TourBase } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Stars } from "./ui";

export default function TourModal({ tour, onClose }: { tour: TourBase; onClose: () => void }) {
  const [date, setDate] = useState(tour.nextDates[0]);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return setErr("Ismingizni to'liq kiriting.");
    if (!/^\+?[\d\s()-]{9,}$/.test(phone.trim())) return setErr("Telefon raqamini to'g'ri kiriting.");
    setErr("");

    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: tour.id,
          tourName: tour.title,
          clientName: name,
          clientPhone: phone,
          people,
          totalPrice: tour.price * people,
          bookingDate: date,
        }),
      });
    } catch {
      // ignore — UI success anyway
    }

    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop">
        <button
          aria-label="Yopish"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-lg backdrop-blur transition hover:bg-white active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[92vh] grid-cols-1 overflow-y-auto md:grid-cols-[1fr_1.1fr]">
          {/* chap — rasm va dastur */}
          <div className="relative">
            <div className="relative h-56 md:h-72">
              <img src={tour.image} alt={tour.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="flex items-center gap-1.5 text-xs font-bold text-sun">
                  <MapPin className="h-3.5 w-3.5" /> {tour.flag} {tour.city}, {tour.country}
                </p>
                <h3 className="mt-1 font-display text-2xl font-extrabold leading-tight">{tour.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs font-bold">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{tour.days} kun / {tour.nights} tun</span>
                  <span className="inline-flex items-center gap-1"><Stars rating={tour.rating} /> {tour.rating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h4 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wider text-ink">
                  Tur dasturi
                </h4>
                <ol className="relative space-y-4 border-l-2 border-dashed border-brand-200 pl-5">
                  {tour.itinerary.map((it) => (
                    <li key={it.day} className="relative">
                      <span className="absolute -left-[27px] grid h-4 w-4 place-items-center rounded-full bg-brand-600 ring-4 ring-white" />
                      <p className="text-xs font-extrabold uppercase tracking-wide text-brand-600">{it.day}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{it.text}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="mb-3 font-display text-sm font-extrabold uppercase tracking-wider text-ink">
                  Narxga kiradi
                </h4>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {tour.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* o'ng — bron formasi */}
          <div className="border-t border-slate-100 bg-mist p-6 md:border-l md:border-t-0">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 animate-pop">
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </span>
                <h4 className="mt-5 font-display text-xl font-extrabold text-ink">Ariza yuborildi!</h4>
                <p className="mt-2 max-w-xs text-sm text-ink-soft">
                  Menejerimiz 15 daqiqa ichida {phone} raqamiga qo'ng'iroq qiladi va bronni tasdiqlaydi.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  Yaxshi, rahmat
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex h-full flex-col">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Narx, kishiboshiga</p>
                    <p className="font-display text-3xl font-extrabold text-brand-600">{formatPrice(tour.price, tour.currency)}</p>
                  </div>
                  <span className="rounded-full bg-tangerine/10 px-3 py-1.5 text-xs font-extrabold text-tangerine">
                    {tour.seatsLeft} ta joy qoldi
                  </span>
                </div>

                <label className="mt-5 block">
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" /> Chiqish sanasi
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tour.nextDates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDate(d)}
                        className={cn(
                          "rounded-xl px-3.5 py-2 text-sm font-bold transition",
                          date === d
                            ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30"
                            : "bg-white text-ink ring-1 ring-slate-200 hover:ring-brand-300"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </label>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200">
                  <span className="flex items-center gap-2 text-sm font-bold text-ink">
                    <Users className="h-4 w-4 text-brand-600" /> Sayohatchilar
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Kamaytirish"
                      disabled={people <= 1}
                      onClick={() => setPeople((p) => Math.max(1, p - 1))}
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center text-sm font-extrabold tabular-nums">{people}</span>
                    <button
                      type="button"
                      aria-label="Ko'paytirish"
                      disabled={people >= tour.seatsLeft}
                      onClick={() => setPeople((p) => Math.min(tour.seatsLeft, p + 1))}
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex justify-between rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-800">
                  <span>Jami (taxminan)</span>
                  <span className="font-display">{formatPrice(tour.price * people, tour.currency)}</span>
                </div>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Ismingiz</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alisher"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Telefon raqam</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 95 748 59 95"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </label>

                {err && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-hot">
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30 transition-all hover:brightness-110 active:scale-95"
                >
                  <SendIcon /> Bronni tasdiqlash
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
