import { CalendarDays } from "lucide-react";
import { cn } from "../utils/cn";
import { getTodayInputValue, getUpcomingTourDates } from "../utils/tourDates";

export default function TourDateSelector({
  tourId,
  value,
  onChange,
  tone = "brand",
  dark = false,
}: {
  tourId: string;
  value: string;
  onChange: (date: string) => void;
  tone?: "brand" | "emerald";
  dark?: boolean;
}) {
  const today = getTodayInputValue();
  const dates = getUpcomingTourDates(tourId, 3);
  const selected = value || dates[0]?.inputValue || today;
  const activeClass =
    tone === "emerald"
      ? "bg-emerald-600 text-white ring-emerald-600"
      : "bg-brand-600 text-white ring-brand-600";
  const hoverClass = tone === "emerald" ? "hover:ring-emerald-300" : "hover:ring-brand-300";

  return (
    <div className="mt-3">
      <p className={cn("text-[10px] font-extrabold uppercase tracking-widest", dark ? "text-white/60" : "text-ink-soft")}>
        Yaqin sanalar
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {dates.map((date) => (
          <button
            key={date.inputValue}
            type="button"
            onClick={() => onChange(date.inputValue)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition hover:-translate-y-0.5",
              selected === date.inputValue
                ? activeClass
                : dark
                  ? "bg-white/12 text-white/90 ring-white/15 backdrop-blur-md"
                  : "bg-surface text-ink-soft ring-black/[0.04]",
              selected !== date.inputValue && hoverClass
            )}
          >
            {date.label}
          </button>
        ))}
      </div>
      <label
        className={cn(
          "mt-2 flex items-center gap-2 rounded-xl px-3 py-2 ring-1 transition focus-within:ring-2",
          dark
            ? "bg-white/12 text-white ring-white/15 focus-within:ring-white/30"
            : "bg-white text-ink ring-slate-200 focus-within:ring-brand-100"
        )}
      >
        <CalendarDays className={cn("h-4 w-4 shrink-0", tone === "emerald" ? "text-emerald-600" : "text-brand-600")} />
        <input
          type="date"
          value={selected}
          min={today}
          onChange={(event) => onChange(event.target.value)}
          className={cn("w-full bg-transparent text-xs font-bold outline-none", dark && "text-white [color-scheme:dark]")}
        />
      </label>
    </div>
  );
}
