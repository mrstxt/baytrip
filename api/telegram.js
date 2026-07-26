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
const GROUP_LEADS_REPLY_MARKER = "Guruh lid sozlamalarini shu xabarga reply qilib yuboring.";
const GROUP_LEADS_CONFIG_MARKER = "GROUP_LEADS_CONFIG";
const GROUP_LEADS_STATE_MARKER = "GROUP_LEADS_STATE";

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

function isValidTelegramUsername(value) {
  const username = normalizeTelegramUsername(value);
  return /^[a-zA-Z0-9_]{5,32}$/.test(username);
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
  const allowedUsernames = allowed.map((value) => value.replace(/^@+/, "").toLowerCase());
  return allowed.includes(id) || allowedUsernames.includes(username.toLowerCase());
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

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    console.error("telegram sendMessage failed", {
      chatId,
      status: response.status,
      description: data?.description,
    });
  }
  return data;
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
      [{ text: "🔎 Guruh lid sozlamalari", callback_data: "group_leads_config" }],
      [{ text: "🧾 Oxirgi amallar", callback_data: "recent_actions" }],
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
      "🔎 Guruhlardan lid yig'ish sozlamalari",
      "🧾 Oxirgi sozlama amallarini ko'rish",
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

function getBayClubConfigTopicIds() {
  return [
    process.env.TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID,
    process.env.TELEGRAM_BAYCLUB_TOPIC_ID,
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .filter((value, index, values) => values.indexOf(value) === index);
}

function mergePriceConfigs(configs) {
  return configs.reduce((merged, config) => ({ ...merged, ...config }), {});
}

function hasAllBayClubPlans(config) {
  return ["3 oy", "6 oy", "12 oy"].every((plan) => config?.[plan]?.price);
}

async function getLatestBayClubPriceConfig() {
  const topicIds = getBayClubConfigTopicIds();
  if (topicIds.length === 0) return {};

  return withAdminClient(async (client) => {
    const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
    const configs = [];
    const wantedPlans = new Set(["3 oy", "6 oy", "12 oy"]);

    for (const topicId of topicIds) {
      const iterator = client.iterMessages(entity, { limit: 150, replyTo: topicId });

      for await (const message of iterator) {
        const parsed = parseMarkerJson(message.message, PRICE_CONFIG_MARKER);
        if (!parsed) continue;

        configs.unshift(parsed);
        const merged = mergePriceConfigs(configs);
        if ([...wantedPlans].every((plan) => merged[plan])) {
          return merged;
        }
      }
    }

    return mergePriceConfigs(configs);
  });
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

function getGroupLeadsConfigTopicId() {
  const raw =
    process.env.TELEGRAM_GROUP_LEADS_CONFIG_TOPIC_ID ||
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID ||
    process.env.TELEGRAM_CONTACT_TOPIC_ID;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseMarkerJson(text, marker) {
  const raw = String(text ?? "");
  if (!raw.includes(marker)) return null;
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd <= jsonStart) return null;

  try {
    return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
  } catch {
    return null;
  }
}

function formatActionDate(date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date instanceof Date ? date : new Date());
}

function getActionAuthor(message) {
  const sender = message.sender;
  const username = clean(sender?.username, "");
  const firstName = clean(sender?.firstName, "");
  const lastName = clean(sender?.lastName, "");
  const name = clean([firstName, lastName].filter(Boolean).join(" "), username || "Bot/admin");
  return username ? `${name} (@${username})` : name;
}

function summarizeBayClubPrices(config) {
  return Object.entries(config ?? {})
    .map(([plan, value]) => {
      const price = clean(value?.price, "");
      const oldPrice = clean(value?.oldPrice, "");
      return oldPrice ? `${plan}: ${price} / eski: ${oldPrice}` : `${plan}: ${price}`;
    })
    .join("\n");
}

function summarizeGroupLeadsConfig(config) {
  const groups = Array.isArray(config?.groups) ? config.groups : [];
  const keywords = Array.isArray(config?.keywords) ? config.keywords : [];
  return [
    `Guruhlar: ${groups.length}`,
    groups.slice(0, 5).map((group) => `- ${clean(group.title, group.id)}`).join("\n"),
    `Kalit so'zlar: ${keywords.slice(0, 12).join(", ") || "-"}`,
  ].filter(Boolean).join("\n");
}

function summarizeGroupLeadsState(state) {
  const entries = Object.entries(state ?? {});
  return entries.length ? `Kuzatilayotgan guruh state: ${entries.length} ta guruh` : "State bo'sh";
}

function parseActionMessage(message) {
  const text = clean(message.message, "");
  const knownMarkers = [
    {
      marker: PRICE_CONFIG_MARKER,
      title: "BayClub narxlari yangilandi",
      summary: summarizeBayClubPrices,
    },
    {
      marker: GROUP_LEADS_CONFIG_MARKER,
      title: "Guruh lid sozlamalari yangilandi",
      summary: summarizeGroupLeadsConfig,
    },
    {
      marker: GROUP_LEADS_STATE_MARKER,
      title: "Guruh lid scan state yangilandi",
      summary: summarizeGroupLeadsState,
    },
  ];

  for (const item of knownMarkers) {
    const parsed = parseMarkerJson(text, item.marker);
    if (!parsed) continue;
    return {
      id: message.id,
      date: message.date,
      title: item.title,
      author: getActionAuthor(message),
      summary: item.summary(parsed),
    };
  }

  return null;
}

async function getRecentAdminActions() {
  const topicIds = [
    getBayClubConfigTopicId(),
    getGroupLeadsConfigTopicId(),
  ].filter(Boolean);
  const uniqueTopicIds = [...new Set(topicIds)];

  if (uniqueTopicIds.length === 0) {
    throw new Error("Config topic ID topilmadi.");
  }

  return withAdminClient(async (client) => {
    const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
    const actions = [];
    const limit = Number(process.env.TELEGRAM_ADMIN_ACTIONS_SCAN_LIMIT || 80);

    for (const topicId of uniqueTopicIds) {
      const iterator = client.iterMessages(entity, {
        limit: Number.isFinite(limit) ? limit : 80,
        replyTo: topicId,
      });

      for await (const message of iterator) {
        const action = parseActionMessage(message);
        if (action) actions.push({ ...action, topicId });
      }
    }

    return actions
      .sort((a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0))
      .slice(0, Number(process.env.TELEGRAM_ADMIN_ACTIONS_LIMIT || 8));
  });
}

function buildRecentActionsMessage(actions) {
  if (actions.length === 0) {
    return [
      "<b>Oxirgi amallar</b>",
      "",
      "Hozircha config yoki sozlama amallari topilmadi.",
    ].join("\n");
  }

  const lines = ["<b>Oxirgi amallar</b>"];
  actions.forEach((action, index) => {
    lines.push(
      "",
      `<b>${index + 1}. ${escapeHtml(action.title)}</b>`,
      `🕒 ${escapeHtml(formatActionDate(action.date))}`,
      `👤 ${escapeHtml(action.author)}`,
      `📌 Topic ID: <code>${escapeHtml(action.topicId)}</code>`,
      escapeHtml(action.summary)
    );
  });

  return lines.join("\n");
}

async function sendRecentAdminActions(token, chatId) {
  try {
    const actions = await getRecentAdminActions();
    await sendBotMessage(token, chatId, buildRecentActionsMessage(actions), {
      reply_markup: buildAdminPanelKeyboard(),
    });
  } catch (error) {
    await sendBotMessage(
      token,
      chatId,
      `Oxirgi amallarni o'qishda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`,
      { reply_markup: buildAdminPanelKeyboard() }
    );
  }
}

function parseListValue(value) {
  return String(value ?? "")
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseGroupLine(line) {
  const [rawId, rawTitle] = line.split("=").map((item) => item.trim());
  if (!rawId) return null;
  return {
    id: rawId,
    title: rawTitle || rawId,
  };
}

function parseGroupLeadsConfigText(text) {
  const config = {
    enabled: true,
    groups: [],
    keywords: [],
  };

  let section = "";
  for (const rawLine of String(text ?? "").split(/\n+/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const normalized = line.toLowerCase();
    if (/^(guruhlar|groups)\s*:?\s*$/.test(normalized)) {
      section = "groups";
      continue;
    }
    if (/^(kalit|keywords|sozlar|so'zlar|kalit sozlar|kalit so'zlar)\s*:?\s*$/.test(normalized)) {
      section = "keywords";
      continue;
    }

    const inlineMatch = line.match(/^(guruhlar|groups|kalit|keywords|sozlar|so'zlar|kalit sozlar|kalit so'zlar)\s*[:=]\s*(.+)$/i);
    if (inlineMatch) {
      const key = inlineMatch[1].toLowerCase();
      const value = inlineMatch[2];
      if (key === "guruhlar" || key === "groups") {
        parseListValue(value).map(parseGroupLine).filter(Boolean).forEach((group) => config.groups.push(group));
      } else {
        config.keywords.push(...parseListValue(value));
      }
      continue;
    }

    if (section === "groups") {
      const group = parseGroupLine(line.replace(/^[-*]\s*/, ""));
      if (group) config.groups.push(group);
      continue;
    }
    if (section === "keywords") {
      config.keywords.push(...parseListValue(line.replace(/^[-*]\s*/, "")));
    }
  }

  const uniqueGroups = new Map();
  for (const group of config.groups) {
    uniqueGroups.set(group.id, group);
  }

  config.groups = [...uniqueGroups.values()];
  config.keywords = [...new Set(config.keywords.map((item) => item.toLowerCase()).filter(Boolean))];

  return config;
}

async function saveGroupLeadsConfig(token, config) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID kiritilmagan.");

  const threadId = getGroupLeadsConfigTopicId();
  const text = [
    `<b>${GROUP_LEADS_CONFIG_MARKER}</b>`,
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

async function runGroupLeadsConfigUpdate(token, chatId, text) {
  const config = parseGroupLeadsConfigText(text);
  if (config.groups.length === 0 || config.keywords.length === 0) {
    await sendBotMessage(
      token,
      chatId,
      [
        "Format noto'g'ri yoki ma'lumot yetishmayapti.",
        "",
        "Namuna:",
        "<code>Guruhlar:</code>",
        "<code>@fargonaturizm=Farg'ona turizm</code>",
        "<code>-1001234567890=Samarqand sayohat</code>",
        "",
        "<code>Kalit so'zlar:</code>",
        "<code>tur kerak, ekskursiya, avia, mehmonxona, gid kerak, 5 kishi</code>",
      ].join("\n")
    );
    return;
  }

  try {
    await saveGroupLeadsConfig(token, config);
    await sendBotMessage(
      token,
      chatId,
      [
        "<b>Guruh lid sozlamalari saqlandi</b>",
        `Guruhlar: ${config.groups.length}`,
        `Kalit so'zlar: ${config.keywords.length}`,
        "",
        "Cron endpoint /api/group-leads-scan shu config bo'yicha guruhlarni tekshiradi.",
      ].join("\n"),
      { reply_markup: buildAdminPanelKeyboard() }
    );
  } catch (error) {
    await sendBotMessage(token, chatId, `Sozlamani saqlashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
  }
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
    const updatesAllPlans = hasAllBayClubPlans(config);
    const previousConfig = updatesAllPlans ? {} : await getLatestBayClubPriceConfig();
    const nextConfig = { ...previousConfig, ...config };
    await saveBayClubPriceConfig(token, nextConfig);
    await sendBotMessage(
      token,
      chatId,
      [
        "<b>BayClub narxlari yangilandi</b>",
        ...Object.entries(nextConfig).map(([title, value]) => `${title}: ${value.price}${value.oldPrice ? ` / eski: ${value.oldPrice}` : ""}`),
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

function buildTestLead(type = "contact") {
  const normalizedType = clean(type, "contact").replace(/^\/?testlead(@\w+)?\s*/i, "").trim() || "contact";
  const leadType = Object.prototype.hasOwnProperty.call(LEAD_LABELS, normalizedType) ? normalizedType : "contact";

  const base = {
    type: leadType,
    name: "Test Ariza",
    phone: "+998 00 000 00 00",
    telegramUsername: "",
    source: "Bot test command",
  };

  if (leadType === "promo-subscribe") {
    return {
      type: "promo-subscribe",
      telegramUsername: "baytrip_test",
      source: "Bot test command",
    };
  }

  if (leadType === "bayclub-card") {
    return {
      ...base,
      type: "bayclub-card",
      telegramUsername: "baytrip_test",
      cardType: "Men",
      plan: "3 oy",
      price: "Test",
    };
  }

  if (leadType === "external-tour" || leadType === "domestic-tour") {
    return {
      ...base,
      type: leadType,
      tourTitle: "Test tur",
      tourCity: "Toshkent",
      tourCountry: leadType === "external-tour" ? "Turkiya" : "O'zbekiston",
      date: "Test sana",
      people: 2,
      price: "Test",
      total: "Test",
    };
  }

  return {
    ...base,
    type: "contact",
    message: "Bu bot orqali yuborilgan test murojaat.",
  };
}

async function runTestLead(token, chatId, type) {
  const body = buildTestLead(type);
  const profileDelivery = { enabled: false, sent: false };
  const threadId = getTopicId(body.type);
  const payload = {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: buildMessage(body, profileDelivery),
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (threadId) {
    payload.message_thread_id = threadId;
  }

  const delivery = await sendLeadToTelegram(token, payload);
  if (!delivery.ok) {
    await sendBotMessage(token, chatId, `Test ariza yuborilmadi: ${escapeHtml(delivery.error)}`);
    return;
  }

  await sendBotMessage(
    token,
    chatId,
    [
      "<b>Test ariza yuborildi</b>",
      `Turi: <code>${escapeHtml(body.type)}</code>`,
      `Topic ID: <code>${escapeHtml(threadId || "asosiy guruh")}</code>`,
      `Telegram message ID: <code>${escapeHtml(delivery.telegramMessageId || "-")}</code>`,
      `Fallback main chat: <code>${escapeHtml(delivery.fallbackToMainChat ? "true" : "false")}</code>`,
    ].join("\n"),
    { reply_markup: buildAdminPanelKeyboard() }
  );
}

async function handleBotUpdate(body, token) {
  if (body.callback_query) {
    const callback = body.callback_query;
    const chatId = callback.message?.chat?.id;
    const data = clean(callback.data, "");

    if (!chatId) return { ok: true, ignored: true };
    if (data !== "login_start" && !isAllowedAdmin(callback)) {
      await answerCallbackQuery(token, callback.id, "Bu amal uchun ruxsat yo'q.");
      return { ok: true, ignored: true };
    }
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

    if (data === "group_leads_config") {
      await sendBotMessage(
        token,
        chatId,
        [
          GROUP_LEADS_REPLY_MARKER,
          "",
          "Namuna:",
          "<code>Guruhlar:</code>",
          "<code>@fargonaturizm=Farg'ona turizm</code>",
          "<code>-1001234567890=Samarqand sayohat</code>",
          "",
          "<code>Kalit so'zlar:</code>",
          "<code>tur kerak, ekskursiya, avia, mehmonxona, gid kerak, 5 kishi</code>",
          "",
          "Guruh ID o'rniga public @username ham yozsa bo'ladi. Profil session o'sha guruhga kirgan bo'lishi kerak.",
        ].join("\n"),
        {
          reply_markup: {
            force_reply: true,
            input_field_placeholder: "Guruhlar va kalit so'zlar...",
          },
        }
      );
      return { ok: true };
    }

    if (data === "recent_actions") {
      await sendRecentAdminActions(token, chatId);
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
    } else if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, "Bu admin uchun ruxsat berilmagan.");
    } else if (login === getAdminLogin() && password === getBroadcastPassword()) {
      await sendAdminPanel(token, chatId);
    } else {
      await sendBotMessage(token, chatId, "Login yoki parol noto'g'ri. Qayta kirish: <code>/login</code>");
    }
    return { ok: true };
  }

  if (replyText.includes(PROMO_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, "Bu admin uchun ruxsat berilmagan.");
      return { ok: true };
    }
    await runPromoBroadcast(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(PRICE_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, "Bu admin uchun ruxsat berilmagan.");
      return { ok: true };
    }
    await runBayClubPriceUpdate(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(GROUP_LEADS_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, "Bu admin uchun ruxsat berilmagan.");
      return { ok: true };
    }
    await runGroupLeadsConfigUpdate(token, chatId, text);
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

  if (text.startsWith("/testlead")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, "Bu admin uchun ruxsat berilmagan.");
      return { ok: true };
    }

    const type = text.replace(/^\/testlead(@\w+)?\s*/i, "").trim() || "contact";
    await runTestLead(token, chatId, type);
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

    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, "Bu admin uchun ruxsat berilmagan.");
      return { ok: true };
    }
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
    if (!isValidTelegramUsername(body.telegramUsername)) {
      return "Telegram username noto'g'ri.";
    }
    return null;
  }
  if (clean(body.name, "").length < 3) return "Ism to'liq emas.";
  if (!/^\+?[\d\s()-]{9,}$/.test(clean(body.phone, ""))) return "Telefon raqam noto'g'ri.";

  if (body.type === "bayclub-card") {
    if (!isValidTelegramUsername(body.telegramUsername)) {
      return "Telegram username noto'g'ri.";
    }
    const required = ["cardType", "plan", "price"];
    const missing = required.find((key) => clean(body[key], "") === "");
    if (missing) return `BayClub ma'lumoti yetishmayapti: ${missing}.`;
    return null;
  }

  if (clean(body.telegramUsername, "") && !isValidTelegramUsername(body.telegramUsername)) {
    return "Telegram username noto'g'ri.";
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
    "promo-subscribe": process.env.TELEGRAM_PROMO_TOPIC_ID || getContactTopicRaw(),
    contact: getContactTopicRaw(),
  };

  const raw = map[type];
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getContactTopicRaw() {
  return (
    process.env.TELEGRAM_CONTACT_TOPIC_ID ||
    process.env.TELEGRAM_SUPPORT_TOPIC_ID ||
    process.env.TELEGRAM_MUROJAAT_TOPIC_ID ||
    process.env.TELEGRAM_MUROJAATLAR_TOPIC_ID
  );
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

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function sendAdminProfileMessage(body, message) {
  const config = getAdminProfileConfig();
  if (!config) return { enabled: false, sent: false };
  if (!isValidTelegramUsername(body.telegramUsername)) {
    return { enabled: true, sent: false, error: "Mijoz Telegram username qoldirmagan." };
  }

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
  const telegramUsername = isValidTelegramUsername(body.telegramUsername)
    ? `@${normalizeTelegramUsername(body.telegramUsername)}`
    : "";
  const clientGreeting = buildClientGreeting(body);
  const createdAt = new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  const lines = [
    `<b>${escapeHtml(label)}</b>`,
    "",
    `💬 <b>Telegram:</b> ${escapeHtml(telegramUsername || "Ko'rsatilmagan")}`,
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

async function sendLeadToTelegram(token, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (response.ok && data?.ok) {
    return {
      ok: true,
      data,
      fallbackToMainChat: false,
      telegramMessageId: data.result?.message_id,
      telegramChatId: data.result?.chat?.id,
      telegramThreadId: data.result?.message_thread_id,
    };
  }

  const description = data?.description || "Telegramga yuborib bo'lmadi.";
  console.error("lead sendMessage failed", {
    status: response.status,
    description,
    chatId: payload.chat_id,
    threadId: payload.message_thread_id,
  });

  if (!payload.message_thread_id) {
    return { ok: false, error: description };
  }

  const fallbackPayload = {
    ...payload,
    text: [
      "⚠️ <b>Topic ID bo'yicha yuborilmadi, asosiy guruhga tushdi.</b>",
      `Xato: ${escapeHtml(description)}`,
      `Topic ID: <code>${escapeHtml(payload.message_thread_id)}</code>`,
      "",
      payload.text,
    ].join("\n"),
  };
  delete fallbackPayload.message_thread_id;

  const fallbackResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fallbackPayload),
  });
  const fallbackData = await fallbackResponse.json().catch(() => null);

  if (!fallbackResponse.ok || !fallbackData?.ok) {
    return {
      ok: false,
      error: fallbackData?.description || description,
    };
  }

  return {
    ok: true,
    data: fallbackData,
    fallbackToMainChat: true,
    originalError: description,
    telegramMessageId: fallbackData.result?.message_id,
    telegramChatId: fallbackData.result?.chat?.id,
    telegramThreadId: fallbackData.result?.message_thread_id,
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const topicIds = {
      external: getTopicId("external-tour"),
      domestic: getTopicId("domestic-tour"),
      bayclub: getTopicId("bayclub-card"),
      promo: getTopicId("promo-subscribe"),
      contact: getTopicId("contact"),
    };
    return res.status(200).json({
      ok: true,
      service: "telegram",
      webhook: "/api/telegram",
      hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
      chatIdPreview: process.env.TELEGRAM_CHAT_ID
        ? `${String(process.env.TELEGRAM_CHAT_ID).slice(0, 5)}...${String(process.env.TELEGRAM_CHAT_ID).slice(-4)}`
        : null,
      hasAdminSession: Boolean(getAdminProfileConfig()),
      topicIds,
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Faqat GET yoki POST so'rov qabul qilinadi." });
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
    try {
      const result = await handleBotUpdate(body, token);
      return res.status(200).json(result);
    } catch (error) {
      console.error("telegram update handler failed", {
        error: error instanceof Error ? error.message : error,
        updateId: body?.update_id,
      });
      return res.status(200).json({
        ok: false,
        error: error instanceof Error ? error.message : "Telegram update ishlanmadi.",
      });
    }
  }

  console.log("lead request", { type: body?.type ?? "missing" });

  const error = validateLead(body);
  if (error) {
    return res.status(400).json({ ok: false, error });
  }

  try {
    const clientGreeting = buildClientGreeting(body);
    const profileDelivery = await withTimeout(
      sendAdminProfileMessage(body, clientGreeting),
      Number(process.env.TELEGRAM_PROFILE_MESSAGE_TIMEOUT_MS || 3500),
      { enabled: true, sent: false, error: "Profil xabari timeout bo'ldi, ariza topicga yuborildi." }
    );

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

    const delivery = await sendLeadToTelegram(token, payload);
    if (!delivery.ok) {
      return res.status(502).json({ ok: false, error: delivery.error });
    }

    return res.status(200).json({
      ok: true,
      profileMessageSent: profileDelivery.sent,
      topicId: threadId,
      fallbackToMainChat: delivery.fallbackToMainChat,
      telegramMessageId: delivery.telegramMessageId,
      telegramChatId: delivery.telegramChatId,
      telegramThreadId: delivery.telegramThreadId,
    });
  } catch (error) {
    console.error("lead request failed", {
      error: error instanceof Error ? error.message : error,
      type: body?.type,
    });
    return res.status(502).json({ ok: false, error: "Telegram bilan aloqa uzildi." });
  }
}
