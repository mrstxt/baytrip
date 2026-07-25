export type Category = "all" | "plyaj" | "shahar" | "tarix" | "lyuks";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "Barcha turlar" },
  { id: "plyaj", label: "Plyaj dam olishi" },
  { id: "shahar", label: "Shahar turlari" },
  { id: "tarix", label: "Tarixiy sayohat" },
  { id: "lyuks", label: "Lyuks turlar" },
];

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

export const TOURS: Tour[] = [
  {
    id: "dubai",
    title: "Dubai — cho'l va osmono'parlar",
    city: "Dubai",
    country: "BAA",
    flag: "🇦🇪",
    category: "shahar",
    days: 5,
    nights: 4,
    price: 890,
    oldPrice: 1050,
    rating: 4.8,
    reviews: 312,
    image:
      "https://images.pexels.com/photos/18341554/pexels-photo-18341554.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Eng ommabop",
    nextDates: ["14-iyun", "28-iyun", "12-iyul"],
    seatsLeft: 7,
    includes: ["Aviachipta (TAS–DXB)", "4★ mehmonxona", "Transfer", "Rus/o'zbek gid", "Nonushta", "Shahar ekskursiyasi"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan parvoz, mehmonxonaga joylashish, Marina bo'ylab kechki sayr." },
      { day: "2-kun", text: "Burj Xalifa (124-qavat), Dubai Mall va fontanlar shousi." },
      { day: "3-kun", text: "Cho'l safarisi: Jeep, qum chang'isi, BBQ kechki ovqat va raqs dasturi." },
      { day: "4-kun", text: "Eski Dubai: Oltin va ziravorlar bozorlari, abra qayig'i, plyajda dam olish." },
      { day: "5-kun", text: "Erkin kun va Toshkentga qaytish parvozi." },
    ],
  },
  {
    id: "istanbul",
    title: "Istanbul — ikki qit'a orasida",
    city: "Istanbul",
    country: "Turkiya",
    flag: "🇹🇷",
    category: "tarix",
    days: 6,
    nights: 5,
    price: 640,
    rating: 4.9,
    reviews: 528,
    image:
      "https://images.pexels.com/photos/12625341/pexels-photo-12625341.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Arzon narx",
    nextDates: ["10-iyun", "24-iyun", "8-iyul", "22-iyul"],
    seatsLeft: 12,
    includes: ["Aviachipta (TAS–IST)", "4★ mehmonxona", "Transfer", "Gid", "Nonushta", "Bosfor kruizi"],
    itinerary: [
      { day: "1-kun", text: "Parvoz, joylashish va Galata minorasi atrofidagi kechki sayr." },
      { day: "2-kun", text: "Ayasofya, Ko'k masjidi va Hipodrom — tarixiy yarim orol." },
      { day: "3-kun", text: "Topkapi saroyi va Grand Bozor'da savdo." },
      { day: "4-kun", text: "Bosfor bo'ylab yat kruizi va Osiyo qirg'og'ida Kadiko'y bozori." },
      { day: "5-kun", text: "Dolmabaxcha saroyi va Istiqlol ko'chasi, erkin vaqt." },
      { day: "6-kun", text: "Toshkentga qaytish." },
    ],
  },
  {
    id: "bali",
    title: "Bali — tropik jannat",
    city: "Bali",
    country: "Indoneziya",
    flag: "🇮🇩",
    category: "plyaj",
    days: 8,
    nights: 7,
    price: 1190,
    rating: 4.8,
    reviews: 241,
    image:
      "https://images.pexels.com/photos/14475016/pexels-photo-14475016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["18-iyun", "16-iyul"],
    seatsLeft: 5,
    includes: ["Aviachipta", "4★ villa", "Transfer", "Gid", "Nonushta", "2 ta ekskursiya"],
    itinerary: [
      { day: "1–2 kun", text: "Parvoz, Ubud'dagi villaga joylashish, dam olish va akklimatizatsiya." },
      { day: "3-kun", text: "Tegalalang guruch teraslari va Maymunlar o'rmoni." },
      { day: "4-kun", text: "Muqaddas buloq ibodatxonasi va kofe plantatsiyasi degustatsiyasi." },
      { day: "5–6 kun", text: "Nusa Penida oroli: Kelingking plyaji va snorkeling." },
      { day: "7-kun", text: "Uluwatu ibodatxonasida quyosh botishi va Kecak raqsi." },
      { day: "8-kun", text: "Toshkentga qaytish." },
    ],
  },
  {
    id: "maldives",
    title: "Maldiv — suv usti villalari",
    city: "Male",
    country: "Maldiv orollari",
    flag: "🇲🇻",
    category: "lyuks",
    days: 6,
    nights: 5,
    price: 1890,
    oldPrice: 2190,
    rating: 4.9,
    reviews: 156,
    image:
      "https://images.pexels.com/photos/3293192/pexels-photo-3293192.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Lyuks",
    nextDates: ["20-iyun", "18-iyul"],
    seatsLeft: 3,
    includes: ["Aviachipta", "5★ suv usti villa", "Speedboat transfer", "All inclusive", "Snorkeling jihozlari"],
    itinerary: [
      { day: "1-kun", text: "Parvoz, speedboat'da orolga o'tish, villada shampanski bilan kutib olish." },
      { day: "2–3 kun", text: "Uy rifida snorkeling, spa va plyajda to'liq dam olish." },
      { day: "4-kun", text: "Quyosh botishida delfinlar kruizi va qum banketida kechki ovqat." },
      { day: "5-kun", text: "Suv osti dunyosi: ixtiyoriy sho'ng'ish (diving) va baliq ovlash." },
      { day: "6-kun", text: "Toshkentga qaytish." },
    ],
  },
  {
    id: "santorini",
    title: "Santorini — Egey mo''jizasi",
    city: "Santorini",
    country: "Gretsiya",
    flag: "🇬🇷",
    category: "plyaj",
    days: 7,
    nights: 6,
    price: 1240,
    rating: 4.8,
    reviews: 189,
    image:
      "https://images.pexels.com/photos/15532990/pexels-photo-15532990.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Romantik",
    nextDates: ["25-iyun", "23-iyul"],
    seatsLeft: 6,
    includes: ["Aviachipta", "4★ mehmonxona (kaldera manzarasi)", "Transfer", "Nonushta", "Yaxta kruizi"],
    itinerary: [
      { day: "1-kun", text: "Parvoz va Oia qishlog'iga joylashish, dunyodagi eng chiroyli quyosh botishi." },
      { day: "2-kun", text: "Fira — Oia piyoda marshruti va vino degustatsiyasi." },
      { day: "3-kun", text: "Kaldera bo'ylab yaxta kruizi, issiq buloqlar va BBQ." },
      { day: "4–5 kun", text: "Qizil va qora plyajlar, Akrotiri qadimiy shahri." },
      { day: "6-kun", text: "Erkin kun: fotosessiya va mahalliy oshxona." },
      { day: "7-kun", text: "Toshkentga qaytish." },
    ],
  },
  {
    id: "tokyo",
    title: "Tokio — kelajak shahri",
    city: "Tokio",
    country: "Yaponiya",
    flag: "🇯🇵",
    category: "shahar",
    days: 8,
    nights: 7,
    price: 1590,
    rating: 4.8,
    reviews: 203,
    image:
      "https://images.pexels.com/photos/29518215/pexels-photo-29518215.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["30-iyun", "28-iyul"],
    seatsLeft: 8,
    includes: ["Aviachipta", "4★ mehmonxona", "JR Pass 7 kun", "Gid", "Nonushta"],
    itinerary: [
      { day: "1–2 kun", text: "Parvoz, Shibuya va Shinjuku neon tunlari, Meiji ibodatxonasi." },
      { day: "3-kun", text: "Asakusa, Senso-ji ibodatxonasi va Tokyo Skytree." },
      { day: "4-kun", text: "Fudzi tog'i va Xakone milliy bog'iga bir kunlik safar." },
      { day: "5-kun", text: "Akihabara, teamLab raqamli san'at muzeyi." },
      { day: "6-kun", text: "Kamakura: Buyuk Budda va okean bo'yi temir yo'li." },
      { day: "7-kun", text: "Ginza'da savdo va sushi master-klassi." },
      { day: "8-kun", text: "Toshkentga qaytish." },
    ],
  },
  {
    id: "rome",
    title: "Rim — abadiy shahar",
    city: "Rim",
    country: "Italiya",
    flag: "🇮🇹",
    category: "tarix",
    days: 6,
    nights: 5,
    price: 990,
    rating: 4.7,
    reviews: 267,
    image:
      "https://images.pexels.com/photos/12268343/pexels-photo-12268343.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["15-iyun", "13-iyul"],
    seatsLeft: 9,
    includes: ["Aviachipta", "4★ mehmonxona", "Transfer", "Gid", "Nonushta", "Vatikan chiptalari"],
    itinerary: [
      { day: "1-kun", text: "Parvoz va Trevi favvorasi yonidagi kechki sayr." },
      { day: "2-kun", text: "Kolizey, Rim forumi va Palatin tepaligi." },
      { day: "3-kun", text: "Vatikan: Avliyo Pyotr sobori va Sistina ibodatxonasi." },
      { day: "4-kun", text: "Pantheon, Navona maydoni va ispan zinapoyalari." },
      { day: "5-kun", text: "Pasta va pizza master-klassi, Trastevere'da oqshom." },
      { day: "6-kun", text: "Toshkentga qaytish." },
    ],
  },
  {
    id: "paris",
    title: "Parij — sevgi shahri",
    city: "Parij",
    country: "Fransiya",
    flag: "🇫🇷",
    category: "shahar",
    days: 6,
    nights: 5,
    price: 1120,
    rating: 4.7,
    reviews: 298,
    image:
      "https://images.pexels.com/photos/38523298/pexels-photo-38523298.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["22-iyun", "20-iyul"],
    seatsLeft: 10,
    includes: ["Aviachipta", "4★ mehmonxona", "Transfer", "Gid", "Nonushta", "Sena kruizi"],
    itinerary: [
      { day: "1-kun", text: "Parvoz va Eyfel minorasi yonidagi kechki piknik." },
      { day: "2-kun", text: "Luvr muzeyi va Tyuilri bog'i." },
      { day: "3-kun", text: "Monmartr, Sakre-Ker va rassomlar maydoni." },
      { day: "4-kun", text: "Versal saroyiga bir kunlik safar." },
      { day: "5-kun", text: "Sena bo'ylab kruiz, Notr-Dam va Lotin kvartali." },
      { day: "6-kun", text: "Toshkentga qaytish." },
    ],
  },
];

export const formatPrice = (n: number, currency: "usd" | "som" = "usd") =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (currency === "som" ? " so'm" : " $");

/* =========================================================================
   ICHKI TURIZM
   ========================================================================= */

export type DomesticCategory = "all" | "tarixiy" | "tabiat" | "qoshni";

export const DOMESTIC_CATEGORIES: { id: DomesticCategory; label: string }[] = [
  { id: "all", label: "Barchasi" },
  { id: "tarixiy", label: "Tarixiy meros" },
  { id: "tabiat", label: "Tabiat manzaralari" },
  { id: "qoshni", label: "Qo'shni davlatlar" },
];

export type DomesticTour = TourBase & { category: Exclude<DomesticCategory, "all"> };

export const DOMESTIC_TOURS: DomesticTour[] = [
  {
    id: "samarkand",
    title: "Samarqand — Sharq ko'zgusi",
    city: "Samarqand",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tarixiy",
    days: 3,
    nights: 2,
    price: 890000,
    currency: "som",
    rating: 4.9,
    reviews: 421,
    image:
      "https://images.pexels.com/photos/12827784/pexels-photo-12827784.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Eng sara",
    nextDates: ["15-iyun", "22-iyun", "29-iyun"],
    seatsLeft: 18,
    includes: ["Poyezd chiptasi (Afrosiyob)", "3★ mehmonxona", "Gid", "Nonushta", "Registon va Shohi Zinda"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan Afrosiyob poyezdida Samarqandga yetib kelish. Registon maydoni va kechki yoritilgan ko'rinish." },
      { day: "2-kun", text: "Shohi Zinda majmuasi, Bibi-Xonim masjidi va Siyob bozori. Milliy oshxona master-klassi." },
      { day: "3-kun", text: "Ulug'bek rasadxonasi va Toshkentga qaytish." },
    ],
  },
  {
    id: "khiva",
    title: "Xiva — Ipak yo'li durdonasi",
    city: "Xiva",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tarixiy",
    days: 3,
    nights: 2,
    price: 720000,
    currency: "som",
    rating: 4.8,
    reviews: 195,
    image:
      "https://images.pexels.com/photos/29647893/pexels-photo-29647893.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Meros",
    nextDates: ["18-iyun", "25-iyun"],
    seatsLeft: 12,
    includes: ["Poyezd chiptasi", "3★ mehmonxona", "Gid", "Nonushta", "Ichan-Qal'a muzeyi"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan parvoz, Ichan-Qal'a mudofaa devorlari bo'ylab sayr." },
      { day: "2-kun", text: "Toshhovli saroyi, Juma masjidi, minora va xon saroyi." },
      { day: "3-kun", text: "Erkin vaqt, qaytish parvozi." },
    ],
  },
  {
    id: "chimgan",
    title: "Chimyon — tog' havosi",
    city: "Chimyon",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tabiat",
    days: 2,
    nights: 1,
    price: 450000,
    currency: "som",
    rating: 4.7,
    reviews: 312,
    image:
      "https://images.pexels.com/photos/2104884/pexels-photo-2104884.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["8-iyun", "15-iyun", "22-iyun"],
    seatsLeft: 25,
    includes: ["Transfer", "3★ mehmonxona", "Nonushta", "Kabel yo'li", "Ekskursiya"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan Chimvonga yo'l, teleferik, tog' piyoda marshruti va kechki dam olish." },
      { day: "2-kun", text: "Erta tongda tog' sayri, nonushta va Toshkentga qaytish." },
    ],
  },
  {
    id: "issykul",
    title: "Issiqko'l — qirg'iziston marvari di",
    city: "Issiqko'l",
    country: "Qirg'iziston",
    flag: "🇰🇬",
    category: "qoshni",
    days: 5,
    nights: 4,
    price: 1590000,
    currency: "som",
    rating: 4.8,
    reviews: 167,
    image:
      "https://images.pexels.com/photos/1658961/pexels-photo-1658961.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Ommabop",
    nextDates: ["20-iyun", "11-iyul"],
    seatsLeft: 14,
    includes: ["Transfer", "Kurort mehmonxona", "Nonushta", "Plyaj jihozlari", "Ekskursiya"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan Bishkekka parvoz, ko'l bo'yiga transfer va joylashish." },
      { day: "2–3 kun", text: "To'liq plyaj, suv sporti, atrof-muhit sayrlari." },
      { day: "4-kun", text: "Jeti-Og'uz darasi va Qizil yarim orolga ekskursiya." },
      { day: "5-kun", text: "Bishkekka qaytish va Toshkentga parvoz." },
    ],
  },
  {
    id: "bukhara",
    title: "Buxoro — muqaddas shahar",
    city: "Buxoro",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tarixiy",
    days: 3,
    nights: 2,
    price: 780000,
    currency: "som",
    rating: 4.8,
    reviews: 276,
    image:
      "https://images.pexels.com/photos/2597144/pexels-photo-2597144.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["12-iyun", "19-iyun", "26-iyun"],
    seatsLeft: 16,
    includes: ["Poyezd chiptasi", "3★ mehmonxona", "Gid", "Nonushta", "Ark qal'asi va minorai Kalon"],
    itinerary: [
      { day: "1-kun", text: "Poyezd, Ark qal'asi va Buxoro osmoni bo'ylab kechki sayr." },
      { day: "2-kun", text: "Minorai Kalon, Miri Arab madrasasi, Toqi Sarrofon va Labi Hovuz ansambli." },
      { day: "3-kun", text: "Sitorai Mohi Xosa va Toshkentga qaytish." },
    ],
  },
  {
    id: "almaty",
    title: "Almati — olma poytaxti",
    city: "Almati",
    country: "Qozog'iston",
    flag: "🇰🇿",
    category: "qoshni",
    days: 4,
    nights: 3,
    price: 1350000,
    currency: "som",
    rating: 4.7,
    reviews: 134,
    image:
      "https://images.pexels.com/photos/20079209/pexels-photo-20079209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    nextDates: ["25-iyun", "16-iyul"],
    seatsLeft: 10,
    includes: ["Aviachipta", "3★ mehmonxona", "Transfer", "Nonushta", "Shimoliy Tyan-Shan ekskursiyasi"],
    itinerary: [
      { day: "1-kun", text: "Parvoz, Almati ko'chalari va Arbat bo'ylab sayr." },
      { day: "2-kun", text: "Medeu muz maydoni va Shimbulak tog' kurorti." },
      { day: "3-kun", text: "Költau ko'liga sayohat va mahalliy oshxona degustatsiyasi." },
      { day: "4-kun", text: "Erkin vaqt va Toshkentga qaytish." },
    ],
  },
];

/* =========================================================================
   FAQ va TESTIMONIALS
   ========================================================================= */

export type FaqItem = { q: string; a: string };
export type TestimonialItem = { name: string; quote: string; rating: number; trip: string; hue: string };

export const FAQS: FaqItem[] = [
  {
    q: "Tur paketiga aviachipta kiradimi?",
    a: "Ha, barcha xalqaro turlarimizda Toshkentdan borish-qaytish aviachiptasi narxga kiritilgan. Ichki turlarda esa transport turi (poyezd/avtobus/transfer) paketga qarab belgilanadi.",
  },
  {
    q: "Qanday to'lov shartlari bor?",
    a: "Oldindan 30% to'lov — qolgan qismini safar oldidan to'laysiz. Naqd, Payme, Click, Uzum bank yoki kartaga o'tkazma orqali to'lash mumkin.",
  },
  {
    q: "Viza va hujjatlar bilan yordam berasizmi?",
    a: "Viza talab qilinadigan davlatlar (BAA, Gretsiya, Italiya) uchun to'liq hujjat yig'ish va viza markaziga yo'llashda bepul yordam beramiz.",
  },
  {
    q: "Safarni bekor qilish yoki o'zgartirish mumkinmi?",
    a: "Ha, safarga 14 kundan ortiq vaqt bo'lsa 100% qaytarib beramiz. 7–13 kun oralig'ida 50% qaytariladi. 7 kundan kam — to'lov qaytarilmaydi.",
  },
  {
    q: "Bolalar uchun chegirma bormi?",
    a: "6 yoshgacha bo'lgan bolalar — bepul (o'rin yo'q). 6–12 yosh — 50% chegirma. 12 yoshdan kattalar to'liq narx.",
  },
  {
    q: "Ofisingiz qayerda joylashgan?",
    a: "Toshkent shahri, Amir Temur shoh ko'chasi 12-uy. Dushanba–Shanba, 10:00 – 19:00 gacha ishlaymiz.",
  },
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Malika Salimova",
    quote: "Dubay safarimiz juda zo'r o'tdi! Hamma narsa aniq va o'z vaqtida edi. Gid mas'uliyatli va do'stona munosabatda bo'ldi. Albatta yana murojaat qilamiz.",
    rating: 5,
    trip: "Dubai 2024",
    hue: "bg-rose-500",
  },
  {
    name: "Jahongir Azizov",
    quote: "Istanbul turi bilan juda mamnunman. Narx sifat jihatidan eng yaxshi variant. Bosfor kruizi alohida taassurot qoldirdi. Hamma do'stlarimga tavsiya qilaman.",
    rating: 5,
    trip: "Istanbul 2024",
    hue: "bg-amber-600",
  },
  {
    name: "Dildora Rahimova",
    quote: "Bali — bu orzu edi va bayTrip uni ro'yobga chiqardi. Villadagi xizmat, ekskursiyalar, gid — hammasi ajoyib edi. Keng ko'ngil va professional jamoa.",
    rating: 5,
    trip: "Bali 2024",
    hue: "bg-emerald-600",
  },
  {
    name: "Shohruh Mirzayev",
    quote: "Birinchi marta travel agentlikdan foydalandim. Samarqand safari juda yaxshi tashkil qilingan. Qaytib kelgach, Dubayga ham bron qildim.",
    rating: 4.5,
    trip: "Samarqand 2024",
    hue: "bg-brand-600",
  },
  {
    name: "Zarina Karimova",
    quote: "Maldiv orollari — beqiyos go'zallik. bayTrip barcha tashkiliy masalalarni hal qildi. Suv usti villasi, speedboat va xizmat — 10/10!",
    rating: 5,
    trip: "Maldiv 2024",
    hue: "bg-sky-600",
  },
  {
    name: "Bobur Xasanov",
    quote: "Rim va Vatikan — tarix muxlislari uchun eng yaxshi tur. Gidimiz juda bilimdon va qiziqarli edi. Tashkilotchilikka 5 yulduz.",
    rating: 4.5,
    trip: "Rim 2024",
    hue: "bg-indigo-600",
  },
];

/* =========================================================================
   OBUNA (SUBSCRIPTION) PLANLARI — 3, 6, 12 oylik
   ========================================================================= */

export type SubscriptionPlan = {
  months: number;
  label: string;
  sublabel: string;
  pricePerMonth: number;
  totalPrice: number;
  savings: string;
  popular?: boolean;
  features: string[];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    months: 3,
    label: "3 oylik",
    sublabel: "Boshlang'ich",
    pricePerMonth: 49,
    totalPrice: 147,
    savings: "10%",
    features: [
      "Har oyda 1 ta tur bo'yicha maksimal chegirma",
      "Yangi yo'nalishlar haqida birinchi bo'lib xabar olish",
      "Telegram kanalga maxsus kirish",
      "24/7 onlayn yordam",
      "Shaxsiy menejer",
    ],
  },
  {
    months: 6,
    label: "6 oylik",
    sublabel: "Oltin",
    pricePerMonth: 39,
    totalPrice: 234,
    savings: "20%",
    popular: true,
    features: [
      "Har oyda 2 ta tur bo'yicha maksimal chegirma",
      "Yangi yo'nalishlar va maxsus aksiyalar haqida oldindan xabar",
      "Telegram kanalga to'liq kirish + maxsus chat",
      "24/7 onlayn yordam + shaxsiy konsyerj",
      "Barcha turlarda 5% qo'shimcha chegirma",
      "Sayohat sug'urtasida 15% chegirma",
    ],
  },
  {
    months: 12,
    label: "12 oylik",
    sublabel: "Premium",
    pricePerMonth: 29,
    totalPrice: 348,
    savings: "40%",
    features: [
      "Har oyda 4 ta tur bo'yicha maksimal chegirma",
      "VIP yangiliklar va eksklyuziv takliflar",
      "Telegram kanalga to'liq kirish + VIP chat + menejer",
      "24/7 shaxsiy konsyerj xizmati",
      "Barcha turlarda 10% qo'shimcha chegirma",
      "Sayohat sug'urtasida 30% chegirma",
      "Aeroportdan bepul transfer (yiliga 2 marta)",
      "Tug'ilgan kun sovg'asi — bepul tur sertifikati",
    ],
  },
];

/* =========================================================================
   TUR ANALITIKASI UCHUN MA'LUMOTLAR
   ========================================================================= */

export type AnalysisData = {
  tourId: string;
  tourName: string;
  flag: string;
  monthlyBookings: number[];
  yearlyRevenue: number;
  avgRating: number;
  totalBookings: number;
  growth: number; // percentage
  color: string;
};

export const TOUR_ANALYSIS_DATA: AnalysisData[] = [
  {
    tourId: "dubai",
    tourName: "Dubai",
    flag: "🇦🇪",
    monthlyBookings: [42, 48, 55, 62, 78, 95, 112, 108, 87, 72, 58, 49],
    yearlyRevenue: 487000,
    avgRating: 4.8,
    totalBookings: 866,
    growth: 18.5,
    color: "#f97a1f",
  },
  {
    tourId: "istanbul",
    tourName: "Istanbul",
    flag: "🇹🇷",
    monthlyBookings: [58, 62, 71, 85, 102, 124, 138, 142, 115, 94, 76, 61],
    yearlyRevenue: 589000,
    avgRating: 4.9,
    totalBookings: 1128,
    growth: 22.3,
    color: "#1668f0",
  },
  {
    tourId: "bali",
    tourName: "Bali",
    flag: "🇮🇩",
    monthlyBookings: [28, 32, 38, 45, 58, 72, 85, 82, 66, 52, 40, 31],
    yearlyRevenue: 421000,
    avgRating: 4.8,
    totalBookings: 629,
    growth: 15.8,
    color: "#21d0f0",
  },
  {
    tourId: "maldives",
    tourName: "Maldiv",
    flag: "🇲🇻",
    monthlyBookings: [18, 22, 28, 35, 48, 58, 68, 65, 52, 38, 28, 20],
    yearlyRevenue: 512000,
    avgRating: 4.9,
    totalBookings: 480,
    growth: 12.4,
    color: "#ffc21a",
  },
  {
    tourId: "santorini",
    tourName: "Santorini",
    flag: "🇬🇷",
    monthlyBookings: [12, 15, 22, 38, 52, 65, 78, 72, 55, 42, 28, 16],
    yearlyRevenue: 348000,
    avgRating: 4.8,
    totalBookings: 495,
    growth: 20.1,
    color: "#f97a1f",
  },
  {
    tourId: "tokyo",
    tourName: "Tokio",
    flag: "🇯🇵",
    monthlyBookings: [22, 25, 32, 38, 45, 52, 58, 62, 55, 48, 38, 28],
    yearlyRevenue: 489000,
    avgRating: 4.8,
    totalBookings: 503,
    growth: 14.2,
    color: "#ff3b30",
  },
];
