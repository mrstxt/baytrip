import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { useApp } from "../store";
import { BayMark } from "./Brand";
import Reveal from "./Reveal";

const COLS = [
  { title: "Yo'nalishlar", links: ["Dubai", "Istanbul", "Bali", "Maldiv orollari", "Tokio", "Parij"] },
  { title: "Kompaniya", links: ["Biz haqimizda", "Jamoa", "Litsenziya", "Hamkorlik", "Vakansiyalar"] },
  { title: "Yordam", links: ["Savol-javob", "To'lov shartlari", "Bekor qilish", "Sug'urta", "Bog'lanish"] },
];

const SOCIALS = [
  {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.5a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z",
  },
  {
    label: "Telegram",
    path: "M21.9 4.4L2.9 11.7c-1 .4-1 1.4-.2 1.7l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.8-.8l3.2-15c.3-1.2-.4-1.8-1.6-1.4zM8.4 14.5l9.3-5.8c.4-.3.8-.1.5.2l-7.8 7.1-.3 3.2-1.7-4.7z",
  },
  {
    label: "Facebook",
    path: "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z",
  },
  {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z",
  },
];

export default function Footer() {
  const { toast } = useApp();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("Email manzilini to'g'ri kiriting.", "error");
      return;
    }
    setDone(true);
    toast("Obuna rasmiylashtirildi — aksiyalar endi pochtangizda!");
  };

  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-9 shadow-2xl shadow-brand-950/40 sm:px-10 -translate-y-12 sm:-translate-y-14">
            <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-aqua/30 blur-2xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-md">
                <h3 className="font-display text-2xl font-extrabold sm:text-3xl">Aksiyalardan birinchi bo'lib xabardor bo'ling</h3>
                <p className="mt-2 text-brand-100">Haftada bir marta — chegirmali turlar va yangi yo'nalishlar.</p>
              </div>
              {done ? (
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-sm font-bold ring-1 ring-white/25">
                  <CheckCircle2 className="h-5 w-5 text-sun" /> Obuna faollashtirildi!
                </p>
              ) : (
                <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pochtangiz@misol.uz"
                    className="w-full rounded-full bg-white/95 px-5 py-3.5 text-sm font-semibold text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sun"
                  />
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-950 active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Obuna</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>

        <div className="-mt-4 grid grid-cols-2 gap-10 pb-10 md:grid-cols-5 sm:-mt-8">
          <div className="col-span-2">
            <a href="#home" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
                <BayMark className="h-7 w-7" />
              </span>
              <span className="font-display text-xl font-extrabold">
                bay<span className="text-aqua">Trip</span>
              </span>
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Toshkentdagi rasmiy tur agentligi. Aviachiptalar, mehmonxonalar va
              to'liq tur dasturlari.
            </p>
            <p className="mt-3 text-xs font-bold text-white">
              Tel: <a href="tel:+998957485995" className="text-sun hover:underline">+998 95 748 59 95</a>
            </p>

            {/* Social channels badges */}
            <div className="mt-4 space-y-2">
              <a
                href="https://instagram.com/baytrip.uz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-brand-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-tangerine">
                  <path d={SOCIALS[0].path} />
                </svg>
                <span>@baytrip.uz</span>
                <span className="ml-auto rounded-full bg-tangerine/20 px-2 py-0.5 text-[10px] font-bold text-sun">Ichki turizm</span>
              </a>

              <a
                href="https://instagram.com/baytrip.travel"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-brand-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-aqua">
                  <path d={SOCIALS[0].path} />
                </svg>
                <span>@baytrip.travel</span>
                <span className="ml-auto rounded-full bg-aqua/20 px-2 py-0.5 text-[10px] font-bold text-aqua">Tashqi turizm</span>
              </a>

              <a
                href="https://t.me/baytripuz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-brand-600 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-sky-400">
                  <path d={SOCIALS[1].path} />
                </svg>
                <span>@baytripuz</span>
                <span className="ml-auto rounded-full bg-sky-400/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">Telegram kanal</span>
              </a>
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-slate-300">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#home" onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 transition hover:text-aqua">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} bayTrip Travel Co. Litsenziya T-0147. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex gap-2">
            {["VISA", "Mastercard", "Payme", "Click"].map((p) => (
              <span key={p} className="rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-300 ring-1 ring-white/10">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
