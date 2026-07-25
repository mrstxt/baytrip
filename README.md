# Baytrip

Baytrip uchun React + Vite landing/app. Saytda tur paketlari, smart tur tavsiyasi, aloqa formasi va BayClub Card obuna bo'limi bor. Arizalar Vercel serverless endpoint orqali Telegram guruhidagi alohida topiclarga yuboriladi.

## So'nggi o'zgarishlar

BayClub Card bo'limi qo'shildi:

- `Sizga mos turni topamiz` bo'limidan keyin alohida BayClub section chiqadi.
- 3 xil card dizayni bor:
  - `Men` - qora premium style
  - `Women` - qizil/orange style
  - `Family` - BayTrip identikasiga mos ko'k/aqua/sariq style
- Cardlarda `public/bayclub.png` logosi ishlatiladi.
- Cardlarda chip, 16 xonali raqam, card holder, `Discount 20%` yozuvi bor.
- Tariflar tartibi marketing asosida berilgan: `3 oy`, `12 oy`, `6 oy`.
- `12 oy` tarif kartochkasi alohida ajratilgan va imkoniyatlari ko'proq.
- Har bir tarifda hozirgi narx va ustidan chizilgan eski qimmatroq narx bor.
- Har bir tarif tagida `Card olish` tugmasi bor.
- `Card olish` bosilganda alohida modal ariza formasi ochiladi.
- Modalda faqat card turi (`Men`, `Women`, `Family`) va arizachi ma'lumotlari so'raladi.
- Qaysi tarif tugmasi bosilgan bo'lsa, shu tarif avtomatik arizaga qo'shiladi.
- Modal `X` tugmasi bilan yopiladi.
- Footer ichidagi aksiyalar obunasi emaildan Telegram username formasiga almashtirildi.
- Aksiyalar obunasi `promo-subscribe` lead turi sifatida Telegram topicga yuboriladi.

Telegram ariza tizimiga yangi `BayClub Card obunasi` turi qo'shildi:

- Frontend lead type: `bayclub-card`
- Vercel env var: `TELEGRAM_BAYCLUB_TOPIC_ID`
- Telegram topic tavsiya qilingan nomi: `BayClub Card obunasi`

Aksiyalar obunasi uchun:

- Frontend lead type: `promo-subscribe`
- Vercel env var: `TELEGRAM_PROMO_TOPIC_ID`
- Telegram topic tavsiya qilingan nomi: `Aksiyalar obunasi`

## Telegram arizalar tizimi

So'rovlar `/api/telegram` Vercel serverless endpointi orqali yuboriladi. Bot token frontendga chiqmaydi.

Yo'naltirish tartibi:

- Tashqi tur paketlari: `TELEGRAM_EXTERNAL_TOPIC_ID`
- Ichki tur paketlari va qo'shni davlat turlari: `TELEGRAM_DOMESTIC_TOPIC_ID`
- BayClub Card obunasi: `TELEGRAM_BAYCLUB_TOPIC_ID`
- Aksiyalar obunasi: `TELEGRAM_PROMO_TOPIC_ID`
- Boshqa murojaatlar: `TELEGRAM_CONTACT_TOPIC_ID`

Telegram xabarida mijoz ismi, telefon raqami, Telegram username, ariza turi, tanlangan tur yoki BayClub ma'lumotlari, manba va admin profilidan yuboriladigan 1-xabar statusi ko'rsatiladi.

Footer aksiyalar obunasida foydalanuvchi Telegram username qoldiradi. Telegram bot foydalanuvchiga lichkaga xabar yuborishi uchun foydalanuvchi avval botga `/start` bosgan bo'lishi kerak. Username qoldirish obunachi ro'yxatini yig'ish uchun ishlaydi; ommaviy broadcast qilish uchun alohida subscriber storage va bot broadcast endpoint kerak bo'ladi.

BayClub arizasida quyidagilar yuboriladi:

- Mijoz ismi
- Telefon raqami
- Telegram username
- Card turi: `Men`, `Women`, `Family`
- Obuna muddati: `3 oy`, `12 oy`, `6 oy`
- Narx
- Chegirma: har bir tur paketiga `20%`
- Manba: `BayClub Card bo'limi`

## Vercel env vars

Vercel dashboardda `Project Settings -> Environment Variables` bo'limiga quyidagilarni qo'shing:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_EXTERNAL_TOPIC_ID=2
TELEGRAM_DOMESTIC_TOPIC_ID=3
TELEGRAM_BAYCLUB_TOPIC_ID=4
TELEGRAM_PROMO_TOPIC_ID=5
TELEGRAM_CONTACT_TOPIC_ID=6
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=abcdef123456...
TELEGRAM_ADMIN_SESSION=1AQA...
```

BayClub uchun Vercelga qo'shiladigan env nomi:

```env
TELEGRAM_BAYCLUB_TOPIC_ID=<BayClub topic message_thread_id>
```

Aksiyalar obunasi uchun Vercelga qo'shiladigan env nomi:

```env
TELEGRAM_PROMO_TOPIC_ID=<Aksiyalar topic message_thread_id>
```

Env varlarni qo'shgandan keyin loyihani qayta deploy qiling.

## Telegram bot sozlash

1. Telegramda `@BotFather` orqali bot yarating va tokenni oling.
2. Botni kerakli Telegram guruhiga qo'shing.
3. Botga guruhda xabar yuborish huquqini bering. Odatda botni admin qilish eng oson yo'l.
4. Guruhda Topics yoqilgan bo'lishi kerak.
5. Beshta topic yarating:
   - Tashqi tur
   - Ichki tur
   - BayClub Card obunasi
   - Aksiyalar obunasi
   - Murojaat
6. Har bir topic ichiga bitta test xabar yozing.
7. Topic IDlarni olish uchun brauzer yoki terminalda Bot API `getUpdates` chaqiring:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates"
```

Javob ichida kerakli xabar uchun `message_thread_id` qiymatini toping. Shu raqam topic ID bo'ladi.

Guruh `chat_id` odatda `-100...` bilan boshlanadi. Uni ham `getUpdates` javobidagi `message.chat.id` dan oling.

## Admin profilidan 1-xabar yuborish

Mijozga birinchi xabar bot nomidan emas, admin Telegram profili nomidan ketishi uchun MTProto user session kerak bo'ladi. Buning uchun quyidagi env varlar sozlanadi:

```env
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=abcdef123456...
TELEGRAM_ADMIN_SESSION=1AQA...
```

`TELEGRAM_ADMIN_SESSION` admin profilining session stringi bo'ladi. Bu maxfiy qiymat: uni repo ichiga yozmang, faqat Vercel env vars ichida saqlang. Agar bu uchta env var kiritilmasa, ariza baribir guruhga tushadi, lekin mijozga admin profilidan avtomatik xabar yuborilmaydi.

Session olish uchun lokal terminalda:

```bash
TELEGRAM_API_ID=123456 TELEGRAM_API_HASH=abcdef123456 npm run telegram:session
```

Script admin telefon raqami, Telegramdan kelgan kod va 2FA parolni so'raydi. Oxirida chiqqan `TELEGRAM_ADMIN_SESSION` qiymatini Vercel env vars ichiga kiriting.

## BayClub Card UI

BayClub komponenti:

```text
src/components/BayClub.tsx
```

Asosiy ishlashi:

- Card dizaynlari `cardDesigns` massivida turadi.
- Tariflar `plans` massivida turadi.
- `Card olish` tugmasi bosilganda modal ochiladi.
- Modal formasi `sendLead` orqali `/api/telegram` endpointga `bayclub-card` payload yuboradi.
- Yuborilgan payload `api/telegram.js` ichida validatsiya qilinadi va `TELEGRAM_BAYCLUB_TOPIC_ID` topicga jo'natiladi.

Logo:

```text
public/bayclub.png
```

BayClub cardlaridagi logo shu fayldan olinadi. Fayl almashtirilsa, sayt avtomatik yangi logoni ishlatadi.

## Ishga tushirish

Dependencylarni o'rnatish:

```bash
npm install
```

Frontend development server:

```bash
npm run dev
```

Vercel API endpointini lokal tekshirish uchun Vercel CLI bilan ishga tushiring:

```bash
vercel dev
```

Production build:

```bash
npm run build
```

TypeScript tekshiruv:

```bash
npx tsc --noEmit
```

## Muhim fayllar

- `src/components/Hero.tsx` - bosh sahifa hero qismi
- `src/components/BayClub.tsx` - BayClub Card dizaynlari, tariflar va ariza modali
- `src/components/TourModal.tsx` - tur paket ariza formasi
- `src/components/TourAnalyzer.tsx` - smart tur tavsiya bo'limi
- `src/components/Sections.tsx` - aloqa/murojaat formasi
- `src/lib/leads.ts` - frontenddan `/api/telegram` ga yuboruvchi helper va lead payload typelari
- `api/telegram.js` - Telegram Bot API bilan ishlaydigan Vercel serverless endpoint
- `public/bayclub.png` - BayClub logosi
- `public/logo.png` - BayTrip logosi
