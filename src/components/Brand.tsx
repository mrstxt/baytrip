import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

/** bayTrip logotipi — palm daraxti kvadrat ichida (brend rasmdagi kabi) */
export function BayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <rect x="7" y="7" width="50" height="50" rx="17" stroke="currentColor" strokeWidth="4.5" />
      <g fill="currentColor">
        <path d="M30.3 28.2c-5.2-4-12-3.4-16 1.7 4.8 3.2 12 2.4 16-1.7z" />
        <path d="M33.7 28.2c5.2-4 12-3.4 16 1.7-4.8 3.2-12 2.4-16-1.7z" />
        <path d="M30.7 25.1c-1.5-4.8-6-7.5-10.8-6.7 1 4.6 6 7.7 10.8 6.7z" />
        <path d="M33.3 25.1c1.5-4.8 6-7.5 10.8-6.7-1 4.6-6 7.7-10.8 6.7z" />
        <path d="M30.8 28.4h2.4l-.9 17.2c-.7.6-1.9.6-2.6 0l1.1-17.2z" />
      </g>
    </svg>
  );
}

export function BrandLogo({
  className,
  imageClassName,
  markClassName,
  showName = true,
  theme = "light",
}: {
  className?: string;
  imageClassName?: string;
  markClassName?: string;
  showName?: boolean;
  theme?: "hero" | "light" | "dark";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const nameAccent =
    theme === "hero" ? "text-sun" : theme === "dark" ? "text-aqua" : "text-brand-600";

  if (!imageFailed) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <img
          src="/logo.png"
          alt="bayTrip"
          className={cn("h-10 w-auto max-w-[152px] object-contain", imageClassName)}
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full",
          theme === "hero" ? "bg-white text-brand-600" : "bg-brand-600 text-white",
          markClassName
        )}
      >
        <BayMark className="h-6 w-6" />
      </span>
      {showName && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          bay<span className={nameAccent}>Trip</span>
        </span>
      )}
    </span>
  );
}

/** Brendning "gapiruvchi pufakcha" ikonkalari — globus, palma, samolyot, tog' */
export function Bubble({
  color,
  iconColor = "text-white",
  tail = "bl",
  className,
  children,
}: {
  color: string;
  iconColor?: string;
  tail?: "bl" | "br" | "tl" | "tr";
  className?: string;
  children: ReactNode;
}) {
  const tailPos = {
    bl: "-bottom-1 left-5",
    br: "-bottom-1 right-5",
    tl: "-top-1 left-5",
    tr: "-top-1 right-5",
  }[tail];
  return (
    <div className={cn("relative grid place-items-center rounded-full", color, className)}>
      <span className={iconColor}>{children}</span>
      <span className={cn("absolute h-3.5 w-3.5 rotate-45 rounded-[3px]", color, tailPos)} />
    </div>
  );
}

/** Kamalak yoyi — brend bezagi */
export function RainbowArc({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path d="M20 180a150 150 0 0 1 150-150" stroke="#ffc21a" strokeWidth="17" strokeLinecap="round" />
      <path d="M50 180a120 120 0 0 1 120-120" stroke="#f9a825" strokeWidth="17" strokeLinecap="round" />
      <path d="M80 180a90 90 0 0 1 90-90" stroke="#f97a1f" strokeWidth="17" strokeLinecap="round" />
    </svg>
  );
}

/** Brend fon naqshi — palma barglari va to'lqin yoylari (identika uslubida) */
export function BrandPattern({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 400" fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <g stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity="0.5">
        <path d="M-20 380a170 170 0 0 1 170-170" />
        <path d="M20 380a130 130 0 0 1 130-130" />
        <path d="M60 380a90 90 0 0 1 90-90" />
      </g>
      <g stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity="0.35">
        <path d="M620 20a170 170 0 0 0-170 170" />
        <path d="M580 20a130 130 0 0 0-130 130" />
      </g>
      <g fill="currentColor" opacity="0.3">
        <circle cx="470" cy="330" r="26" />
        <circle cx="120" cy="70" r="18" />
        <circle cx="300" cy="180" r="10" />
      </g>
    </svg>
  );
}

export function Wave({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 80"
      fill="currentColor"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d="M0 80h1440V30c-190 32-430 48-720 48S190 62 0 30v50z" />
    </svg>
  );
}
