export type Category = "all" | "plyaj" | "shahar" | "tarix" | "lyuks";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "Barcha turlar" },
  { id: "plyaj", label: "Plyaj dam olishi" },
  { id: "shahar", label: "Shahar turlari" },
  { id: "tarix", label: "Tarixiy sayohat" },
  { id: "lyuks", label: "Lyuks turlar" },
];

/** Ikkala (xalqaro/ichki) tur turi uchun umumiy shakl — TourModal shu asosda ishlaydi */
export type TourBase = {
  id: string;
  title: string;
  city: string;
  country: string;
  flag: string;
  days: number;
  nights: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  tag?: string;
  nextDates: string[];
  seatsLeft: number;
  includes: string[];
  itinerary: { day: string; text: string }[];
  currency?: "usd" | "som";
};

export type Tour = TourBase & { category: Exclude<Category, "all"> };

export const TOURS: Tour[] = [];

export const formatPrice = (n: number, currency: "usd" | "som" = "usd") =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (currency === "som" ? " so'm" : " $");

/* =========================================================================
   ICHKI TURIZM — O'zbekiston va Markaziy Osiyo bo'ylab tur paketlari
   (Instagram: @baytrip.uz)
   ========================================================================= */

export type DomesticCategory = "all" | "tarixiy" | "tabiat" | "qoshni";

export const DOMESTIC_CATEGORIES: { id: DomesticCategory; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "tarixiy", label: "Tarixiy shaharlar" },
  { id: "tabiat", label: "Tog' va tabiat" },
  { id: "qoshni", label: "Qo'shni davlatlar" },
];

export type DomesticTour = TourBase & { category: Exclude<DomesticCategory, "all"> };

export const DOMESTIC_TOURS: DomesticTour[] = [];

export const TESTIMONIALS = [
  {
    name: "Dilnoza Rahimova",
    trip: "Dubai turi, aprel 2025",
    quote:
      "Hamma narsa daqiq tashkil qilingan: parvoz, mehmonxona, gid — hammasi vaqtida. Cho'l safarisi umrbod esda qoladi!",
    rating: 5,
    hue: "bg-brand-600",
  },
  {
    name: "Jasur Toshpo'latov",
    trip: "Istanbul turi, may 2025",
    quote:
      "Narxi boshqa agentliklardan ancha arzon, xizmat esa ikki barobar yaxshi. Bosfor kruizi — alohida rahmat!",
    rating: 5,
    hue: "bg-tangerine",
  },
  {
    name: "Malika Yusupova",
    trip: "Maldiv, to'y sayohati",
    quote:
      "Asal oyimizni bayTrip bilan o'tkazdik. Suv usti villa orzudek edi. Hujjatlar bilan ham to'liq yordam berishdi.",
    rating: 5,
    hue: "bg-aqua",
  },
  {
    name: "Sardor Aliyev",
    trip: "Tokio turi, mart 2025",
    quote:
      "Yaponiya vizasi bilan bosh qotirmadik — hammasini o'zlari halleti. Gidimiz ajoyib inson, til biladi.",
    rating: 4,
    hue: "bg-sun",
  },
];

export const FAQS = [
  {
    q: "Tur narxiga nimalar kiradi?",
    a: "Odatda narxga aviachipta (Toshkentdan), tanlangan toifadagi mehmonxona, aeroport transferlari, nonushta va dasturdagi ekskursiyalar kiradi. Har bir tur sahifasida 'Narxga kiradi' ro'yxati to'liq ko'rsatilgan.",
  },
  {
    q: "To'lovni qanday amalga oshiraman?",
    a: "Bron qilish uchun 30% oldindan to'lov yetarli, qolgani safardan 14 kun oldin to'lanadi. Naqd, plastik karta yoki bank o'tkazmasi orqali to'lash mumkin. Barcha to'lovlar shartnoma asosida.",
  },
  {
    q: "Viza hujjatlarida yordam berasizlarmi?",
    a: "Ha. BAA, Turkiya, Maldiv kabi yo'nalishlarda viza kerak emas yoki onlayn rasmiylashtiriladi. Yaponiya, Shengen kabi yo'nalishlarda hujjatlar to'plamini tayyorlashda to'liq ko'mak beramiz va suhbatga yozamiz.",
  },
  {
    q: "Turni bekor qilsam pulim qaytadimi?",
    a: "Safarga 30 kun qolganda bepul bekor qilish mumkin. Keyingi muddatlarda mehmonxona va aviakompaniya shartlariga qarab qisman qaytariladi — shu sababli sug'urta qilishni tavsiya etamiz.",
  },
  {
    q: "Guruh bo'lib borsak chegirma bormi?",
    a: "Albatta! 6 kishidan ortiq guruhlar uchun 5–10%, yangi turmush qurganlarga asal oyi paketlarida maxsus narx beramiz. Menejerimiz bilan bog'laning.",
  },
];
