"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  BarChart3,
  Calendar,
  Eye,
  Globe,
  Star,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import { TOUR_ANALYSIS_DATA, TOURS, type AnalysisData } from "@/lib/data";
import { cn } from "@/lib/cn";
import { BrandPattern } from "./Brand";
import Reveal from "./Reveal";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function MiniBar({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px]">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-[6px] rounded-t-[3px] transition-all duration-500 hover:opacity-80"
          style={{
            height: `${(v / max) * height}px`,
            background: color,
            opacity: 0.5 + (v / max) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold",
            trend >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          )}>
            {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-sm font-medium text-ink-soft">{label}</p>
    </div>
  );
}

export default function TourAnalysis() {
  const [selectedTour, setSelectedTour] = useState<string>(TOUR_ANALYSIS_DATA[0]?.tourId || "");

  const stats = useMemo(() => {
    const totalBookings = TOUR_ANALYSIS_DATA.reduce((s, t) => s + t.totalBookings, 0);
    const totalRevenue = TOUR_ANALYSIS_DATA.reduce((s, t) => s + t.yearlyRevenue, 0);
    const avgRating = TOUR_ANALYSIS_DATA.reduce((s, t) => s + t.avgRating, 0) / TOUR_ANALYSIS_DATA.length;
    const avgGrowth = TOUR_ANALYSIS_DATA.reduce((s, t) => s + t.growth, 0) / TOUR_ANALYSIS_DATA.length;
    return { totalBookings, totalRevenue, avgRating, avgGrowth };
  }, []);

  const current = TOUR_ANALYSIS_DATA.find((t) => t.tourId === selectedTour);

  return (
    <section id="analiz" className="relative scroll-mt-24 overflow-hidden bg-surface py-20 sm:py-28">
      <BrandPattern className="pointer-events-none absolute -left-28 -top-16 h-72 w-72 text-brand-200/50" />
      <BrandPattern className="pointer-events-none absolute -right-28 bottom-20 h-80 w-80 rotate-180 text-sun/15" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Tur analitikasi
          </p>
          <h2 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
            Statistik <span className="text-brand-600">ko'rsatkichlar</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-ink-soft">
            Yo'nalishlar bo'yicha batafsil tahlil — eng ommabop turlar, oylik bandlovlar 
            va daromad dinamikasi.
          </p>
        </Reveal>

        {/* Stats cards row */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Reveal delay={0}>
            <StatCard
              icon={Globe}
              label="Jami bandlovlar"
              value={stats.totalBookings.toLocaleString()}
              trend={12}
              color="bg-gradient-to-br from-brand-500 to-brand-700"
            />
          </Reveal>
          <Reveal delay={60}>
            <StatCard
              icon={DollarSign}
              label="Yillik daromad"
              value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
              trend={18}
              color="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
          </Reveal>
          <Reveal delay={120}>
            <StatCard
              icon={Star}
              label="O'rtacha reyting"
              value={stats.avgRating.toFixed(1)}
              trend={5}
              color="bg-gradient-to-br from-sun to-tangerine"
            />
          </Reveal>
          <Reveal delay={180}>
            <StatCard
              icon={TrendingUp}
              label="O'rtacha o'sish"
              value={`${stats.avgGrowth.toFixed(1)}%`}
              trend={stats.avgGrowth}
              color="bg-gradient-to-br from-aqua to-brand-600"
            />
          </Reveal>
        </div>

        {/* Tour selector and chart */}
        <Reveal className="mt-12">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-black/[0.06] sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-extrabold text-ink">
                  Oylik bandlovlar dinamikasi
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Har bir yo'nalish bo'yicha oylik bron qilingan turlar soni
                </p>
              </div>
              {/* Tour pills */}
              <div className="flex flex-wrap gap-2">
                {TOUR_ANALYSIS_DATA.map((t) => (
                  <button
                    key={t.tourId}
                    onClick={() => setSelectedTour(t.tourId)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold transition-all active:scale-95",
                      selectedTour === t.tourId
                        ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30"
                        : "bg-surface text-ink-soft hover:text-ink"
                    )}
                  >
                    <span className="text-base">{t.flag}</span>
                    {t.tourName}
                  </button>
                ))}
              </div>
            </div>

            {current && (
              <div className="mt-8">
                {/* Chart area */}
                <div className="relative rounded-2xl bg-mist p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{current.flag}</span>
                      <div>
                        <h4 className="font-display text-lg font-extrabold text-ink">{current.tourName}</h4>
                        <p className="text-sm text-ink-soft">
                          {current.totalBookings} ta bandlov · ${(current.yearlyRevenue / 1000).toFixed(0)}K daromad
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <ArrowUp className="h-4 w-4" />
                        {current.growth}% o'sish
                      </span>
                      <span className="flex items-center gap-1.5 text-brand-600">
                        <Star className="h-4 w-4 fill-sun text-sun" />
                        {current.avgRating}
                      </span>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="mt-6">
                    <div className="flex items-end justify-between">
                      {current.monthlyBookings.map((v, i) => {
                        const max = Math.max(...current.monthlyBookings);
                        const height = (v / max) * 180;
                        return (
                          <div key={i} className="group relative flex flex-col items-center gap-1.5">
                            <span className="opacity-0 transition-opacity group-hover:opacity-100 text-[11px] font-extrabold text-brand-600">
                              {v}
                            </span>
                            <div
                              className="w-[18px] rounded-t-[6px] transition-all duration-500 group-hover:brightness-110 sm:w-[24px]"
                              style={{
                                height: `${Math.max(height, 4)}px`,
                                background: current.color,
                                opacity: v / max,
                              }}
                            />
                            <span className="text-[10px] font-bold text-slate-400">{MONTHS[i]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick stats for selected tour */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Calendar, label: "Yillik bandlov", value: current.totalBookings.toString() },
                    { icon: Users, label: "O'rtacha oylik", value: Math.round(current.totalBookings / 12).toString() },
                    { icon: DollarSign, label: "Daromad", value: `$${(current.yearlyRevenue / 1000).toFixed(0)}K` },
                    { icon: Eye, label: "Reyting", value: current.avgRating.toString() },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-mist p-4 text-center">
                      <s.icon className="mx-auto h-5 w-5 text-brand-600" />
                      <p className="mt-2 font-display text-xl font-extrabold text-ink">{s.value}</p>
                      <p className="text-xs font-medium text-ink-soft">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* All tours mini comparison */}
        <Reveal className="mt-10">
          <div className="rounded-[32px] bg-white p-6 ring-1 ring-black/[0.06] sm:p-8">
            <h3 className="font-display text-xl font-extrabold text-ink">
              Barcha yo'nalishlar taqqoslash
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Har bir yo'nalish bo'yicha yillik bandlov va daromad ko'rsatkichlari
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4">Yo'nalish</th>
                    <th className="pb-3 pr-4">Bandlovlar</th>
                    <th className="pb-3 pr-4">Daromad</th>
                    <th className="pb-3 pr-4">O'sish</th>
                    <th className="pb-3 pr-4">Reyting</th>
                    <th className="pb-3">Trend (12 oy)</th>
                  </tr>
                </thead>
                <tbody>
                  {TOUR_ANALYSIS_DATA.map((t, i) => (
                    <tr key={t.tourId} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{t.flag}</span>
                          <span className="font-bold text-ink">{t.tourName}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-ink">{t.totalBookings.toLocaleString()}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-semibold text-emerald-700">${(t.yearlyRevenue / 1000).toFixed(0)}K</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-extrabold",
                          t.growth >= 15 ? "bg-emerald-100 text-emerald-700" : "bg-brand-100 text-brand-700"
                        )}>
                          <ArrowUp className="h-3 w-3" />
                          {t.growth}%
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          <Star className="h-3.5 w-3.5 fill-sun text-sun" />
                          {t.avgRating}
                        </span>
                      </td>
                      <td className="py-4">
                        <MiniBar data={t.monthlyBookings} color={t.color} height={32} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
