import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;

if (!Number.isFinite(apiId) || !apiHash) {
  console.error("TELEGRAM_API_ID va TELEGRAM_API_HASH env qiymatlarini kiriting.");
  console.error('Masalan: TELEGRAM_API_ID=123456 TELEGRAM_API_HASH=abc npm run telegram:session');
  process.exit(1);
}

const rl = readline.createInterface({ input, output });
const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
  connectionRetries: 5,
});

try {
  await client.start({
    phoneNumber: async () => rl.question("Admin telefon raqami (+998...): "),
    phoneCode: async () => rl.question("Telegramdan kelgan kod: "),
    password: async () => rl.question("2FA parol (bo'lmasa Enter): "),
    onError: (error) => console.error(error),
  });

  console.log("\nTELEGRAM_ADMIN_SESSION:");
  console.log(client.session.save());
  console.log("\nBu qiymatni faqat Vercel env vars ichiga qo'ying. Repo yoki chatga yubormang.");
} finally {
  rl.close();
  await client.disconnect().catch(() => {});
}
