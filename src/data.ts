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

export const DOMESTIC_TOURS: DomesticTour[] = [
  {
    id: "samarqand",
    title: "Samarqand — Registon sirlari",
    city: "Samarqand",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tarixiy",
    days: 2,
    nights: 1,
    price: 690000,
    oldPrice: 850000,
    rating: 4.9,
    reviews: 412,
    image:
      "https://images.pexels.com/photos/16386337/pexels-photo-16386337.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Eng ommabop",
    currency: "som",
    nextDates: ["Har shanba", "Har yakshanba"],
    seatsLeft: 9,
    includes: ["Yo'l-yo'lakay transport", "Mehmonxona", "Nonushta", "Gid xizmati", "Kirish chiptalari"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan yo'lga chiqish, Registon maydoni, Sherdor va Tillakori madrasalari." },
      { day: "1-kun, kechqurun", text: "Sioh bozor va milliy taomlar bilan tanishuv, mehmonxonaga joylashish." },
      { day: "2-kun", text: "Gur-Amir maqbarasi, Bibixonim masjidi, Shohi Zinda ansambli va Toshkentga qaytish." },
    ],
  },
  {
    id: "buxoro",
    title: "Buxoro — Ipak yo'li marvaridi",
    city: "Buxoro",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tarixiy",
    days: 3,
    nights: 2,
    price: 990000,
    rating: 4.8,
    reviews: 287,
    image:
      "https://images.pexels.com/photos/36771067/pexels-photo-36771067.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    currency: "som",
    nextDates: ["Har juma", "Har chorshanba"],
    seatsLeft: 11,
    includes: ["Poyezd chiptasi (Afrosiyob)", "Mehmonxona", "Nonushta", "Gid xizmati", "Kirish chiptalari"],
    itinerary: [
      { day: "1-kun", text: "Afrosiyob tezyurar poyezdida Buxoroga yetib borish, Lyabi Xovuz majmuasi." },
      { day: "2-kun", text: "Ark qal'asi, Kalon minorasi va masjidi, Toqi Zargaron savdo gumbazlari." },
      { day: "3-kun", text: "Sitorai Mohi Xosa saroyi, milliy hunarmandchilik ustaxonalari va qaytish." },
    ],
  },
  {
    id: "xiva",
    title: "Xiva — Ichan Qal'a ertagi",
    city: "Xiva",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tarixiy",
    days: 3,
    nights: 2,
    price: 1090000,
    oldPrice: 1290000,
    rating: 4.9,
    reviews: 198,
    image:
      "https://images.pexels.com/photos/19473670/pexels-photo-19473670.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Chegirma",
    currency: "som",
    nextDates: ["Har oyning 5-kuni", "Har oyning 20-kuni"],
    seatsLeft: 6,
    includes: ["Aviachipta (Toshkent–Urganch)", "Mehmonxona", "Nonushta", "Gid xizmati", "Kirish chiptalari"],
    itinerary: [
      { day: "1-kun", text: "Urganchga parvoz, Xivaga transfer, Ichan Qal'a devorlari bo'ylab kechki sayr." },
      { day: "2-kun", text: "Kalta Minor, Muhammad Amin Xon madrasasi, Tosh Hovli saroyi." },
      { day: "3-kun", text: "Islom Xo'ja minorasi, milliy bozor va Toshkentga qaytish parvozi." },
    ],
  },
  {
    id: "chimyon-chorvoq",
    title: "Chimyon va Chorvoq — tog' dam olishi",
    city: "Bo'stonliq",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tabiat",
    days: 2,
    nights: 1,
    price: 590000,
    rating: 4.7,
    reviews: 234,
    image:
      "https://images.pexels.com/photos/18057178/pexels-photo-18057178.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    currency: "som",
    nextDates: ["Har hafta oxiri"],
    seatsLeft: 14,
    includes: ["Transport", "Tog' uyi (kottedj)", "3 mahal ovqat", "Kanotaj/kanatnaya yo'l", "Gid xizmati"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan yo'lga chiqish, Chorvoq suv ombori bo'ylab qayiqda sayr." },
      { day: "1-kun, kechqurun", text: "Tog' etagida barbekyu kechasi va tabiatda tunash." },
      { day: "2-kun", text: "Chimyon kanat yo'lida tog' manzarasi, piknik va Toshkentga qaytish." },
    ],
  },
  {
    id: "fargona",
    title: "Farg'ona vodiysi — hunarmandchilik sayohati",
    city: "Marg'ilon",
    country: "O'zbekiston",
    flag: "🇺🇿",
    category: "tabiat",
    days: 2,
    nights: 1,
    price: 650000,
    rating: 4.7,
    reviews: 156,
    image:
      "https://images.pexels.com/photos/30722459/pexels-photo-30722459.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    currency: "som",
    nextDates: ["Har oyning 10-kuni", "Har oyning 25-kuni"],
    seatsLeft: 10,
    includes: ["Transport", "Mehmonxona", "Nonushta", "Yodgorlik ustaxona tashrifi", "Gid xizmati"],
    itinerary: [
      { day: "1-kun", text: "Qo'qon xon o'rdasiga tashrif, Marg'ilonga yo'l, Yodgorlik ipakchilik fabrikasi." },
      { day: "2-kun", text: "Rishton kulolchilik ustaxonalari, milliy bozor va Toshkentga qaytish." },
    ],
  },
  {
    id: "issiqkol",
    title: "Issiqko'l — Markaziy Osiyo marvaridi",
    city: "Cholpon-Ota",
    country: "Qirg'iziston",
    flag: "🇰🇬",
    category: "qoshni",
    days: 5,
    nights: 4,
    price: 2450000,
    rating: 4.8,
    reviews: 176,
    image:
      "https://images.pexels.com/photos/33674534/pexels-photo-33674534.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Yozgi mavsum",
    currency: "som",
    nextDates: ["Iyun–avgust, har hafta"],
    seatsLeft: 8,
    includes: ["Avtobusda yo'l", "Sohil bo'yi mehmonxonasi", "3 mahal ovqat", "Ekskursiyalar", "Gid xizmati"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan Bishkekka yo'l, ko'l qirg'og'idagi mehmonxonaga joylashish." },
      { day: "2–3 kun", text: "Ko'lda dam olish, Barskoon vodiysi va sharsharalar, konnoy sayohat." },
      { day: "4-kun", text: "Jeti-Ogyuz qizil qoyalari va milliy yurtada choy marosimi." },
      { day: "5-kun", text: "Bishkek shahar aylanish va Toshkentga qaytish." },
    ],
  },
  {
    id: "almati",
    title: "Almati — Tyan-Shan tog'lari bag'rida",
    city: "Almati",
    country: "Qozog'iston",
    flag: "🇰🇿",
    category: "qoshni",
    days: 4,
    nights: 3,
    price: 2100000,
    rating: 4.7,
    reviews: 143,
    image:
      "https://images.pexels.com/photos/24974885/pexels-photo-24974885.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    currency: "som",
    nextDates: ["Har oyning 8-kuni", "Har oyning 22-kuni"],
    seatsLeft: 12,
    includes: ["Aviachipta", "4★ mehmonxona", "Nonushta", "Shymbulak kanat yo'li", "Gid xizmati"],
    itinerary: [
      { day: "1-kun", text: "Toshkentdan parvoz, Panfilov bog'i va Zenkov soboriga tashrif." },
      { day: "2-kun", text: "Shymbulak tog' kurortiga sayohat, kanat yo'lida tog' manzarasi." },
      { day: "3-kun", text: "Katta Almati ko'li va Medeu muz maydonchasi." },
      { day: "4-kun", text: "Erkin vaqt, savdo markazlari va Toshkentga qaytish." },
    ],
  },
  {
    id: "dushanbe",
    title: "Dushanbe va Fon tog'lari — yangi kashfiyot",
    city: "Dushanbe",
    country: "Tojikiston",
    flag: "🇹🇯",
    category: "qoshni",
    days: 5,
    nights: 4,
    price: 2650000,
    rating: 4.6,
    reviews: 98,
    image:
      "https://images.pexels.com/photos/18251297/pexels-photo-18251297.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    tag: "Yangi yo'nalish",
    currency: "som",
    nextDates: ["Iyul–sentyabr, oyiga 2 marta"],
    seatsLeft: 7,
    includes: ["Avtobusda yo'l", "Mehmonxona", "3 mahal ovqat", "Fon ko'llari ekskursiyasi", "Gid xizmati"],
    itinerary: [
      { day: "1-kun", text: "Dushanbega yo'l, Rudaki prospekti va Ismoil Somoniy yodgorligi." },
      { day: "2–3 kun", text: "Fon tog'lari — Iskandarko'l va Kulikalon ko'llari bo'ylab trekking." },
      { day: "4-kun", text: "Hisor qal'asi va milliy bozor bilan tanishuv." },
      { day: "5-kun", text: "Toshkentga qaytish." },
    ],
  },
];

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
