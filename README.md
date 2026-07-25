# Baytrip

Baytrip uchun React + Vite landing/app. Saytdagi tur kartochkalari, tur analiz tavsiyalari va aloqa formasi Telegram guruhidagi topiclarga ajratib yuboriladi.

## Telegram arizalar tizimi

So'rovlar `/api/telegram` Vercel serverless endpointi orqali yuboriladi. Bot token frontendga chiqmaydi.

Yo'naltirish tartibi:

- Tashqi tur paketlari: `TELEGRAM_EXTERNAL_TOPIC_ID`
- Ichki tur paketlari va qo'shni davlat turlari: `TELEGRAM_DOMESTIC_TOPIC_ID`
- Boshqa murojaatlar: `TELEGRAM_CONTACT_TOPIC_ID`

Telegram xabarida mijoz ismi, telefon raqami, tur nomi, yo'nalish, sana, sayohatchilar soni, narx va manba ko'rsatiladi.

## Telegram bot sozlash

1. Telegramda `@BotFather` orqali bot yarating va tokenni oling.
2. Botni kerakli Telegram guruhiga qo'shing.
3. Botga guruhda xabar yuborish huquqini bering. Odatda botni admin qilish eng oson yo'l.
4. Guruhda Topics yoqilgan bo'lishi kerak.
5. Uchta topic yarating:
   - Tashqi tur
   - Ichki tur
   - Murojaat
6. Har bir topic ichiga bitta test xabar yozing.
7. Topic IDlarni olish uchun brauzer yoki terminalda Bot API `getUpdates` chaqiring:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates"
```

Javob ichida kerakli xabar uchun `message_thread_id` qiymatini toping. Shu raqam topic ID bo'ladi.

Guruh `chat_id` odatda `-100...` bilan boshlanadi. Uni ham `getUpdates` javobidagi `message.chat.id` dan oling.

## Vercel env vars

Vercel dashboardda Project Settings -> Environment Variables bo'limiga quyidagilarni qo'shing:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_EXTERNAL_TOPIC_ID=2
TELEGRAM_DOMESTIC_TOPIC_ID=3
TELEGRAM_CONTACT_TOPIC_ID=4
```

Env varlarni qo'shgandan keyin loyihani qayta deploy qiling.

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

## Muhim fayllar

- `src/components/TourModal.tsx` - tur paket ariza formasi
- `src/components/Sections.tsx` - aloqa/murojaat formasi
- `src/lib/leads.ts` - frontenddan `/api/telegram` ga yuboruvchi helper
- `api/telegram.js` - Telegram Bot API bilan ishlaydigan Vercel serverless endpoint
