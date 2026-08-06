# Baytrip

Baytrip - React + Vite asosida qilingan turizm landing/app. Saytda tur paketlari, ichki va tashqi turlar, smart tur tavsiyasi, bron qilish formasi, murojaat formasi, aksiyalar obunasi va BayClub Card bo'limi bor. Arizalar Vercel serverless endpoint orqali Telegram guruhidagi topiclarga yuboriladi. Guruhdan topilgan lidlar ham avvalgidek `TELEGRAM_GROUP_LEADS_TOPIC_ID` topiciga tushadi; botning ichki storage/config/xotira xabarlari esa topicga emas, alohida yopiq storage guruhga yoziladi.

## Asosiy imkoniyatlar

- Tashqi tur paketlarini ko'rish va bron qilish.
- Ichki tur paketlarini ko'rish va bron qilish.
- Tur sanasini tanlash, odam sonini belgilash va taxminiy jami narxni ko'rish.
- Sayt pastidagi oddiy murojaat formasi: ism va telefon yetarli, Telegram username ixtiyoriy.
- Footer orqali aksiyalarga Telegram username bilan obuna bo'lish.
- BayClub Card bo'limi: `Men`, `Women`, `Family` kartalari va `3 oy`, `6 oy`, `12 oy` tariflari.
- Bot orqali BayClub narxlarini o'zgartirish.
- Bot admin panel: login/parol orqali boshqarish.
- Bot orqali aksiyalarni obunachilarga admin profilidan yuborish.
- Telegram profil session orqali turizm guruhlarini scan qilish va kalit so'zlar asosida lidlarni ichki lead topiciga yuborish.
- Bot ichida `Oxirgi amallar` bo'limi: BayClub narx configlari, guruh lid sozlamalari va scan state yozuvlarini ko'rish.

## Texnologiyalar

- React
- Vite
- TypeScript
- Tailwind CSS
- Vercel Serverless Functions
- Telegram Bot API
- Telegram MTProto session (`telegram` npm package)

## Muhim fayllar

- `src/App.tsx` - asosiy sahifa layouti.
- `src/components/Hero.tsx` - bosh sahifa hero qismi.
- `src/components/Tours.tsx` - tashqi turlar.
- `src/components/DomesticTours.tsx` - ichki turlar.
- `src/components/TourModal.tsx` - tur bron qilish modali.
- `src/components/TourAnalyzer.tsx` - smart tur tavsiya bo'limi.
- `src/components/Sections.tsx` - aloqa/murojaat formasi, FAQ, kompaniya bo'limlari.
- `src/components/BayClub.tsx` - BayClub Card UI va ariza formasi.
- `src/components/Footer.tsx` - footer va aksiyalar obunasi.
- `src/toursStore.tsx` - tur paketlarini localStorage orqali boshqaruvchi store (CRUD).
- `src/admin/AdminPanel.tsx` - paketlar kartochkalarini qo'shish/o'zgartirish/o'chirish uchun admin panel.
- `src/lib/leads.ts` - frontenddan `/api/telegram` ga ariza yuboruvchi helper.
- `api/telegram.js` - asosiy Telegram webhook, ariza endpointi va bot admin panel.
- `api/bayclub-config.js` - BayClub narxlarini Telegram storage guruhidan yoki eski config topicdan o'qiydigan endpoint.
- `api/group-leads-scan.js` - Telegram profil session orqali guruhlardan lid scan qiladigan endpoint.
- `scripts/create-telegram-session.mjs` - Telegram admin profil session olish scripti.
- `vercel.json` - Vercel cron sozlamasi.

## Telegram topiclarga ariza yo'naltirish

Saytdan kelgan arizalar `POST /api/telegram` orqali Telegram guruhidagi topiclarga tushadi.

- Tashqi tur bronlari: `TELEGRAM_EXTERNAL_TOPIC_ID`
- Ichki tur bronlari: `TELEGRAM_DOMESTIC_TOPIC_ID`
- BayClub Card arizalari: `TELEGRAM_BAYCLUB_TOPIC_ID`
- Aksiyalar obunasi: `TELEGRAM_PROMO_TOPIC_ID`
- Oddiy murojaatlar: `TELEGRAM_CONTACT_TOPIC_ID`
- Guruhlardan topilgan lidlar: `TELEGRAM_GROUP_LEADS_TOPIC_ID`

Oddiy murojaatlar uchun alias env nomlar ham qo'llab-quvvatlanadi:

```env
TELEGRAM_CONTACT_TOPIC_ID=6
TELEGRAM_SUPPORT_TOPIC_ID=6
TELEGRAM_MUROJAAT_TOPIC_ID=6
TELEGRAM_MUROJAATLAR_TOPIC_ID=6
```

Asosiy tavsiya: `TELEGRAM_CONTACT_TOPIC_ID` ishlating.

## Vercel env vars

Vercel dashboardda `Project Settings -> Environment Variables` bo'limiga quyidagilar qo'shiladi.

Asosiy Telegram bot va guruh:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-1001234567890
```

Ariza topiclari:

```env
TELEGRAM_EXTERNAL_TOPIC_ID=2
TELEGRAM_DOMESTIC_TOPIC_ID=3
TELEGRAM_BAYCLUB_TOPIC_ID=4
TELEGRAM_PROMO_TOPIC_ID=5
TELEGRAM_CONTACT_TOPIC_ID=6
TELEGRAM_GROUP_LEADS_TOPIC_ID=7
```

Bot admin panel:

```env
TELEGRAM_BOT_ADMIN_LOGIN=admin
TELEGRAM_BROADCAST_PASSWORD=strong-secret-password
TELEGRAM_BROADCAST_ADMIN_IDS=123456789,@adminusername
```

`TELEGRAM_BROADCAST_ADMIN_IDS` ixtiyoriy. Berilsa, faqat shu Telegram ID yoki username egalari admin action qila oladi.

Admin profil session:

```env
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=abcdef123456...
TELEGRAM_ADMIN_SESSION=1AQA...
```

BayClub narx configlari, guruh lid sozlamalari, scan state va lead feedback xotirasi topicga yozilmaydi. Bu maxfiy storage xabarlar alohida yopiq storage guruhga ketadi:

Kodda default storage chat ID sifatida `-5025743465` fallback qilib qo'yilgan, lekin Vercelda env sifatida ham qo'yish tavsiya qilinadi.

```env
TELEGRAM_STORAGE_CHAT_ID=-5025743465
```

Vercelda quyidagi eski topic-storage envlar bo'lsa olib tashlang yoki bo'sh qoldiring. Kod yangi storage yozuvlarda ulardan foydalanmaydi, lekin chalkashmaslik uchun production envda turmagani yaxshi:

```env
TELEGRAM_USE_TOPIC_STORAGE
TELEGRAM_GROUP_LEADS_USE_TOPICS
TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID
TELEGRAM_GROUP_LEADS_CONFIG_TOPIC_ID
TELEGRAM_GROUP_LEADS_STORAGE_CHAT_ID
TELEGRAM_INTERNAL_CHAT_ID
TELEGRAM_SETTINGS_CHAT_ID
```

Qo'shimcha sozlamalar:

```env
TELEGRAM_PROMO_SCAN_LIMIT=500
TELEGRAM_GROUP_LEADS_SCAN_LIMIT=100
TELEGRAM_GROUP_LEADS_SCAN_HISTORY=false
TELEGRAM_GROUP_LEADS_CONFIG_SCAN_LIMIT=150
TELEGRAM_GROUP_LEADS_FEEDBACK_SCAN_LIMIT=250
TELEGRAM_LEAD_STATS_SCAN_LIMIT=300
TELEGRAM_ADMIN_ACTIONS_SCAN_LIMIT=80
TELEGRAM_ADMIN_ACTIONS_LIMIT=8
TELEGRAM_PROFILE_MESSAGE_TIMEOUT_MS=3500
```

`CRON_SECRET` majburiy emas. Agar qo'yilsa, `/api/group-leads-scan` endpoint secret talab qiladi. Vercel cron requestlarida `Authorization: Bearer <CRON_SECRET>` header yuboradi; manual testda esa `?secret=<CRON_SECRET>` ishlatish mumkin.

## Telegram bot sozlash

1. `@BotFather` orqali bot yarating.
2. Tokenni `TELEGRAM_BOT_TOKEN` ga yozing.
3. Botni admin guruhga qo'shing.
4. Guruhda Topics yoqing.
5. Topiclar yarating:
   - Tashqi tur
   - Ichki tur
   - BayClub Card
   - Aksiyalar obunasi
   - Murojaatlar
   - Guruh lidlari
   - Sozlamalar yoki Admin log
6. Har bir topic ichiga test xabar yozing.
7. Topic IDlarni olish uchun:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates"
```

Javob ichidagi `message_thread_id` topic ID bo'ladi. Guruh ID esa odatda `-100...` ko'rinishida `message.chat.id` ichida chiqadi.

## Webhook ulash

Deploydan keyin webhookni ulang:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<VERCEL_DOMAIN>/api/telegram"
```

Webhook holatini tekshirish:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

`last_error_message` bo'sh bo'lsa webhook ishlayapti.

API health tekshirish:

```text
https://<VERCEL_DOMAIN>/api/telegram
```

Bu endpoint `hasBotToken`, `hasChatId`, `hasAdminSession` va `topicIds` holatini ko'rsatadi.

## Bot admin panel

Bot commandlari:

```text
/start
/login
/panel
/scan
/logout
/promo PAROL xabar matni
```

Admin panelga kirish:

```text
/login
```

Bot avval login, keyin parol so'raydi. Login/parol to'g'ri bo'lsa admin panel tugmalari chiqadi:

```text
📣 Aksiya xabar yuborish
💳 BayClub narxlari
🔎 Guruh lidlari
🧭 Lid skaner
📊 Statistika
🧾 Oxirgi amallar
🚪 Chiqish
```

## Saytdan keladigan arizalar

Tur bron qilish formasi:

- Ism
- Telefon
- Telegram username, ixtiyoriy
- Tur nomi
- Yo'nalish
- Sana
- Odam soni
- Narx
- Jami summa

Oddiy murojaat formasi:

- Ism
- Telefon
- Telegram username, ixtiyoriy
- Qiziqayotgan tur yoki izoh, ixtiyoriy

BayClub Card arizasi:

- Ism
- Telefon
- Telegram username
- Card turi: `Men`, `Women`, `Family`
- Tarif: `3 oy`, `6 oy`, `12 oy`
- Narx

Footer aksiyalar obunasi:

- Telegram username
- Manba: footer aksiyalar obunasi

## Admin profilidan birinchi xabar

Ariza kelganda sistema mijozga admin Telegram profili nomidan birinchi xabar yuborishga urinadi. Bu bot nomidan emas, `TELEGRAM_ADMIN_SESSION` orqali ulangan profil nomidan ketadi.

Agar session sozlanmagan yoki username kiritilmagan bo'lsa:

- ariza baribir topicga tushadi;
- xabarda profil yuborish statusi ko'rsatiladi.

Session olish:

```bash
TELEGRAM_API_ID=123456 TELEGRAM_API_HASH=abcdef123456 npm run telegram:session
```

Script telefon raqam, Telegram kod va 2FA parolni so'raydi. Oxirida chiqqan `TELEGRAM_ADMIN_SESSION` qiymatini Vercel envga yozing.

## Jonli suhbat real-time worker

Bot admin panelidagi `Jonli suhbat` yoqilgan yoki o'chirilgan holati `DATA \ BAYTRIP` storage guruhida saqlanadi. Vercel serverless endpoint doimiy real-time tinglovchi bo'lib ishlab turolmaydi; yangi shaxsiy xabarlarga sekundma-sekund javob berish uchun alohida Node worker ishlashi kerak.

Worker ishga tushirish:

```bash
npm run telegram:live
```

Worker `TELEGRAM_ADMIN_SESSION` orqali admin profilga kelgan yangi shaxsiy xabarlarni eshitadi. `Jonli suhbat` yoqilgan bo'lsa, mijozga admin profil nomidan javob yuboradi va qayta spam qilmaslik uchun javob berilgan message IDlarni `LIVE_CHAT_MEMORY` markerida `DATA \ BAYTRIP` guruhiga saqlaydi.

Kerakli envlar:

```bash
TELEGRAM_API_ID=123456
TELEGRAM_API_HASH=abcdef123456
TELEGRAM_ADMIN_SESSION=1AQA...
TELEGRAM_STORAGE_CHAT_ID=-5025743465
TELEGRAM_STORAGE_CHAT_TITLE=DATA \ BAYTRIP
```

## BayClub narxlarini bot orqali o'zgartirish

Admin panelda `BayClub narxlarini o'zgartirish` tugmasini bosing. Bot reply prompt beradi. Shu promptga quyidagi formatda reply qiling:

```text
3=1599000|1800000
12=4499000|5299000
6=2999000|3399000
```

Birinchi qiymat - hozirgi narx, ikkinchi qiymat - eski chizilgan narx.

Narx config `BAYCLUB_PRICE_CONFIG` marker bilan `TELEGRAM_STORAGE_CHAT_ID` guruhiga, topic ishlatmasdan, yopiqroq ko'rinishda yoziladi. Sayt `GET /api/bayclub-config` orqali oxirgi configlarni o'qib narxlarni yangilaydi.

Muhim: texnik config xabarlar asosiy arizalar orasida ko'rinmasligi uchun `TELEGRAM_STORAGE_CHAT_ID=-5025743465` qo'yilgan bo'lishi kerak.

## Aksiyalar broadcast

Footerdan username qoldirganlar `TELEGRAM_PROMO_TOPIC_ID` topicga tushadi. Admin paneldan `Aksiya xabar yuborish` bosilganda bot aksiya matnini so'raydi.

Broadcast ishlashi:

1. Admin aksiya matnini reply qiladi.
2. API promo topicdagi oxirgi xabarlardan `@username` larni yig'adi.
3. `TELEGRAM_ADMIN_SESSION` orqali ulangan profil har bir usernamega lichkaga xabar yuboradi.

Tezkor command:

```text
/promo PAROL Bugun Dubai turlariga maxsus chegirma!
```

## Guruhlardan lid yig'ish

Bu funksiya Telegram profil session orqali profil a'zo bo'lgan guruhlarni scan qiladi. Har soatda ishga tushganda har bir guruhdagi eng so'nggi 100 ta xabarni ko'radi, oxirgi 1 soat ichidagi xabar ichida belgilangan kalit so'z yoki tasdiqlangan lidlarga o'xshash belgilar topilsa, ichki `Guruh lidlari` topiciga lid yuboradi.

Admin panelda `🔎 Guruh lidlari` tugmasini bosing. Guruhlar va kalit so'zlar alohida sozlanadi.

`🧭 Lid skaner` tugmasi test va manual scan uchun ishlaydi. Tugma bosilganda bot `/api/group-leads-scan` endpointini hoziroq chaqiradi: har bir sozlangan guruhdan eng so'nggi 100 ta xabarni tekshiradi, oxirgi 1 soat ichida kalit so'zga yoki tasdiqlangan namunalarga mos lid bo'lsa `TELEGRAM_GROUP_LEADS_TOPIC_ID` topiciga yuboradi. Tezkor command sifatida `/scan` ham ishlaydi.

Default kuzatiladigan guruhlar:

```text
-1001382725545=Союз
-1003546137685=Levora B2B
-1001614487338=Meridian World
-1001840866049=Guides of Uzbekistan
```

`👥 Guruhlarni sozlash` uchun format:

```text
@fargonaturizm=Farg'ona turizm
-1001234567890=Samarqand sayohat
```

`🔑 Kalit so'zlar` uchun format:

```text
tur kerak, ekskursiya, avia, mehmonxona, gid kerak, 5 kishi
```

Guruh chap tomonda public username yoki `-100...` ID bo'ladi. `=` dan keyingi qism ichki lid xabarida ko'rinadigan nom.

Guruhdan lid topilganda mijozga avtomatik xabar ketmaydi. Lid avval ichki lead topicga `✅ Tasdiqlash` va `❌ Bekor` tugmalari bilan tushadi. Hodim tasdiqlashni bosadi, o'z ismini tanlaydi, shundan keyin profil session orqali mijoz username'iga birinchi xabar yuboriladi. Bekor bosilganda lid xabari o'chiriladi va “Bekor qilindi...” degan qo'shimcha xabar chiqmaydi. Tasdiqlangan va bekor qilingan lidlar storage guruhga `GROUP_LEAD_FEEDBACK` sifatida kodlangan ko'rinishda yoziladi; keyingi scanlar shu xotiradan foydalanib tasdiqlanganlarga o'xshash xabarlarni ko'proq lid qiladi va bekor qilinganlarga o'xshashlarini pasaytiradi.

`👤 Hodimlar` uchun format:

```text
Shoxruza, Sohibjon, Aziz
```

Hodimlar ro'yxati bot orqali storage guruhga saqlanadi. Fallback sifatida env ham ishlaydi:

```env
TELEGRAM_GROUP_LEADS_EMPLOYEES=Shoxruza,Sohibjon,Aziz
```

Botdan hodimlar kiritilmagan va env ham bo'sh bo'lsa, tasdiqlagan Telegram foydalanuvchisining ismi bitta tugma sifatida chiqadi.

Guruhdan topilgan lidlar tushadigan topic:

```env
TELEGRAM_GROUP_LEADS_TOPIC_ID=<Guruh lidlari topic ID>
```

Config, scan state va lid xotirasi yoziladigan storage guruh:

```env
TELEGRAM_STORAGE_CHAT_ID=-5025743465
```

Quyidagi eski topic-storage envlarni productiondan olib tashlang. Maxfiy data sozlanmalar topiciga tushmasligi uchun storage yozuvlari endi topicga `message_thread_id` yubormaydi:

```env
TELEGRAM_USE_TOPIC_STORAGE
TELEGRAM_GROUP_LEADS_USE_TOPICS
TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID
TELEGRAM_GROUP_LEADS_CONFIG_TOPIC_ID
TELEGRAM_GROUP_LEADS_STORAGE_CHAT_ID
```

Vercel cron endpoint:

```text
/api/group-leads-scan
```

`vercel.json` default holatda Vercel Hobby planda deploy yiqilmasligi uchun cronni kuniga 1 marta ishga tushiradi:

```json
{
  "crons": [
    {
      "path": "/api/group-leads-scan",
      "schedule": "0 5 * * *"
    }
  ]
}
```

Har 1 soatda scan kerak bo'lsa, Vercel Pro plan yoki tashqi cron service ishlating. Tashqi cron `/api/group-leads-scan` endpointini har 1 soatda chaqirishi mumkin.

Manual test:

```bash
curl "https://<VERCEL_DOMAIN>/api/group-leads-scan"
```

Agar `CRON_SECRET` qo'yilgan bo'lsa:

```bash
curl "https://<VERCEL_DOMAIN>/api/group-leads-scan?secret=<CRON_SECRET>"
```

Birinchi scan ham oxirgi 1 soatdagi eng so'nggi 30 ta xabarni tekshiradi. Keyingi scanlarda state orqali oldin ko'rilgan xabarlar takror yuborilmaydi.

Default qiymatlar:

```env
TELEGRAM_GROUP_LEADS_SCAN_WINDOW_MINUTES=60
TELEGRAM_GROUP_LEADS_SCAN_LIMIT=100
TELEGRAM_GROUP_LEADS_FEEDBACK_SCAN_LIMIT=250
```

Eski tarixni ham scan qilish kerak bo'lsa:

```env
TELEGRAM_GROUP_LEADS_SCAN_HISTORY=true
```

## Oxirgi amallar

Admin paneldagi `Oxirgi amallar` tugmasi quyidagilarni ko'rsatadi:

- BayClub narx configlari.
- Guruh lid sozlamalari.
- Guruh lid scan state yozuvlari.

Bu bo'lim Telegram storage guruhini o'qiydi. Eski config topiclarda qolgan marker xabarlar migratsiya uchun fallback sifatida o'qilishi mumkin, lekin yangi yozuvlar faqat storage guruhga ketadi.

## Statistika

Admin paneldagi `📊 Statistika` tugmasi asosiy guruh va mavjud topiclardagi lead xabarlarni o'qib ko'rsatadi:

- Bugun nechta lid tushgani.
- Bugun qaysi hodim nechta murojaatni tasdiqlagani.
- Ko'p uchrayotgan murojaat turlari.

`TELEGRAM_LEAD_STATS_SCAN_LIMIT` nechta oxirgi xabar scan qilinishini belgilaydi.

## Ishga tushirish

### Admin Panel (Paketlar boshqaruvi)

Saytga `/#/admin` URL orqali admin paneliga kiring. Parol: `baytrip2025`

Admin panelda:
- Xalqaro va ichki tur paketlarini ko'rish, qo'shish, tahrirlash, o'chirish
- Har bir paket uchun: sarlavha, rasm, narx, muddat, marshrut (itinerary), teglar va boshqalar
- O'zgarishlar localStorage'da saqlanadi va darhol saytda ko'rinadi
- "Asliga qaytarish" tugmasi barcha o'zgarishlarni bekor qiladi

Dependencylarni o'rnatish:

```bash
npm install
```

Development server:

```bash
npm run dev
```

Vercel API endpointlarini lokal tekshirish:

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

## Deploy

1. Env varlarni Vercelga kiriting.
2. Kodni deploy qiling.
3. Webhookni qayta ulang.
4. `https://<VERCEL_DOMAIN>/api/telegram` orqali health tekshiring.
5. Botda `/start` va `/login` ni tekshiring.
6. Saytdan test ariza yuboring.

## Troubleshooting

Bot `/start` ga javob bermasa:

- Webhook ulanganini tekshiring:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

- `last_error_message` ni ko'ring.
- `https://<VERCEL_DOMAIN>/api/telegram` health endpointini oching.
- `configured: true` bo'lishi kerak. Batafsil diagnostika uchun `?secret=<CRON_SECRET yoki admin parol>` ishlating.

Murojaatlar topicga tushmasa:

- `TELEGRAM_CONTACT_TOPIC_ID` to'g'ri topic ID ekanini tekshiring.
- Debug kerak bo'lsa `GET /api/telegram?secret=<CRON_SECRET yoki admin parol>` orqali yopiq diagnostikani ko'ring.
- Topic ID noto'g'ri bo'lsa, ariza asosiy guruhga ogohlantirish bilan tushadi.

BayClub narxlari defaultga qaytsa:

- `TELEGRAM_STORAGE_CHAT_ID=-5025743465` Vercel envda borligini tekshiring.
- Bot `-5025743465` storage guruhida admin yoki xabar yubora oladigan a'zo ekanini tekshiring.
- Bot orqali narxlarni bir marta to'liq yuboring:

```text
3=1599000|1800000
12=4499000|5299000
6=2999000|3399000
```

`zsh: no matches found` chiqsa:

- `curl` URLni qo'shtirnoq ichida yozing:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://domain.vercel.app/api/telegram"
```
