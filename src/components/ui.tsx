import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "../utils/cn";

export function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

export type Option = { value: string; label: string; sub?: string };

export function Select({
  icon,
  value,
  options,
  onChange,
  placeholder = "Select",
  buttonClassName,
}: {
  icon?: ReactNode;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  placeholder?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(() => setOpen(false));
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left text-sm font-semibold text-ink transition-all hover:border-brand-400 hover:shadow-[0_4px_16px_-6px_rgba(22,104,240,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
          open && "border-brand-500 ring-2 ring-brand-100",
          buttonClassName
        )}
      >
        {icon && <span className="text-brand-600">{icon}</span>}
        <span className={cn("flex-1 truncate", !selected && "text-slate-400 font-medium")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-2 max-h-64 origin-top overflow-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-brand-950/10 animate-pop no-scrollbar">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                o.value === value ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-slate-50"
              )}
            >
              <span>
                {o.label}
                {o.sub && <span className="ml-1.5 text-xs font-normal text-slate-400">{o.sub}</span>}
              </span>
              {o.value === value && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Stepper({
  label,
  sub,
  value,
  onChange,
  min = 0,
  max = 9,
}: {
  label: string;
  sub?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-bold tabular-nums text-ink">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className={cn("h-3.5 w-3.5", i <= Math.round(rating) ? "fill-sun" : "fill-slate-200")}
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
