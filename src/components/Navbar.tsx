import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "../utils/cn";
import { BayMark } from "./Brand";

const LINKS = [
  { id: "turlar", label: "Turlar" },
  { id: "haqimizda", label: "Biz haqimizda" },
  { id: "fikrlar", label: "Mijozlar" },
  { id: "savollar", label: "Savollar" },
  { id: "aloqa", label: "Aloqa" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["home", "turlar", "haqimizda", "fikrlar", "savollar", "aloqa"];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const onHero = !scrolled;

  return (
    <header className="fixed inset-x-0 top-10 z-50 px-3 pt-2 sm:px-6 sm:pt-2.5">
      <div
        className={cn(
          "mx-auto flex max-w-5xl items-center gap-2 rounded-full px-3 py-2 transition-all duration-500 sm:px-4",
          onHero
            ? "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-xl"
            : "bg-white/72 text-ink shadow-[0_8px_40px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] backdrop-blur-2xl"
        )}
      >
        <button onClick={() => go("home")} className="flex items-center gap-2 pl-1" aria-label="bayTrip bosh sahifa">
          <span className={cn("grid h-9 w-9 place-items-center rounded-full", onHero ? "bg-white text-brand-600" : "bg-brand-600 text-white")}>
            <BayMark className="h-6 w-6" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            bay<span className={onHero ? "text-sun" : "text-brand-600"}>Trip</span>
          </span>
        </button>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                active === l.id
                  ? onHero
                    ? "bg-white/20 text-white"
                    : "text-brand-600"
                  : onHero
                    ? "text-white/75 hover:text-white"
                    : "text-ink-soft hover:text-ink"
              )}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <a
            href="tel:+998957485995"
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition md:flex",
              onHero ? "text-white/90 hover:bg-white/15" : "text-ink hover:bg-black/5"
            )}
          >
            <Phone className="h-3.5 w-3.5" />
            +998 95 748 59 95
          </a>
          <button
            onClick={() => go("aloqa")}
            className={cn(
              "rounded-full px-4 py-2 text-[13px] font-bold transition-all active:scale-95",
              onHero
                ? "bg-sun text-ink shadow-lg shadow-brand-950/25 hover:bg-amber-300"
                : "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30 hover:brightness-110"
            )}
          >
            Bron qilish
          </button>
          <button
            aria-label="Menyu"
            onClick={() => setOpen((v) => !v)}
            className={cn("grid h-9 w-9 place-items-center rounded-full lg:hidden", onHero ? "hover:bg-white/15" : "hover:bg-black/5")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-5xl rounded-3xl bg-white/90 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur-2xl animate-pop lg:hidden">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={cn(
                "block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold",
                active === l.id ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-surface"
              )}
            >
              {l.label}
            </button>
          ))}
          <a href="tel:+998957485995" className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-brand-600">
            <Phone className="h-4 w-4" /> +998 95 748 59 95
          </a>
        </div>
      )}
    </header>
  );
}
