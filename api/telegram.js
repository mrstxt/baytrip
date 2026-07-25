const LEAD_LABELS = {
  "external-tour": "Tashqi tur paketi",
  "domestic-tour": "Ichki tur paketi",
  "bayclub-card": "BayClub Card obunasi",
  "promo-subscribe": "Aksiyalar obunasi",
  contact: "Murojaat",
};

const PROMO_REPLY_MARKER = "Aksiya xabar matnini shu xabarga reply qilib yuboring.";
const LOGIN_REPLY_MARKER = "Admin loginni shu xabarga reply qilib yuboring.";
const PASSWORD_REPLY_MARKER = "Admin parolni shu xabarga reply qilib yuboring.";
const PRICE_REPLY_MARKER = "BayClub tarif narxlarini shu xabarga reply qilib yuboring.";
const PRICE_CONFIG_MARKER = "BAYCLUB_PRICE_CONFIG";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function clean(value, fallback = "-") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function normalizeTelegramUsername(value) {
  return clean(value, "").replace(/^@+/, "");
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAdminProfileConfig() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = clean(process.env.TELEGRAM_API_HASH, "");
  const session = clean(process.env.TELEGRAM_ADMIN_SESSION, "");

  if (!Number.isFinite(apiId) || !apiHash || !session) {
    return null;
  }

  return { apiId, apiHash, session };
}

function getBroadcastPassword() {
  return clean(process.env.TELEGRAM_BROADCAST_PASSWORD, "");
}

function getAdminLogin() {
  return clean(process.env.TELEGRAM_BOT_ADMIN_LOGIN || process.env.TELEGRAM_BROADCAST_LOGIN || "admin", "");
}

function getAllowedAdminIds() {
  return clean(process.env.TELEGRAM_BROADCAST_ADMIN_IDS, "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function isAllowedAdmin(message) {
  const allowed = getAllowedAdminIds();
  if (allowed.length === 0) return true;

  const from = message?.from;
  const id = from?.id ? String(from.id) : "";
  const username = normalizeTelegramUsername(from?.username);
  return allowed.includes(id) || allowed.includes(username) || allowed.includes(`@${username}`);
}

async function sendBotMessage(token, chatId, text, extra = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...extra,
    }),
  });

  return response.json().catch(() => null);
}

async function answerCallbackQuery(token, callbackQueryId, text = "") {
  const response = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });

  return response.json().catch(() => null);
}

function buildAdminPanelKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "📣 Aksiya xabar yuborish", callback_data: "promo_broadcast" }],
      [{ text: "💳 BayClub narxlarini o'zgartirish", callback_data: "bayclub_prices" }],
      [{ text: "🚪 Chiqish", callback_data: "logout" }],
    ],
  };
}

async function sendAdminPanel(token, chatId) {
  return sendBotMessage(
    token,
    chatId,
    [
      "<b>BayTrip admin panel</b>",
      "",
      "Mavjud bo'limlar:",
      "📣 Aksiyalar obunachilariga xabar yuborish",
      "💳 BayClub tarif narxlarini o'zgartirish",
    ].join("\n"),
    { reply_markup: buildAdminPanelKeyboard() }
  );
}

async function sendLoginPrompt(token, chatId) {
  return sendBotMessage(
    token,
    chatId,
    [
      LOGIN_REPLY_MARKER,
      "",
      "Admin loginni shu xabarga reply qilib yuboring.",
    ].join("\n"),
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Login...",
      },
    }
  );
}

async function runPromoBroadcast(token, chatId, promoMessage) {
  if (promoMessage.length < 5) {
    await sendBotMessage(token, chatId, "Xabar juda qisqa. Iltimos, to'liq aksiya matnini yuboring.");
    return;
  }

  await sendBotMessage(token, chatId, "Yuborish boshlandi. Obunachilar Aksiyalar topicidan yig'ilmoqda...");

  try {
    const result = await broadcastPromoMessage(promoMessage);
    await sendBotMessage(
      token,
      chatId,
      [
        "<b>Aksiya xabari yuborildi</b>",
        `Topildi: ${result.usernames.length}`,
        `Yuborildi: ${result.sent.length}`,
        `Xato: ${result.failed.length}`,
        result.failed.length ? `\nXato username'lar: ${result.failed.map((item) => `@${item.username}`).join(", ")}` : "",
      ].join("\n"),
      { reply_markup: buildAdminPanelKeyboard() }
    );
  } catch (error) {
    await sendBotMessage(token, chatId, `Broadcast xatoligi: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
  }
}

function parsePriceNumber(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (!digits) return "";
  return `${Number(digits).toLocaleString("ru-RU")} so'm`;
}

function parseBayClubPriceText(text) {
  const config = {};
  const aliases = {
    "3": "3 oy",
    "3oy": "3 oy",
    "3 oy": "3 oy",
    "6": "6 oy",
    "6oy": "6 oy",
    "6 oy": "6 oy",
    "12": "12 oy",
    "12oy": "12 oy",
    "12 oy": "12 oy",
  };

  for (const rawLine of String(text ?? "").split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const [rawKey, rawValues] = line.split(/[:=]/);
    if (!rawKey || !rawValues) continue;
    const key = aliases[rawKey.trim().toLowerCase().replace(/\s+/g, " ")] ?? aliases[rawKey.trim().toLowerCase().replace(/\s+/g, "")];
    if (!key) continue;
    const [priceRaw, oldPriceRaw] = rawValues.split(/[|,;]/).map((item) => item.trim());
    const price = parsePriceNumber(priceRaw);
    const oldPrice = parsePriceNumber(oldPriceRaw);
    if (price) {
      config[key] = oldPrice ? { price, oldPrice } : { price };
    }
  }

  return config;
}

function getBayClubConfigTopicId() {
  const raw = process.env.TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID || process.env.TELEGRAM_BAYCLUB_TOPIC_ID;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function saveBayClubPriceConfig(token, config) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID kiritilmagan.");

  const threadId = getBayClubConfigTopicId();
  const text = [
    `<b>${PRICE_CONFIG_MARKER}</b>`,
    "",
    `<code>${escapeHtml(JSON.stringify(config))}</code>`,
  ].join("\n");

  await sendBotMessage(
    token,
    chatId,
    text,
    threadId ? { message_thread_id: threadId } : {}
  );
}

async function runBayClubPriceUpdate(token, chatId, text) {
  const config = parseBayClubPriceText(text);
  if (Object.keys(config).length === 0) {
    await sendBotMessage(
      token,
      chatId,
      [
        "Narx formati noto'g'ri.",
        "",
        "Namuna:",
        "<code>3=299000|399000</code>",
        "<code>12=899000|1299000</code>",
        "<code>6=499000|699000</code>",
        "",
        "Birinchi narx hozirgi narx, ikkinchisi chizilgan eski narx.",
      ].join("\n")
    );
    return;
  }

  try {
    await saveBayClubPriceConfig(token, config);
    await sendBotMessage(
      token,
      chatId,
      [
        "<b>BayClub narxlari yangilandi</b>",
        ...Object.entries(config).map(([title, value]) => `${title}: ${value.price}${value.oldPrice ? ` / eski: ${value.oldPrice}` : ""}`),
        "",
        "Sayt yangi config'ni /api/bayclub-config orqali o'qiydi.",
      ].join("\n"),
      { reply_markup: buildAdminPanelKeyboard() }
    );
  } catch (error) {
    await sendBotMessage(token, chatId, `Narx saqlashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
  }
}

async function withAdminClient(fn) {
  const config = getAdminProfileConfig();
  if (!config) {
    throw new Error("Admin profil seansi sozlanmagan.");
  }

  const [{ TelegramClient }, { StringSession }] = await Promise.all([
    import("telegram"),
    import("telegram/sessions/index.js"),
  ]);

  const client = new TelegramClient(new StringSession(config.session), config.apiId, config.apiHash, {
    connectionRetries: 2,
  });

  try {
    await client.connect();
    return await fn(client);
  } finally {
    await client.disconnect().catch(() => {});
  }
}

function extractUsernames(text) {
  const found = new Set();
  for (const match of String(text ?? "").matchAll(/@([a-zA-Z0-9_]{5,32})/g)) {
    found.add(match[1]);
  }
  return [...found];
}

async function getPromoSubscribersFromTopic() {
  const topicId = getTopicId("promo-subscribe");
  if (!topicId) {
    throw new Error("TELEGRAM_PROMO_TOPIC_ID kiritilmagan.");
  }

  const limit = Number(process.env.TELEGRAM_PROMO_SCAN_LIMIT || 500);
  return withAdminClient(async (client) => {
    const usernames = new Set();
    const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
    const iterator = client.iterMessages(entity, {
      limit: Number.isFinite(limit) ? limit : 500,
      replyTo: topicId,
    });

    for await (const message of iterator) {
      extractUsernames(message.message).forEach((username) => usernames.add(username));
    }

    return [...usernames];
  });
}

async function broadcastPromoMessage(message) {
  const usernames = await getPromoSubscribersFromTopic();
  const results = await withAdminClient(async (client) => {
    const sent = [];
    const failed = [];

    for (const username of usernames) {
      try {
        await client.sendMessage(`@${username}`, { message });
        sent.push(username);
      } catch (error) {
        failed.push({
          username,
          error: error instanceof Error ? error.message : "noma'lum xatolik",
        });
      }
    }

    return { sent, failed };
  });

  return { usernames, ...results };
}

async function handleBotUpdate(body, token) {
  if (body.callback_query) {
    const callback = body.callback_query;
    const chatId = callback.message?.chat?.id;
    const data = clean(callback.data, "");

    if (!chatId) return { ok: true, ignored: true };
    await answerCallbackQuery(token, callback.id);

    if (data === "login_start") {
      await sendLoginPrompt(token, chatId);
      return { ok: true };
    }

    if (data === "promo_broadcast") {
      await sendBotMessage(
        token,
        chatId,
        [
          PROMO_REPLY_MARKER,
          "",
          "Masalan:",
          "Bugun Dubai tur paketlariga maxsus chegirma! Batafsil: baytrip.uz",
        ].join("\n"),
        {
          reply_markup: {
            force_reply: true,
            input_field_placeholder: "Aksiya xabar matni...",
          },
        }
      );
      return { ok: true };
    }

    if (data === "bayclub_prices") {
      await sendBotMessage(
        token,
        chatId,
        [
          PRICE_REPLY_MARKER,
          "",
          "Namuna:",
          "<code>3=299000|399000</code>",
          "<code>12=899000|1299000</code>",
          "<code>6=499000|699000</code>",
          "",
          "Birinchi narx hozirgi narx, ikkinchisi chizilgan eski narx.",
        ].join("\n"),
        {
          reply_markup: {
            force_reply: true,
            input_field_placeholder: "3=299000|399000...",
          },
        }
      );
      return { ok: true };
    }

    if (data === "logout") {
      await sendBotMessage(token, chatId, "Panel yopildi. Qayta kirish: <code>/login</code>");
      return { ok: true };
    }

    return { ok: true, ignored: true };
  }

  const message = body.message || body.edited_message;
  const text = clean(message?.text, "");
  const chatId = message?.chat?.id;

  console.log("telegram update", {
    kind: body.message ? "message" : body.edited_message ? "edited_message" : "unknown",
    chatId,
    text,
  });

  if (!message || !chatId || !text) {
    return { ok: true, ignored: true };
  }

  const replyText = clean(message.reply_to_message?.text, "");
  if (replyText.includes(LOGIN_REPLY_MARKER) && !text.startsWith("/")) {
    const login = text.trim();
    await sendBotMessage(
      token,
      chatId,
      [
        PASSWORD_REPLY_MARKER,
        `Login: <code>${escapeHtml(login)}</code>`,
        "",
        "Endi parolni shu xabarga reply qilib yuboring.",
      ].join("\n"),
      {
        reply_markup: {
          force_reply: true,
          input_field_placeholder: "Parol...",
        },
      }
    );
    return { ok: true };
  }

  if (replyText.includes(PASSWORD_REPLY_MARKER) && !text.startsWith("/")) {
    const login = clean(replyText.match(/Login:\s*([^\s<]+)/)?.[1], "");
    const password = text.trim();
    if (!getBroadcastPassword()) {
      await sendBotMessage(token, chatId, "TELEGRAM_BROADCAST_PASSWORD Vercel env ichida kiritilmagan.");
    } else if (login === getAdminLogin() && password === getBroadcastPassword()) {
      await sendAdminPanel(token, chatId);
    } else {
      await sendBotMessage(token, chatId, "Login yoki parol noto'g'ri. Qayta kirish: <code>/login</code>");
    }
    return { ok: true };
  }

  if (replyText.includes(PROMO_REPLY_MARKER) && !text.startsWith("/")) {
    await runPromoBroadcast(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(PRICE_REPLY_MARKER) && !text.startsWith("/")) {
    await runBayClubPriceUpdate(token, chatId, text);
    return { ok: true };
  }

  if (text.startsWith("/start")) {
    await sendBotMessage(
      token,
      chatId,
      [
        "<b>BayTrip aksiyalar bot boshqaruvi</b>",
        "",
        "Admin panelga kirish:",
        "<code>/login</code>",
        "",
        "Login Vercel env ichidagi <code>TELEGRAM_BOT_ADMIN_LOGIN</code>, parol esa <code>TELEGRAM_BROADCAST_PASSWORD</code> qiymatidan olinadi.",
      ].join("\n"),
      {
        reply_markup: {
          inline_keyboard: [[{ text: "🔐 Login", callback_data: "login_start" }]],
        },
      }
    );
    return { ok: true };
  }

  if (text.startsWith("/login")) {
    await sendLoginPrompt(token, chatId);
    return { ok: true };
  }

  if (text.startsWith("/panel")) {
    await sendBotMessage(token, chatId, "Panelni ochish uchun login qiling: <code>/login PAROL</code>");
    return { ok: true };
  }

  if (text.startsWith("/logout")) {
    await sendBotMessage(token, chatId, "Panel yopildi. Qayta kirish: <code>/login PAROL</code>");
    return { ok: true };
  }

  if (text.startsWith("/promo") || text.startsWith("/aksiya")) {
    const bodyText = text.replace(/^\/(promo|aksiya)(@\w+)?\s*/i, "").trim();
    const [password, ...messageParts] = bodyText.split(/\s+/);
    const promoMessage = messageParts.join(" ").trim();

    if (!getBroadcastPassword()) {
      await sendBotMessage(token, chatId, "TELEGRAM_BROADCAST_PASSWORD Vercel env ichida kiritilmagan.");
      return { ok: true };
    }
    if (password !== getBroadcastPassword()) {
      await sendBotMessage(token, chatId, "Parol noto'g'ri.");
      return { ok: true };
    }
    if (promoMessage.length < 5) {
      await sendBotMessage(token, chatId, "Xabar matnini kiriting: <code>/promo PAROL xabar matni</code>");
      return { ok: true };
    }

    await runPromoBroadcast(token, chatId, promoMessage);
    return { ok: true };
  }

  return { ok: true, ignored: true };
}

function validateLead(body) {
  if (!body || typeof body !== "object") return "So'rov formati noto'g'ri.";
  if (!Object.prototype.hasOwnProperty.call(LEAD_LABELS, body.type)) return "So'rov turi noto'g'ri.";
  if (body.type === "promo-subscribe") {
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(normalizeTelegramUsername(body.telegramUsername))) {
      return "Telegram username noto'g'ri.";
    }
    return null;
  }
  if (clean(body.name, "").length < 3) return "Ism to'liq emas.";
  if (!/^\+?[\d\s()-]{9,}$/.test(clean(body.phone, ""))) return "Telefon raqam noto'g'ri.";
  if (!/^[a-zA-Z0-9_]{5,32}$/.test(normalizeTelegramUsername(body.telegramUsername))) {
    return "Telegram username noto'g'ri.";
  }

  if (body.type === "bayclub-card") {
    const required = ["cardType", "plan", "price"];
    const missing = required.find((key) => clean(body[key], "") === "");
    if (missing) return `BayClub ma'lumoti yetishmayapti: ${missing}.`;
    return null;
  }

  if (body.type !== "contact") {
    const required = ["tourTitle", "tourCity", "tourCountry", "date", "people", "price", "total"];
    const missing = required.find((key) => clean(body[key], "") === "");
    if (missing) return `Tur ma'lumoti yetishmayapti: ${missing}.`;
  }

  return null;
}

function getTopicId(type) {
  const map = {
    "external-tour": process.env.TELEGRAM_EXTERNAL_TOPIC_ID,
    "domestic-tour": process.env.TELEGRAM_DOMESTIC_TOPIC_ID,
    "bayclub-card": process.env.TELEGRAM_BAYCLUB_TOPIC_ID,
    "promo-subscribe": process.env.TELEGRAM_PROMO_TOPIC_ID || process.env.TELEGRAM_CONTACT_TOPIC_ID,
    contact: process.env.TELEGRAM_CONTACT_TOPIC_ID,
  };

  const raw = map[type];
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildClientGreeting(body) {
  const name = clean(body.name).split(/\s+/)[0];

  if (body.type === "contact") {
    const request = clean(body.message, "murojaatingiz");
    return `Assalomu aleykum, ${name}. BayTrip turizm kompaniyasi operatori bo'laman. Sayt orqali "${request}" bo'yicha murojaat qilgan ekansiz. Sizga yordam berish uchun yozdim.`;
  }

  if (body.type === "promo-subscribe") {
    return `Assalomu aleykum. BayTrip aksiyalari va chegirmali turlari haqida birinchi bo'lib xabar olish uchun obuna bo'lgan ekansiz. Tez orada eng yaxshi takliflarni yuboramiz.`;
  }

  if (body.type === "bayclub-card") {
    return `Assalomu aleykum, ${name}. BayClub Card obunasi bo'yicha ariza qoldirgan ekansiz. ${clean(body.cardType)} karta va ${clean(body.plan)} tarif haqida batafsil ma'lumot berish uchun yozdim.`;
  }

  const destination = clean(body.tourCountry);
  return `Assalomu aleykum, ${name}. BayTrip turizm kompaniyasi operatori bo'laman. "${destination} turlari" bo'yicha murojaat qilgan ekansiz. Sizga batafsil ma'lumot berish uchun yozdim.`;
}

function buildProfileDeliveryText(delivery) {
  if (!delivery?.enabled) {
    return "Admin profil seansi sozlanmagan. TELEGRAM_API_ID, TELEGRAM_API_HASH va TELEGRAM_ADMIN_SESSION kiriting.";
  }

  if (delivery.sent) {
    return `Admin profilidan mijozga 1-xabar yuborildi.`;
  }

  return `Admin profilidan yuborilmadi: ${clean(delivery.error, "noma'lum xatolik")}`;
}

async function sendAdminProfileMessage(body, message) {
  const config = getAdminProfileConfig();
  if (!config) return { enabled: false, sent: false };

  const username = `@${normalizeTelegramUsername(body.telegramUsername)}`;
  let client;

  try {
    const [{ TelegramClient }, { StringSession }] = await Promise.all([
      import("telegram"),
      import("telegram/sessions/index.js"),
    ]);

    client = new TelegramClient(new StringSession(config.session), config.apiId, config.apiHash, {
      connectionRetries: 2,
    });

    await client.connect();
    await client.sendMessage(username, { message });
    return { enabled: true, sent: true };
  } catch (error) {
    return {
      enabled: true,
      sent: false,
      error: error instanceof Error ? error.message : "Telegram profil seansi bilan aloqa uzildi.",
    };
  } finally {
    if (client) {
      await client.disconnect().catch(() => {});
    }
  }
}

function buildMessage(body, profileDelivery) {
  const label = LEAD_LABELS[body.type];
  const source = clean(body.source, "Sayt");
  const telegramUsername = `@${normalizeTelegramUsername(body.telegramUsername)}`;
  const clientGreeting = buildClientGreeting(body);
  const createdAt = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const lines = [
    `<b>${escapeHtml(label)}</b>`,
    "",
    `💬 <b>Telegram:</b> ${escapeHtml(telegramUsername)}`,
  ];

  if (body.type !== "promo-subscribe") {
    lines.splice(
      2,
      0,
      `👤 <b>Mijoz:</b> ${escapeHtml(clean(body.name))}`,
      `📞 <b>Telefon:</b> ${escapeHtml(clean(body.phone))}`
    );
  }

  if (body.type === "promo-subscribe") {
    lines.push(
      "",
      `📣 <b>Obuna:</b> Aksiyalar va chegirmali turlar`,
      `✅ <b>Eslatma:</b> Bot orqali xabar yuborish uchun foydalanuvchi botga /start bosgan bo'lishi kerak.`
    );
  } else if (body.type === "contact") {
    lines.push(`💬 <b>Xabar:</b> ${escapeHtml(clean(body.message, "Ko'rsatilmagan"))}`);
  } else if (body.type === "bayclub-card") {
    lines.push(
      "",
      `💳 <b>Karta turi:</b> ${escapeHtml(clean(body.cardType))}`,
      `📆 <b>Obuna muddati:</b> ${escapeHtml(clean(body.plan))}`,
      `💵 <b>Narx:</b> ${escapeHtml(clean(body.price))}`,
      `🎁 <b>Chegirma:</b> Har bir tur paketiga 20%`
    );
  } else {
    lines.push(
      "",
      `🧳 <b>Tur:</b> ${escapeHtml(clean(body.tourTitle))}`,
      `📍 <b>Yo'nalish:</b> ${escapeHtml(clean(body.tourCity))}, ${escapeHtml(clean(body.tourCountry))}`,
      `📅 <b>Sana:</b> ${escapeHtml(clean(body.date))}`,
      `👥 <b>Sayohatchilar:</b> ${escapeHtml(clean(body.people))}`,
      `💵 <b>Narx:</b> ${escapeHtml(clean(body.price))}`,
      `🧾 <b>Jami:</b> ${escapeHtml(clean(body.total))}`
    );
  }

  lines.push(
    "",
    `🤖 <b>Bot/profil uchun 1-xabar:</b>`,
    escapeHtml(clientGreeting),
    "",
    `📨 <b>Profil xabari statusi:</b> ${escapeHtml(buildProfileDeliveryText(profileDelivery))}`,
    "",
    `🔎 <b>Manba:</b> ${escapeHtml(source)}`,
    `🕒 <b>Vaqt:</b> ${escapeHtml(createdAt)}`
  );

  return lines.join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Faqat POST so'rov qabul qilinadi." });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Telegram sozlamalari kiritilmagan." });
  }

  const body = await readRequestBody(req);
  if (!body) {
    console.log("telegram endpoint empty or invalid json body");
    return res.status(400).json({ ok: false, error: "JSON formati noto'g'ri." });
  }

  const isTelegramUpdate =
    Object.prototype.hasOwnProperty.call(body ?? {}, "update_id") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "message") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "edited_message") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "callback_query") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "channel_post") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "my_chat_member") ||
    Object.prototype.hasOwnProperty.call(body ?? {}, "chat_member");

  if (isTelegramUpdate) {
    const result = await handleBotUpdate(body, token);
    return res.status(200).json(result);
  }

  console.log("lead request", { type: body?.type ?? "missing" });

  const error = validateLead(body);
  if (error) {
    return res.status(400).json({ ok: false, error });
  }

  const clientGreeting = buildClientGreeting(body);
  const profileDelivery = await sendAdminProfileMessage(body, clientGreeting);

  const payload = {
    chat_id: chatId,
    text: buildMessage(body, profileDelivery),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  const threadId = getTopicId(body.type);
  if (threadId) {
    payload.message_thread_id = threadId;
  }

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await telegramResponse.json();
    if (!telegramResponse.ok || !data.ok) {
      const description = data.description || "Telegramga yuborib bo'lmadi.";
      return res.status(502).json({ ok: false, error: description });
    }

    return res.status(200).json({ ok: true, profileMessageSent: profileDelivery.sent });
  } catch {
    return res.status(502).json({ ok: false, error: "Telegram bilan aloqa uzildi." });
  }
}
