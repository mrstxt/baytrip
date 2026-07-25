import { useState } from "react";
import { ArrowRight, RefreshCw, Target } from "lucide-react";
import { DOMESTIC_TOURS, TOURS, formatPrice, type TourBase } from "../data";
import Reveal from "./Reveal";
import TourModal from "./TourModal";

type Region = "xalqaro" | "ichki" | "qoshni" | "";
type Answers = {
  region: Region;
  type: string;
  days: number;
  budget: number;
  month: string;
};

const getBudgetOptions = (region: Region) => {
  if (region === "xalqaro") {
    return [
      { value: 700, label: "700$ dan boshlab" },
      { value: 1000, label: "700–1000$" },
      { value: 1500, label: "1000–1500$" },
      { value: 2500, label: "1500$+" },
    ];
  }
  return [
    { value: 500000, label: "500.000 so'mdan boshlab" },
    { value: 900000, label: "500–900 ming so'm" },
    { value: 1500000, label: "900 ming – 1.5 mln so'm" },
    { value: 2500000, label: "1.5 mln so'm+" },
  ];
};

const QUESTIONS = (region: Region) => [
  {
    key: "type" as const,
    title: "Qanday dam olishni afzal ko'rasiz?",
    options: [
      { value: "plyaj", label: "Dengiz va plyaj" },
      { value: "tarix", label: "Tarixiy shaharlar" },
      { value: "tabiat", label: "Tog' va tabiat" },
      { value: "shahar", label: "Zamonaviy shaharlar" },
      { value: "lyuks", label: "Lyuks dam olish" },
    ],
  },
  {
    key: "days" as const,
    title: "Sayohat qancha kun davom etsin?",
    options: [
      { value: 3, label: "3 kun" },
      { value: 5, label: "5 kun" },
      { value: 7, label: "7 kun" },
      { value: 10, label: "10+ kun" },
    ],
  },
  {
    key: "budget" as const,
    title: "Byudjet (1 kishi uchun)",
    options: getBudgetOptions(region),
  },
  {
    key: "month" as const,
    title: "Qaysi oyda sayohat qilmoqchisiz?",
    options: [
      { value: "yoz", label: "Iyun–Avgust" },
      { value: "kuz", label: "Sentabr–Noyabr" },
      { value: "qish", label: "Dekabr–Fevral" },
      { value: "bahor", label: "Mart–May" },
    ],
  },
];

export default function TourAnalyzer() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    region: "",
    type: "",
    days: 5,
    budget: 900,
    month: "",
  });
  const [result, setResult] = useState<TourBase[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [selectedTour, setSelectedTour] = useState<TourBase | null>(null);

  const isFirstStep = step === 0 && answers.region === "";
  const currentRegion = answers.region;
  const questions = QUESTIONS(currentRegion);
  const current = isFirstStep
    ? {
        key: "region" as const,
        title: "Qayerga sayohat qilishni xohlaysiz?",
        options: [
          { value: "xalqaro", label: "Chet el (Dubai, Bali, Italiya...)" },
          { value: "ichki", label: "O'zbekiston (Samarqand, Buxoro...)" },
          { value: "qoshni", label: "Qo'shni davlatlar (Qirg'iziston, Qozog'iston...)" },
        ],
      }
    : questions[step - 1];

  const handleAnswer = (value: string | number) => {
    if (isFirstStep) {
      const newAnswers = { ...answers, region: value as Region };
      setAnswers(newAnswers);
      setStep(1);
      return;
    }

    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);

    if (step < questions.length) {
      setStep(step + 1);
    } else {
      const matched = calculateRecommendations(newAnswers);
      setResult(matched);
      setFeedback(generateFeedback(newAnswers, matched));
    }
  };

  const calculateRecommendations = (a: Answers): TourBase[] => {
    let pool: TourBase[] = [];
    if (a.region === "xalqaro") pool = TOURS;
    else if (a.region === "ichki") pool = DOMESTIC_TOURS.filter((t) => t.country === "O'zbekiston");
    else if (a.region === "qoshni") pool = DOMESTIC_TOURS.filter((t) => t.country !== "O'zbekiston");
    else pool = [...TOURS, ...DOMESTIC_TOURS];

    return pool
      .filter((t) => {
        const price = t.currency === "som" ? t.price / 12800 : t.price;
        const budgetOk = price <= a.budget + 200;
        const daysOk = Math.abs(t.days - a.days) <= 4;
        const typeOk =
          a.type === "" ||
          t.title.toLowerCase().includes(a.type) ||
          (t as any).category?.includes(a.type);
        return budgetOk && daysOk && typeOk;
      })
      .sort((a, b) => a.price - b.price)
      .slice(0, 6);
  };

  const generateFeedback = (a: Answers, tours: TourBase[]): string[] => {
    const msgs: string[] = [];
    if (tours.length > 0) {
      msgs.push(`${tours.length} ta tur sizning talablaringizga mos keldi.`);
    } else {
      msgs.push("Aniq moslik topilmadi, lekin quyidagi variantlarni ko'rib chiqing.");
    }
    if (a.region === "xalqaro" && a.budget < 700) {
      msgs.push("Chet el turlari uchun byudjetni kamida 700$ qilish tavsiya etiladi.");
    }
    if ((a.region === "ichki" || a.region === "qoshni") && a.budget < 500000) {
      msgs.push("Ichki va qo'shni davlat turlari 500.000 so'mdan boshlanadi.");
    }
    return msgs;
  };

  const reset = () => {
    setStep(0);
    setAnswers({ region: "", type: "", days: 5, budget: 900, month: "" });
    setResult([]);
    setFeedback([]);
  };

  return (
    <section id="tur-analizi" className="scroll-mt-24 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700">
          <Target className="h-3.5 w-3.5" /> Smart tavsiya (Beta)
        </div>
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-5xl">
          Sizga mos turni topamiz
        </h2>
        <p className="mt-3 text-lg text-ink-soft">
          Bir necha savolga javob bering — biz sizga eng mos turlarni tavsiya qilamiz.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl px-4 sm:px-6">
        {result.length === 0 ? (
          <div className="rounded-3xl bg-surface p-8 ring-1 ring-black/5">
            <div className="mb-6 flex justify-between text-xs font-bold text-ink-soft">
              <span>SAVOL {step + 1} / {QUESTIONS(currentRegion).length + 1}</span>
              <span>{Math.round((step / (QUESTIONS(currentRegion).length + 1)) * 100)}%</span>
            </div>

            <h3 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              {current.title}
            </h3>

            <div className="mt-8 grid gap-3">
              {current.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt.value)}
                  className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-6 py-4 text-left text-sm font-semibold transition hover:border-brand-400 hover:bg-brand-50 active:scale-[0.985]"
                >
                  {opt.label}
                  <ArrowRight className="h-4 w-4 text-brand-400" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Reveal>
            <div className="rounded-3xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-200">
              <h3 className="font-display text-2xl font-extrabold text-emerald-800">
                Sizga {result.length} ta tur tavsiya qilamiz
              </h3>
              {feedback.length > 0 && (
                <div className="mt-3 space-y-1 text-sm text-emerald-700">
                  {feedback.map((f, i) => (
                    <p key={i}>{f}</p>
                  ))}
                </div>
              )}
            </div>

            {result.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {result.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTour(t)}
                    className="group rounded-2xl bg-white p-5 text-left ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-lg font-extrabold tracking-tight text-ink">{t.title}</p>
                        <p className="text-sm text-ink-soft">{t.city}, {t.country}</p>
                      </div>
                      <span className="font-display text-xl font-extrabold text-emerald-700">
                        {formatPrice(t.price, t.currency)}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-ink-soft">
                      {t.days} kun / {t.nights} tun · {t.rating} ★
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl bg-amber-50 p-6 text-center ring-1 ring-amber-200">
                <p className="font-semibold text-amber-800">Aniq moslik topilmadi.</p>
                <p className="mt-1 text-sm text-amber-700">Quyidagi variantlarni ko'rib chiqing yoki byudjetni oshiring.</p>
              </div>
            )}

            <button
              onClick={reset}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <RefreshCw className="h-4 w-4" /> Qayta boshlash
            </button>
          </Reveal>
        )}
      </div>

      {selectedTour && <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} />}
    </section>
  );
}
