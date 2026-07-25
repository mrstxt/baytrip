const LEAD_LABELS = {
  "external-tour": "Tashqi tur paketi",
  "domestic-tour": "Ichki tur paketi",
  "bayclub-card": "BayClub Card obunasi",
  contact: "Murojaat",
};

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

function getAdminProfileConfig() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = clean(process.env.TELEGRAM_API_HASH, "");
  const session = clean(process.env.TELEGRAM_ADMIN_SESSION, "");

  if (!Number.isFinite(apiId) || !apiHash || !session) {
    return null;
  }

  return { apiId, apiHash, session };
}

function validateLead(body) {
  if (!body || typeof body !== "object") return "So'rov formati noto'g'ri.";
  if (!Object.prototype.hasOwnProperty.call(LEAD_LABELS, body.type)) return "So'rov turi noto'g'ri.";
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
    `👤 <b>Mijoz:</b> ${escapeHtml(clean(body.name))}`,
    `📞 <b>Telefon:</b> ${escapeHtml(clean(body.phone))}`,
    `💬 <b>Telegram:</b> ${escapeHtml(telegramUsername)}`,
  ];

  if (body.type === "contact") {
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

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: "JSON formati noto'g'ri." });
    }
  }

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
