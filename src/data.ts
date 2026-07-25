export type Category = "all" | "plyaj" | "shahar" | "tarix" | "lyuks";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "Barcha turlar" },
  { id: "plyaj", label: "Plyaj dam olishi" },
  { id: "shahar", label: "Shahar turlari" },
  { id: "tarix", label: "Tarixiy sayohat" },
  { id: "lyuks", label: "Lyuks turlar" },
];

export type Tour = {
  id: string;
  title: string;
  city: string;
  country: string;
  flag: string;
  category: Exclude<Category, "all">;
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
};

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

export const formatPrice = (n: number) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $";

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
