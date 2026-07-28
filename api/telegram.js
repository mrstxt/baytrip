import { Api } from "telegram";

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
const GROUP_LEADS_GROUPS_REPLY_MARKER = "Guruhlar ro'yxatini shu xabarga reply qilib yuboring.";
const GROUP_LEADS_KEYWORDS_REPLY_MARKER = "Kalit so'zlarni shu xabarga reply qilib yuboring.";
const GROUP_LEADS_EMPLOYEES_REPLY_MARKER = "Hodimlar ro'yxatini shu xabarga reply qilib yuboring.";
const GROUP_LEADS_CONFIG_MARKER = "GROUP_LEADS_CONFIG";
const GROUP_LEADS_STATE_MARKER = "GROUP_LEADS_STATE";
const GROUP_LEAD_DATA_MARKER = "GROUP_LEAD_DATA";
const SITE_LEAD_DATA_MARKER = "SITE_LEAD_DATA";
const GROUP_LEAD_FEEDBACK_MARKER = "GROUP_LEAD_FEEDBACK";
const GROUP_LEAD_CONFIRM_CALLBACK = "gl_confirm";
const GROUP_LEAD_CANCEL_CALLBACK = "gl_cancel";
const GROUP_LEAD_AGENT_CALLBACK_PREFIX = "gl_agent:";
const BUTTON_PROMO = "📣 Aksiya xabar yuborish";
const BUTTON_BAYCLUB_PRICES = "💳 BayClub narxlari";
const BUTTON_GROUP_LEADS = "🔎 Guruh lidlari";
const BUTTON_LEAD_SCANNER = "🧭 Lid skaner";
const BUTTON_GROUPS = "👥 Guruhlarni sozlash";
const BUTTON_KEYWORDS = "🔑 Kalit so'zlar";
const BUTTON_EMPLOYEES = "👤 Hodimlar";
const BUTTON_STATS = "📊 Statistika";
const BUTTON_RECENT_ACTIONS = "🧾 Oxirgi amallar";
const BUTTON_CLEANUP = "🧹 Xabarlarni tozalash";
const BUTTON_LOGOUT = "🚪 Chiqish";
const BUTTON_BACK = "⬅️ Orqaga";
const DEFAULT_GROUP_LEAD_GROUPS = [
  { id: "-1001382725545", title: "Союз" },
  { id: "-1003546137685", title: "Levora B2B" },
  { id: "-1001614487338", title: "Meridian World" },
  { id: "-1001840866049", title: "Guides of Uzbekistan" },
];
const DEFAULT_GROUP_LEAD_KEYWORD_COUNT = 100;
const DEFAULT_GROUP_LEAD_RUSSIAN_KEYWORD_COUNT = 30;
const DEFAULT_GROUP_LEAD_SCAN_WINDOW_MINUTES = 60;
const DEFAULT_GROUP_LEAD_MESSAGE_LIMIT = 100;

const DEFAULT_STORAGE_CHAT_ID = "-5025743465";

let groupLeadEmployeesCache = null;
const pendingAdminLogins = new Map();

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

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/ʻ|ʼ|`/g, "'")
    .replace(/\s+/g, " ")
    .trim();
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

function isEnabledEnv(value) {
  return ["1", "true", "yes", "on"].includes(clean(value, "").toLowerCase());
}

function isThreadStorageEnabled() {
  return false;
}

function parseTopicId(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function uniqueValues(values) {
  return values.filter((value, index) => value && values.indexOf(value) === index);
}

function getStorageChatId() {
  return clean(
    process.env.TELEGRAM_STORAGE_CHAT_ID ||
    DEFAULT_STORAGE_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID,
    ""
  );
}

function getStorageChatIds() {
  return uniqueValues([
    getStorageChatId(),
    clean(process.env.TELEGRAM_CHAT_ID, ""),
  ]);
}

function getStorageReadTargets(topicIds = []) {
  const storageChatId = getStorageChatId();
  const mainChatId = clean(process.env.TELEGRAM_CHAT_ID, "");
  const cleanTopicIds = topicIds.filter((value) => Number.isFinite(value));
  const targets = [];

  if (storageChatId) {
    targets.push({ chatId: storageChatId, topicIds: [undefined] });
  }

  if (mainChatId && mainChatId !== storageChatId) {
    targets.push({ chatId: mainChatId, topicIds: [undefined, ...cleanTopicIds] });
  } else if (targets.length > 0) {
    targets[0].topicIds = [...targets[0].topicIds, ...cleanTopicIds];
  }

  return targets;
}

function getTopicSearchIds(...values) {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .filter((value, index, list) => list.indexOf(value) === index);
}

function buildMessageSearchOptions(limit, topicId) {
  return topicId ? { limit, replyTo: topicId } : { limit };
}

function getStorageMessageOptions() {
  return {};
}

function getTelegramEntityInput(chatId) {
  const value = clean(chatId, "");
  if (/^-100\d{6,}$/.test(value)) {
    return new Api.PeerChannel({ channelId: BigInt(value.slice(4)) });
  }
  if (/^-\d+$/.test(value)) {
    return new Api.PeerChat({ chatId: BigInt(value.slice(1)) });
  }
  return /^-?\d+$/.test(value) ? Number(value) : value;
}

function encodeMarkerPayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

function buildMarkerText(marker, payload, title = "") {
  return [
    title,
    title ? "" : "",
    `<b>${marker}</b>`,
    "",
    `<code>${escapeHtml(encodeMarkerPayload(payload))}</code>`,
  ].filter((line, index, lines) => line || (lines[index - 1] && lines[index + 1])).join("\n");
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

function buildAdminDeniedText(message) {
  const from = message?.from;
  const id = from?.id ? String(from.id) : "topilmadi";
  const username = normalizeTelegramUsername(from?.username);

  return [
    "Bu admin uchun ruxsat berilmagan.",
    "",
    "Vercel env ichidagi <code>TELEGRAM_BROADCAST_ADMIN_IDS</code> ga quyidagilardan birini qo'shing:",
    `ID: <code>${escapeHtml(id)}</code>`,
    username ? `Username: <code>@${escapeHtml(username)}</code>` : "Username: <code>topilmadi</code>",
  ].join("\n");
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

async function editMessageReplyMarkup(token, chatId, messageId, replyMarkup) {
  const response = await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      reply_markup: replyMarkup,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    console.error("telegram editMessageReplyMarkup failed", {
      chatId,
      messageId,
      status: response.status,
      description: data?.description,
    });
  }
  return data;
}

async function editBotMessageText(token, chatId, messageId, text, extra = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      disable_web_page_preview: true,
      ...extra,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    console.error("telegram editMessageText failed", {
      chatId,
      messageId,
      status: response.status,
      description: data?.description,
    });
  }
  return data;
}

async function deleteBotMessage(token, chatId, messageId) {
  const response = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    console.error("telegram deleteMessage failed", {
      chatId,
      messageId,
      status: response.status,
      description: data?.description,
    });
  }
  return data;
}

async function deleteChatMessages(token, chatId, messageIds = []) {
  const uniqueIds = [...new Set(messageIds.filter(Boolean))];
  const results = [];
  for (const messageId of uniqueIds) {
    results.push(await deleteBotMessage(token, chatId, messageId));
  }
  return results;
}

function buildAdminPanelKeyboard() {
  return {
    keyboard: [
      [{ text: BUTTON_PROMO }, { text: BUTTON_BAYCLUB_PRICES }],
      [{ text: BUTTON_GROUP_LEADS }, { text: BUTTON_LEAD_SCANNER }],
      [{ text: BUTTON_STATS }, { text: BUTTON_RECENT_ACTIONS }],
      [{ text: BUTTON_CLEANUP }],
      [{ text: BUTTON_LOGOUT }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function buildGroupLeadsKeyboard() {
  return {
    keyboard: [
      [{ text: BUTTON_GROUPS }, { text: BUTTON_KEYWORDS }],
      [{ text: BUTTON_EMPLOYEES }],
      [{ text: BUTTON_BACK }],
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function buildRemoveKeyboard() {
  return {
    remove_keyboard: true,
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
      "🔎 Guruh lidlari: 1 soat, oxirgi 30 xabar, 100 ta default kalit so'z",
      "🧭 Lid skaner: hoziroq test scan qilish",
      "📊 Hodimlar va murojaatlar statistikasi",
      "🧾 Oxirgi sozlama amallarini ko'rish",
      "🧹 Bot yozgan yordamchi xabarlarni tozalash",
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

async function sendPromoPrompt(token, chatId) {
  return sendBotMessage(
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
        input_field_placeholder: "Aksiya xabari...",
      },
    }
  );
}

async function sendBayClubPricePrompt(token, chatId) {
  return sendBotMessage(
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
}

async function sendGroupLeadsMenu(token, chatId) {
  return sendBotMessage(
    token,
    chatId,
    [
      "<b>Guruh lidlari sozlamalari</b>",
      "",
      `Default algoritm: oxirgi 1 soatdagi eng so'nggi ${DEFAULT_GROUP_LEAD_MESSAGE_LIMIT} ta xabar tekshiriladi.`,
      `Default guruhlar: ${DEFAULT_GROUP_LEAD_GROUPS.length} ta.`,
      `Default kalit so'zlar: ${DEFAULT_GROUP_LEAD_KEYWORD_COUNT} ta (${DEFAULT_GROUP_LEAD_RUSSIAN_KEYWORD_COUNT} ta ruscha).`,
      "",
      "Guruhlarni, qo'shimcha kalit so'zlarni va hodimlarni alohida kiritish mumkin.",
      "Profil session kiritilgan guruhlarni o'qiy olishi kerak.",
    ].join("\n"),
    { reply_markup: buildGroupLeadsKeyboard() }
  );
}

async function sendGroupLeadsGroupsPrompt(token, chatId) {
  return sendBotMessage(
    token,
    chatId,
    [
      GROUP_LEADS_GROUPS_REPLY_MARKER,
      "",
      "Har qatorga bittadan guruh yozing:",
      "<code>@fargonaturizm=Farg'ona turizm</code>",
      "<code>-1001234567890=Samarqand sayohat</code>",
      "",
      "Guruh ID o'rniga public @username ham yozsa bo'ladi.",
    ].join("\n"),
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "@guruh=Guruh nomi...",
      },
    }
  );
}

async function sendGroupLeadsKeywordsPrompt(token, chatId) {
  return sendBotMessage(
    token,
    chatId,
    [
      GROUP_LEADS_KEYWORDS_REPLY_MARKER,
      "",
      "Kalit so'zlarni vergul yoki yangi qatorda yozing:",
      "<code>tur kerak, ekskursiya, avia, mehmonxona, gid kerak, 5 kishi</code>",
    ].join("\n"),
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "tur kerak, ekskursiya...",
      },
    }
  );
}

async function sendGroupLeadsEmployeesPrompt(token, chatId) {
  return sendBotMessage(
    token,
    chatId,
    [
      GROUP_LEADS_EMPLOYEES_REPLY_MARKER,
      "",
      "Hodim ismlarini vergul bilan yoki yangi qatorda yozing:",
      "<code>Shoxruza, Sohibjon, Aziz</code>",
    ].join("\n"),
    {
      reply_markup: {
        force_reply: true,
        input_field_placeholder: "Shoxruza, Sohibjon...",
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
  return parseTopicId(process.env.TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID, process.env.TELEGRAM_BAYCLUB_TOPIC_ID);
}

function getBayClubConfigTopicIds() {
  return getTopicSearchIds(
    process.env.TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID,
    process.env.TELEGRAM_BAYCLUB_TOPIC_ID
  );
}

function mergePriceConfigs(configs) {
  return configs.reduce((merged, config) => ({ ...merged, ...config }), {});
}

function hasAllBayClubPlans(config) {
  return ["3 oy", "6 oy", "12 oy"].every((plan) => config?.[plan]?.price);
}

async function getLatestBayClubPriceConfig() {
  return withAdminClient(async (client) => {
    const configs = [];
    const wantedPlans = new Set(["3 oy", "6 oy", "12 oy"]);
    const topicIds = getBayClubConfigTopicIds();

    for (const target of getStorageReadTargets(topicIds)) {
      try {
        const entity = await client.getEntity(getTelegramEntityInput(target.chatId));
        for (const topicId of target.topicIds) {
          const iterator = client.iterMessages(entity, buildMessageSearchOptions(150, topicId));

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
      } catch {
        // Storage yoki eski topic session uchun ko'rinmasa, narx yangilash to'xtamasin.
      }
    }

    return mergePriceConfigs(configs);
  });
}

async function saveBayClubPriceConfig(token, config) {
  const chatId = getStorageChatId();
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID kiritilmagan.");

  await sendBotMessage(
    token,
    chatId,
    buildMarkerText(PRICE_CONFIG_MARKER, config),
    getStorageMessageOptions()
  );
}

function getGroupLeadsConfigTopicId() {
  return parseTopicId(
    process.env.TELEGRAM_GROUP_LEADS_CONFIG_TOPIC_ID,
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID,
    process.env.TELEGRAM_CONTACT_TOPIC_ID
  );
}

function getGroupLeadsConfigTopicIds() {
  return getTopicSearchIds(
    process.env.TELEGRAM_GROUP_LEADS_CONFIG_TOPIC_ID,
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID,
    process.env.TELEGRAM_CONTACT_TOPIC_ID
  );
}

function parseMarkerJson(text, marker) {
  const raw = String(text ?? "");
  if (!raw.includes(marker)) return null;
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");

  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    try {
      return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      // Eski JSON format buzilgan bo'lsa, pastdagi yopiq format ham tekshiriladi.
    }
  }

  const markerIndex = raw.indexOf(marker);
  const afterMarker = raw.slice(markerIndex + marker.length);
  const encoded = afterMarker.match(/[A-Za-z0-9+/]{16,}={0,2}/)?.[0];
  if (!encoded) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function getCallbackUserName(callback) {
  const from = callback?.from;
  const first = clean(from?.first_name, "");
  const last = clean(from?.last_name, "");
  const username = normalizeTelegramUsername(from?.username);
  return clean([first, last].filter(Boolean).join(" "), username || "Hodim");
}

function getGroupLeadEmployeesFromEnv() {
  const fromEnv = clean(process.env.TELEGRAM_GROUP_LEADS_EMPLOYEES || process.env.TELEGRAM_EMPLOYEES, "");
  return fromEnv
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getGroupLeadEmployees(callback) {
  if (groupLeadEmployeesCache) {
    return groupLeadEmployeesCache.length ? groupLeadEmployeesCache : [getCallbackUserName(callback)];
  }

  try {
    const config = await getLatestGroupLeadsConfig();
    const employees = Array.isArray(config?.employees) ? config.employees : [];
    groupLeadEmployeesCache = employees.length ? employees : getGroupLeadEmployeesFromEnv();
  } catch {
    groupLeadEmployeesCache = getGroupLeadEmployeesFromEnv();
  }

  return groupLeadEmployeesCache.length ? groupLeadEmployeesCache : [getCallbackUserName(callback)];
}

async function buildGroupLeadEmployeeKeyboard(callback) {
  const employees = await getGroupLeadEmployees(callback);
  const rows = employees.map((name, index) => ([
    {
      text: name,
      callback_data: `${GROUP_LEAD_AGENT_CALLBACK_PREFIX}${index}`,
    },
  ]));

  return { inline_keyboard: rows };
}

function buildLeadApprovalKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "✅ Tasdiqlash", callback_data: GROUP_LEAD_CONFIRM_CALLBACK },
        { text: "❌ Bekor", callback_data: GROUP_LEAD_CANCEL_CALLBACK },
      ],
    ],
  };
}

async function getGroupLeadEmployeeByCallback(callback, data) {
  const index = Number(String(data).replace(GROUP_LEAD_AGENT_CALLBACK_PREFIX, ""));
  const employees = await getGroupLeadEmployees(callback);
  return employees[Number.isInteger(index) && index >= 0 ? index : 0] || getCallbackUserName(callback);
}

function extractApprovalLeadData(text) {
  const rawText = String(text ?? "");
  const siteLead = parseMarkerJson(text, SITE_LEAD_DATA_MARKER);
  if (siteLead && typeof siteLead === "object") {
    return {
      ...siteLead,
      source: "site-contact",
      username: normalizeTelegramUsername(siteLead.username),
      sender: clean(siteLead.sender, "Mijoz"),
      message: clean(siteLead.message, ""),
      matchedKeywords: [],
      link: "",
    };
  }

  const parsed = parseMarkerJson(text, GROUP_LEAD_DATA_MARKER);
  if (parsed && typeof parsed === "object") {
    return {
      ...parsed,
      source: "group-lead",
      username: normalizeTelegramUsername(parsed.username),
      sender: clean(parsed.sender, "Mijoz"),
      groupTitle: clean(parsed.groupTitle, "Telegram guruh"),
      message: clean(parsed.message, ""),
      matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
      link: clean(parsed.link, ""),
    };
  }

  const username = normalizeTelegramUsername(rawText.match(/@([a-zA-Z0-9_]{5,32})/)?.[1]);
  const messageText = extractLeadBlockValue(rawText, "Xabar") || extractLeadLineValue(rawText, "Xabar");

  if (rawText.includes("Guruhdan yangi lid") || rawText.includes("Kim yozdi:")) {
    return {
      source: "group-lead",
      username,
      sender: clean(extractLeadLineValue(rawText, "Kim yozdi"), "Mijoz"),
      groupTitle: clean(extractLeadLineValue(rawText, "Qaysi guruh"), "Telegram guruh"),
      message: messageText,
      matchedKeywords: parseListValue(extractLeadLineValue(rawText, "Kalit so'z")),
      link: clean(extractLeadLineValue(rawText, "Asl xabar"), ""),
    };
  }

  if (rawText.includes("Mijoz:") || rawText.includes("Telefon:")) {
    return {
      source: "site-contact",
      username,
      sender: clean(extractLeadLineValue(rawText, "Mijoz"), "Mijoz"),
      message: messageText,
      matchedKeywords: [],
      link: "",
    };
  }

  return null;
}

function extractLeadLineValue(text, label) {
  const line = String(text ?? "")
    .split("\n")
    .find((item) => item.includes(`${label}:`));
  if (!line) return "";
  return clean(line.slice(line.indexOf(`${label}:`) + label.length + 1), "");
}

function extractLeadBlockValue(text, label) {
  const lines = String(text ?? "").split("\n");
  const startIndex = lines.findIndex((item) => item.includes(`${label}:`));
  if (startIndex < 0) return "";

  const firstLine = lines[startIndex];
  const values = [firstLine.slice(firstLine.indexOf(`${label}:`) + label.length + 1)];
  const nextLabelPattern = /^\s*[^\w\s<]*\s*(Kim yozdi|Qaysi guruh|Kalit so'z|Tahlil balli|Vaqt|Asl xabar|Telegram|Mijoz|Telefon|Manba):/i;

  for (const line of lines.slice(startIndex + 1)) {
    if (nextLabelPattern.test(line)) break;
    values.push(line);
  }

  return clean(values.join("\n"), "");
}

function stripLeadDataMarkers(text) {
  return String(text ?? "")
    .split("\n")
    .filter((line) => !line.includes(SITE_LEAD_DATA_MARKER) && !line.includes(GROUP_LEAD_DATA_MARKER))
    .join("\n")
    .trim();
}

function replaceProfileStatus(text, nextStatus) {
  const lines = String(text ?? "").split("\n");
  const statusIndex = lines.findIndex((line) => line.includes("Profil xabari statusi:"));
  if (statusIndex >= 0) {
    lines[statusIndex] = `📨 Profil xabari statusi: ${nextStatus}`;
    return lines.join("\n");
  }

  return [String(text ?? "").trim(), "", `📨 Profil xabari statusi: ${nextStatus}`].filter(Boolean).join("\n");
}

function buildApprovedLeadEditedText(originalText, employeeName, result) {
  const cleaned = stripLeadDataMarkers(originalText);
  const status = result.sent
    ? `Mijozga xabar yuborildi: @${result.username}`
    : `Mijozga xabar yuborilmadi: ${result.error}`;
  const withoutOldStatus = replaceProfileStatus(cleaned, status);

  return [
    withoutOldStatus,
    "",
    `👤 Hodim: ${employeeName}`,
  ].join("\n");
}

function buildCanceledLeadEditedText(originalText, employeeName) {
  return stripLeadDataMarkers(originalText);
}

async function saveLeadFeedback(token, leadData, status, callback, extra = {}) {
  const chatId = getStorageChatId();
  if (!chatId) return;

  const feedback = {
    status,
    source: clean(leadData?.source, "group-lead"),
    groupId: clean(leadData?.groupId, ""),
    groupTitle: clean(leadData?.groupTitle, ""),
    messageId: leadData?.messageId || null,
    username: normalizeTelegramUsername(leadData?.username),
    sender: clean(leadData?.sender, ""),
    message: clean(leadData?.message, ""),
    matchedKeywords: Array.isArray(leadData?.matchedKeywords) ? leadData.matchedKeywords : [],
    link: clean(leadData?.link, ""),
    employee: clean(extra.employeeName, getCallbackUserName(callback)),
    actedBy: getCallbackUserName(callback),
    actedAt: new Date().toISOString(),
  };

  const text = buildMarkerText(
    GROUP_LEAD_FEEDBACK_MARKER,
    feedback,
    "<b>🧠 Guruh lid xotirasi yangilandi</b>"
  );

  await sendBotMessage(token, chatId, text, getStorageMessageOptions());
}

function titleCaseUz(value) {
  const text = clean(value, "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function detectLeadSubject(message, matchedKeywords = []) {
  const normalized = String(message ?? "").toLowerCase();
  const destinations = [
    "italiya",
    "turkiya",
    "dubay",
    "misr",
    "maldiv",
    "tailand",
    "umra",
    "samarqand",
    "buxoro",
    "farg'ona",
    "fargona",
    "toshkent",
    "xorazm",
    "xiva",
  ];
  const foundDestination = destinations.find((item) => normalized.includes(item));
  if (foundDestination) return `${titleCaseUz(foundDestination.replace("fargona", "farg'ona"))} turlari`;

  const keyword = matchedKeywords.map((item) => clean(item, "")).find(Boolean);
  return keyword ? `${keyword} bo'yicha` : "turizm xizmatlari bo'yicha";
}

function buildGroupLeadGreeting(leadData, employeeName) {
  const customerName = clean(leadData.sender, "mijoz")
    .replace(/\s*\(@[^)]+\)\s*$/, "")
    .split(/\s+/)[0];
  const subject = detectLeadSubject(leadData.message, leadData.matchedKeywords);

  return `Assalomu aleykum, ${customerName}. BayTrip turizm kompaniyasi operatori ${employeeName} bo'laman. "${subject}" bo'yicha murojaat qilgan ekansiz. Sizga batafsil ma'lumot berish uchun yozdim.`;
}

function buildSiteContactGreeting(leadData, employeeName) {
  const customerName = clean(leadData.sender, "mijoz").split(/\s+/)[0];
  return `Assalomu aleykum, ${customerName}. BayTrip turizm kompaniyasi operatori ${employeeName} bo'laman. Sayt orqali murojaatingiz bo'yicha yozyotgan edim. Sizga qanday yordam berolaman?`;
}

function buildApprovedLeadGreeting(leadData, employeeName) {
  if (leadData?.source === "site-contact") {
    return buildSiteContactGreeting(leadData, employeeName);
  }

  return buildGroupLeadGreeting(leadData, employeeName);
}

async function sendApprovedLeadGreetingToClient(leadData, employeeName) {
  if (!leadData?.username) {
    return { sent: false, error: "Mijoz username topilmadi." };
  }

  const message = buildApprovedLeadGreeting(leadData, employeeName);
  return withAdminClient(async (client) => {
    await client.sendMessage(`@${leadData.username}`, { message });
    return { sent: true, username: leadData.username, message };
  });
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
  const groups = mergeDefaultGroupLeadGroups(Array.isArray(config?.groups) ? config.groups : []);
  const keywords = Array.isArray(config?.keywords) ? config.keywords : [];
  const employees = Array.isArray(config?.employees) ? config.employees : [];
  return [
    `Guruhlar: ${groups.length}`,
    groups.slice(0, 5).map((group) => `- ${clean(group.title, group.id)}`).join("\n"),
    `Kalit so'zlar: ${keywords.slice(0, 12).join(", ") || "-"}`,
    `Hodimlar: ${employees.join(", ") || "-"}`,
  ].filter(Boolean).join("\n");
}

function summarizeGroupLeadsState(state) {
  const entries = Object.entries(state ?? {});
  return entries.length ? `Kuzatilayotgan guruh state: ${entries.length} ta guruh` : "State bo'sh";
}

function summarizeGroupLeadFeedback(feedback) {
  const status = feedback?.status === "approved" ? "Tasdiqlandi" : feedback?.status === "canceled" ? "Bekor qilindi" : clean(feedback?.status, "-");
  return [
    `Status: ${status}`,
    `Guruh: ${clean(feedback?.groupTitle || feedback?.groupId, "-")}`,
    `Hodim: ${clean(feedback?.employee || feedback?.actedBy, "-")}`,
    `Xabar: ${clean(feedback?.message, "-").slice(0, 140)}`,
  ].join("\n");
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
    {
      marker: GROUP_LEAD_FEEDBACK_MARKER,
      title: "Guruh lid xotirasi yangilandi",
      summary: summarizeGroupLeadFeedback,
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
  return withAdminClient(async (client) => {
    const actions = [];
    const limit = Number(process.env.TELEGRAM_ADMIN_ACTIONS_SCAN_LIMIT || 80);
    const topicIds = [
      ...getBayClubConfigTopicIds(),
      ...getGroupLeadsConfigTopicIds(),
    ];

    for (const target of getStorageReadTargets(topicIds)) {
      const entity = await client.getEntity(target.chatId);
      for (const topicId of target.topicIds) {
        const iterator = client.iterMessages(
          entity,
          buildMessageSearchOptions(Number.isFinite(limit) ? limit : 80, topicId)
        );

        for await (const message of iterator) {
          const action = parseActionMessage(message);
          if (action) actions.push({ ...action, topicId: topicId || "asosiy guruh" });
        }
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

function getTodayStartTashkent() {
  const now = new Date();
  const tashkentParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = tashkentParts.find((part) => part.type === "year")?.value;
  const month = tashkentParts.find((part) => part.type === "month")?.value;
  const day = tashkentParts.find((part) => part.type === "day")?.value;
  return new Date(`${year}-${month}-${day}T00:00:00+05:00`);
}

function incrementCount(map, key, amount = 1) {
  const normalized = clean(key, "");
  if (!normalized) return;
  map.set(normalized, (map.get(normalized) || 0) + amount);
}

function extractEmployeeFromLeadText(text) {
  return extractLeadLineValue(text, "Hodim");
}

function getLeadRequestText(text) {
  return extractLeadLineValue(text, "Xabar") || extractLeadLineValue(text, "Tur") || "";
}

function classifyRequestText(text) {
  const normalized = normalizeText(text);
  const categories = [
    { label: "Italiya turlari", terms: ["italiya", "italy"] },
    { label: "Turkiya turlari", terms: ["turkiya", "istanbul", "antalya"] },
    { label: "Dubai turlari", terms: ["dubay", "dubai"] },
    { label: "Umra", terms: ["umra", "haj"] },
    { label: "Avia chipta", terms: ["avia", "chipta", "bilet"] },
    { label: "Mehmonxona", terms: ["mehmonxona", "hotel", "otel"] },
    { label: "Ekskursiya", terms: ["ekskursiya", "gid", "sayohat"] },
    { label: "Ichki turizm", terms: ["samarqand", "buxoro", "xiva", "xorazm", "farg'ona", "fargona", "toshkent"] },
    { label: "Tur kerak", terms: ["tur kerak", "tur", "paket"] },
  ];

  const matched = categories.find((category) => category.terms.some((term) => normalized.includes(normalizeText(term))));
  if (matched) return matched.label;

  const compact = clean(text, "").slice(0, 60);
  return compact || "Aniqlanmagan";
}

function formatTopCounts(map, emptyText = "Ma'lumot yo'q") {
  const rows = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  return rows.length ? rows.map(([name, count], index) => `${index + 1}. ${escapeHtml(name)} — ${count}`).join("\n") : emptyText;
}

async function getLeadStats() {
  const topicIds = [
    undefined,
    getTopicId("contact"),
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID ? Number(process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID) : undefined,
  ]
    .filter((value, index, values) => value === undefined || (Number.isFinite(value) && values.indexOf(value) === index));

  return withAdminClient(async (client) => {
    const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
    const todayStart = getTodayStartTashkent();
    const scanLimit = Number(process.env.TELEGRAM_LEAD_STATS_SCAN_LIMIT || 300);
    const employeesToday = new Map();
    const requestTypes = new Map();
    let todayLeads = 0;
    let approvedToday = 0;
    let totalScanned = 0;

    for (const topicId of topicIds) {
      const iterator = client.iterMessages(
        entity,
        buildMessageSearchOptions(Number.isFinite(scanLimit) ? scanLimit : 300, topicId)
      );

      for await (const message of iterator) {
        const text = clean(message.message, "");
        if (!text) continue;
        totalScanned += 1;

        const messageDate = message.date instanceof Date ? message.date : new Date(message.date);
        const isToday = messageDate >= todayStart;
        const requestText = getLeadRequestText(text);
        if (requestText) incrementCount(requestTypes, classifyRequestText(requestText));

        if (!isToday) continue;
        todayLeads += 1;

        const employee = extractEmployeeFromLeadText(text);
        if (employee) {
          approvedToday += 1;
          incrementCount(employeesToday, employee);
        }
      }
    }

    return {
      topicCount: topicIds.length,
      totalScanned,
      todayLeads,
      approvedToday,
      employeesToday,
      requestTypes,
    };
  });
}

function buildLeadStatsMessage(stats) {
  return [
    "<b>📊 Murojaatlar statistikasi</b>",
    "",
    `Bugungi lidlar: <b>${stats.todayLeads}</b>`,
    `Bugun tasdiqlangan: <b>${stats.approvedToday}</b>`,
    `Tekshirilgan topiclar: <b>${stats.topicCount}</b>`,
    "",
    "<b>Hodimlar bo'yicha bugun:</b>",
    formatTopCounts(stats.employeesToday),
    "",
    "<b>Ko'p uchrayotgan murojaatlar:</b>",
    formatTopCounts(stats.requestTypes),
  ].join("\n");
}

async function sendLeadStats(token, chatId) {
  try {
    const stats = await getLeadStats();
    await sendBotMessage(token, chatId, buildLeadStatsMessage(stats), {
      reply_markup: buildAdminPanelKeyboard(),
    });
  } catch (error) {
    await sendBotMessage(
      token,
      chatId,
      `Statistikani o'qishda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`,
      { reply_markup: buildAdminPanelKeyboard() }
    );
  }
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

async function getBotProfile(token) {
  const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    throw new Error(data?.description || "Bot profili olinmadi.");
  }
  return data.result;
}

function getBotCleanupTopicIds() {
  return [
    getTopicId("external-tour"),
    getTopicId("domestic-tour"),
    getTopicId("bayclub-card"),
    getTopicId("promo-subscribe"),
    getTopicId("contact"),
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID ? Number(process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID) : undefined,
    getGroupLeadsConfigTopicId(),
    getBayClubConfigTopicId(),
  ]
    .filter((value) => Number.isFinite(value))
    .filter((value, index, values) => values.indexOf(value) === index);
}

function isPersistentBotMemoryMessage(text) {
  const raw = String(text ?? "");
  return [
    PRICE_CONFIG_MARKER,
    GROUP_LEADS_CONFIG_MARKER,
    GROUP_LEADS_STATE_MARKER,
    GROUP_LEAD_FEEDBACK_MARKER,
  ].some((marker) => raw.includes(marker));
}

function isMessageFromBot(message, botProfile) {
  const sender = message?.sender;
  const senderId = sender?.id?.value ?? sender?.id;
  const botId = botProfile?.id ? String(botProfile.id) : "";
  const senderUsername = normalizeTelegramUsername(sender?.username);
  const botUsername = normalizeTelegramUsername(botProfile?.username);
  return Boolean(
    (botId && String(senderId) === botId) ||
    (botUsername && senderUsername.toLowerCase() === botUsername.toLowerCase())
  );
}

async function cleanupBotMessages(token) {
  const botProfile = await getBotProfile(token);
  const topicIds = [undefined, ...getBotCleanupTopicIds()];
  const scanLimit = Number(process.env.TELEGRAM_BOT_CLEANUP_SCAN_LIMIT || 200);
  const limit = Number.isFinite(scanLimit) && scanLimit > 0 ? scanLimit : 200;

  return withAdminClient(async (client) => {
    const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
    const results = [];
    let totalChecked = 0;
    let totalDeleted = 0;
    let totalKeptMemory = 0;

    for (const topicId of topicIds) {
      const deleteIds = [];
      let checked = 0;
      let keptMemory = 0;
      const iterator = client.iterMessages(entity, buildMessageSearchOptions(limit, topicId));

      for await (const message of iterator) {
        checked += 1;
        totalChecked += 1;
        if (!isMessageFromBot(message, botProfile)) continue;

        if (isPersistentBotMemoryMessage(message.message)) {
          keptMemory += 1;
          totalKeptMemory += 1;
          continue;
        }

        if (message.id) deleteIds.push(message.id);
      }

      if (deleteIds.length) {
        await client.deleteMessages(entity, deleteIds, { revoke: true });
        totalDeleted += deleteIds.length;
      }

      results.push({ topicId: topicId || "asosiy guruh", checked, deleted: deleteIds.length, keptMemory });
    }

    return { topicCount: topicIds.length, checked: totalChecked, deleted: totalDeleted, keptMemory: totalKeptMemory, results };
  });
}

function buildCleanupResultMessage(result) {
  return [
    "<b>🧹 Xabarlarni tozalash yakunlandi</b>",
    "",
    `Topiclar: <b>${escapeHtml(result.topicCount ?? 0)}</b>`,
    `Tekshirilgan xabarlar: <b>${escapeHtml(result.checked ?? 0)}</b>`,
    `O'chirilgan bot xabarlari: <b>${escapeHtml(result.deleted ?? 0)}</b>`,
    `Saqlangan xotira/config xabarlari: <b>${escapeHtml(result.keptMemory ?? 0)}</b>`,
  ].join("\n");
}

async function runBotMessageCleanup(token, chatId) {
  await sendBotMessage(token, chatId, "🧹 Tozalash boshlandi. Bot yozgan yordamchi xabarlar tekshirilmoqda...");

  try {
    const result = await cleanupBotMessages(token);
    await sendBotMessage(token, chatId, buildCleanupResultMessage(result), {
      reply_markup: buildAdminPanelKeyboard(),
    });
  } catch (error) {
    await sendBotMessage(
      token,
      chatId,
      `Tozalashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`,
      { reply_markup: buildAdminPanelKeyboard() }
    );
  }
}

function getCronSecret() {
  return clean(process.env.CRON_SECRET || process.env.TELEGRAM_GROUP_LEADS_CRON_SECRET, "");
}

function getRequestBaseUrl(req) {
  const host = clean(req.headers["x-forwarded-host"] || req.headers.host, "");
  if (!host) return "";
  const proto = clean(req.headers["x-forwarded-proto"], "https").split(",")[0];
  return `${proto}://${host}`;
}

function isDebugRequestAuthorized(req) {
  const secret = getCronSecret() || getBroadcastPassword();
  if (!secret) return false;
  const header = clean(req.headers.authorization, "");
  const querySecret = clean(req.query?.secret, "");
  return header === `Bearer ${secret}` || querySecret === secret;
}

function buildLeadScannerResultMessage(result) {
  if (!result?.ok) {
    return `Lid skaner ishlamadi: ${escapeHtml(result?.error || "noma'lum xatolik")}`;
  }

  const errors = Array.isArray(result.errors) ? result.errors : [];
  return [
    "<b>🧭 Lid skaner yakunlandi</b>",
    "",
    `Guruhlar: <b>${escapeHtml(result.scanned ?? 0)}</b>`,
    `Tekshirilgan xabarlar: <b>${escapeHtml(result.checked ?? 0)}</b>`,
    `Topicga yuborilgan lidlar: <b>${escapeHtml(result.sent ?? 0)}</b>`,
    `Scan oynasi: <b>${escapeHtml(result.windowMinutes ?? 60)} daqiqa</b>`,
    `Har guruhdan limit: <b>${escapeHtml(result.messageLimit ?? DEFAULT_GROUP_LEAD_MESSAGE_LIMIT)} xabar</b>`,
    `Kalit so'zlar: <b>${escapeHtml(result.keywordCount ?? 100)}</b>`,
    `Xotira: <b>${escapeHtml(result.approvedMemory ?? 0)}</b> tasdiqlangan, <b>${escapeHtml(result.canceledMemory ?? 0)}</b> bekor qilingan`,
    errors.length ? "" : "",
    errors.length ? "<b>Xatolar:</b>" : "",
    ...errors.slice(0, 5).map((item) => `${escapeHtml(item.group)}: ${escapeHtml(item.error)}`),
  ].filter(Boolean).join("\n");
}

async function runLeadScannerNow(token, chatId, baseUrl) {
  if (!baseUrl) {
    await sendBotMessage(token, chatId, "Lid skaner URL topilmadi. Deploy domain yoki request host aniqlanmadi.", {
      reply_markup: buildAdminPanelKeyboard(),
    });
    return;
  }

  await sendBotMessage(
    token,
    chatId,
    [
      "<b>🧭 Lid skaner boshlandi</b>",
      "",
      "Har bir sozlangan guruhdan oxirgi 30 ta xabar tekshiriladi.",
      "Oxirgi 1 soat ichida kalit so'zga yoki tasdiqlangan namunalarga mos lid bo'lsa, belgilangan topicga yuboriladi.",
    ].join("\n")
  );

  try {
    const secret = getCronSecret();
    const response = await fetch(`${baseUrl}/api/group-leads-scan`, {
      method: "GET",
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
    });
    const result = await response.json().catch(() => ({
      ok: false,
      error: "Skaner javobi JSON formatida emas.",
    }));

    await sendBotMessage(token, chatId, buildLeadScannerResultMessage(result), {
      reply_markup: buildAdminPanelKeyboard(),
    });
  } catch (error) {
    await sendBotMessage(
      token,
      chatId,
      `Lid skaner xatoligi: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`,
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

function normalizeGroupIdInput(groupId) {
  const value = clean(groupId, "");
  if (/^100\d{6,}$/.test(value)) return `-${value}`;
  return value;
}

function mergeDefaultGroupLeadGroups(groups) {
  const uniqueGroups = new Map();
  for (const group of [...(Array.isArray(groups) ? groups : []), ...DEFAULT_GROUP_LEAD_GROUPS]) {
    const id = normalizeGroupIdInput(group?.id);
    if (!id) continue;
    uniqueGroups.set(id, {
      ...group,
      id,
      title: clean(group?.title, id),
    });
  }
  return [...uniqueGroups.values()];
}

function parseGroupLine(line) {
  const [rawId, rawTitle] = line.split("=").map((item) => item.trim());
  if (!rawId) return null;
  const id = normalizeGroupIdInput(rawId);
  return {
    id,
    title: rawTitle || id,
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

function normalizeGroupLeadsConfig(config) {
  const scanWindowMinutes = Number(config?.scanWindowMinutes);
  return {
    enabled: config?.enabled !== false,
    groups: mergeDefaultGroupLeadGroups(Array.isArray(config?.groups) ? config.groups.filter((group) => group?.id) : []),
    keywords: Array.isArray(config?.keywords) ? config.keywords.map((item) => clean(item, "").toLowerCase()).filter(Boolean) : [],
    employees: Array.isArray(config?.employees) ? config.employees.map((item) => clean(item, "")).filter(Boolean) : [],
    scanWindowMinutes: Number.isFinite(scanWindowMinutes) && scanWindowMinutes > 0
      ? scanWindowMinutes
      : DEFAULT_GROUP_LEAD_SCAN_WINDOW_MINUTES,
  };
}

function parseGroupListText(text) {
  const groups = [];
  for (const rawLine of String(text ?? "").split(/\n+/)) {
    const line = rawLine.trim();
    if (!line || /^(guruhlar|groups)\s*:?\s*$/i.test(line)) continue;
    const group = parseGroupLine(line.replace(/^[-*]\s*/, ""));
    if (group) groups.push(group);
  }

  const uniqueGroups = new Map();
  for (const group of groups) {
    uniqueGroups.set(group.id, group);
  }
  return [...uniqueGroups.values()];
}

function parseKeywordListText(text) {
  return [...new Set(parseListValue(text).map((item) => item.toLowerCase()).filter(Boolean))];
}

function parseEmployeeListText(text) {
  return [...new Set(parseListValue(text).map((item) => clean(item, "")).filter(Boolean))];
}

async function getLatestGroupLeadsConfig() {
  try {
    return await withAdminClient(async (client) => {
      const topicIds = getGroupLeadsConfigTopicIds();

      for (const target of getStorageReadTargets(topicIds)) {
        try {
          const entity = await client.getEntity(target.chatId);
          for (const topicId of target.topicIds) {
            const iterator = client.iterMessages(entity, buildMessageSearchOptions(150, topicId));

            for await (const message of iterator) {
              const parsed = parseMarkerJson(message.message, GROUP_LEADS_CONFIG_MARKER);
              if (parsed) return normalizeGroupLeadsConfig(parsed);
            }
          }
        } catch {
          // Storage group eski session uchun ko'rinmasa ham yangi sozlamani saqlash to'xtamasin.
        }
      }

      return normalizeGroupLeadsConfig(null);
    });
  } catch {
    return normalizeGroupLeadsConfig(null);
  }
}

async function saveGroupLeadsConfig(token, config) {
  const chatId = getStorageChatId();
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID kiritilmagan.");

  await sendBotMessage(
    token,
    chatId,
    buildMarkerText(GROUP_LEADS_CONFIG_MARKER, config),
    getStorageMessageOptions()
  );
}

async function sendGroupLeadsSavedMessage(token, chatId, config, title = "Guruh lid sozlamalari saqlandi") {
  const warnings = [];
  if (config.groups.length === 0) warnings.push("Guruhlar hali kiritilmagan.");
  if (config.keywords.length === 0) warnings.push("Kalit so'zlar hali kiritilmagan.");

  await sendBotMessage(
    token,
    chatId,
    [
      `<b>${escapeHtml(title)}</b>`,
      `Guruhlar: ${config.groups.length}`,
      `Default guruhlar: ${DEFAULT_GROUP_LEAD_GROUPS.length}`,
      `Qo'shimcha kalit so'zlar: ${config.keywords.length}`,
      `Default kalit so'zlar: ${DEFAULT_GROUP_LEAD_KEYWORD_COUNT} ta (${DEFAULT_GROUP_LEAD_RUSSIAN_KEYWORD_COUNT} ta ruscha)`,
      `Scan oynasi: ${config.scanWindowMinutes || DEFAULT_GROUP_LEAD_SCAN_WINDOW_MINUTES} daqiqa`,
      `Hodimlar: ${config.employees.length}`,
      warnings.length ? "" : "Cron endpoint /api/group-leads-scan shu config bo'yicha guruhlarni tekshiradi.",
      ...warnings.map((warning) => `⚠️ ${warning}`),
    ].filter(Boolean).join("\n"),
    { reply_markup: buildGroupLeadsKeyboard() }
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
    await sendGroupLeadsSavedMessage(token, chatId, config);
  } catch (error) {
    await sendBotMessage(token, chatId, `Sozlamani saqlashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
  }
}

async function runGroupLeadsGroupsUpdate(token, chatId, text) {
  const groups = parseGroupListText(text);
  if (groups.length === 0) {
    await sendBotMessage(
      token,
      chatId,
      [
        "Guruhlar formati noto'g'ri.",
        "",
        "Namuna:",
        "<code>@fargonaturizm=Farg'ona turizm</code>",
        "<code>-1001234567890=Samarqand sayohat</code>",
      ].join("\n"),
      { reply_markup: buildGroupLeadsKeyboard() }
    );
    return;
  }

  try {
    const previousConfig = await getLatestGroupLeadsConfig();
    const nextConfig = normalizeGroupLeadsConfig({ ...previousConfig, groups });
    await saveGroupLeadsConfig(token, nextConfig);
    await sendGroupLeadsSavedMessage(token, chatId, nextConfig, "Guruhlar saqlandi");
  } catch (error) {
    await sendBotMessage(token, chatId, `Guruhlarni saqlashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
  }
}

async function runGroupLeadsKeywordsUpdate(token, chatId, text) {
  const keywords = parseKeywordListText(text);
  if (keywords.length === 0) {
    await sendBotMessage(
      token,
      chatId,
      [
        "Kalit so'zlar formati noto'g'ri.",
        "",
        "Namuna:",
        "<code>tur kerak, ekskursiya, avia, mehmonxona, gid kerak, 5 kishi</code>",
      ].join("\n"),
      { reply_markup: buildGroupLeadsKeyboard() }
    );
    return;
  }

  try {
    const previousConfig = await getLatestGroupLeadsConfig();
    const nextConfig = normalizeGroupLeadsConfig({ ...previousConfig, keywords });
    await saveGroupLeadsConfig(token, nextConfig);
    await sendGroupLeadsSavedMessage(token, chatId, nextConfig, "Kalit so'zlar saqlandi");
  } catch (error) {
    await sendBotMessage(token, chatId, `Kalit so'zlarni saqlashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
  }
}

async function runGroupLeadsEmployeesUpdate(token, chatId, text) {
  const employees = parseEmployeeListText(text);
  if (employees.length === 0) {
    await sendBotMessage(
      token,
      chatId,
      [
        "Hodimlar formati noto'g'ri.",
        "",
        "Namuna:",
        "<code>Shoxruza, Sohibjon, Aziz</code>",
      ].join("\n"),
      { reply_markup: buildGroupLeadsKeyboard() }
    );
    return;
  }

  try {
    const previousConfig = await getLatestGroupLeadsConfig();
    const nextConfig = normalizeGroupLeadsConfig({ ...previousConfig, employees });
    await saveGroupLeadsConfig(token, nextConfig);
    groupLeadEmployeesCache = employees;
    await sendGroupLeadsSavedMessage(token, chatId, nextConfig, "Hodimlar saqlandi");
  } catch (error) {
    await sendBotMessage(token, chatId, `Hodimlarni saqlashda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`);
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

async function handleBotUpdate(body, token, context = {}) {
  if (body.callback_query) {
    const callback = body.callback_query;
    const chatId = callback.message?.chat?.id;
    const data = clean(callback.data, "");

    if (!chatId) return { ok: true, ignored: true };
    if (data !== "login_start" && !isAllowedAdmin(callback)) {
      await answerCallbackQuery(token, callback.id, "Bu amal uchun ruxsat yo'q.");
      await sendBotMessage(token, chatId, buildAdminDeniedText(callback));
      return { ok: true, ignored: true };
    }
    await answerCallbackQuery(token, callback.id);

    if (data === "login_start") {
      await sendLoginPrompt(token, chatId);
      return { ok: true };
    }

    if (data === GROUP_LEAD_CONFIRM_CALLBACK) {
      const leadData = extractApprovalLeadData(callback.message?.text);
      if (!leadData) {
        await sendBotMessage(token, chatId, "Lid ma'lumotlari topilmadi yoki eski formatdagi xabar.");
        return { ok: true };
      }

      await editMessageReplyMarkup(
        token,
        chatId,
        callback.message.message_id,
        await buildGroupLeadEmployeeKeyboard(callback)
      );
      return { ok: true };
    }

    if (data === GROUP_LEAD_CANCEL_CALLBACK) {
      const leadData = extractApprovalLeadData(callback.message?.text);
      const employeeName = getCallbackUserName(callback);
      if (leadData) {
        await saveLeadFeedback(token, leadData, "canceled", callback, { employeeName }).catch((error) => {
          console.error("group lead feedback save failed", {
            status: "canceled",
            error: error instanceof Error ? error.message : error,
          });
        });
      }

      const deleteResult = await deleteBotMessage(
        token,
        chatId,
        callback.message.message_id
      );
      if (!deleteResult?.ok) {
        await editMessageReplyMarkup(
          token,
          chatId,
          callback.message.message_id,
          { inline_keyboard: [] }
        );
      }
      return { ok: true };
    }

    if (data.startsWith(GROUP_LEAD_AGENT_CALLBACK_PREFIX)) {
      const leadData = extractApprovalLeadData(callback.message?.text);
      const employeeName = await getGroupLeadEmployeeByCallback(callback, data);
      if (!leadData) {
        await sendBotMessage(token, chatId, "Lid ma'lumotlari topilmadi yoki eski formatdagi xabar.");
        return { ok: true };
      }

      try {
        const result = await sendApprovedLeadGreetingToClient(leadData, employeeName);
        await saveLeadFeedback(token, leadData, "approved", callback, { employeeName }).catch((error) => {
          console.error("group lead feedback save failed", {
            status: "approved",
            error: error instanceof Error ? error.message : error,
          });
        });
        await editBotMessageText(
          token,
          chatId,
          callback.message.message_id,
          buildApprovedLeadEditedText(callback.message?.text, employeeName, result),
          { reply_markup: { inline_keyboard: [] } }
        );
      } catch (error) {
        await sendBotMessage(
          token,
          chatId,
          `Mijozga xabar yuborishda xatolik: ${escapeHtml(error instanceof Error ? error.message : "noma'lum xatolik")}`,
          callback.message?.message_thread_id ? { message_thread_id: callback.message.message_thread_id } : {}
        );
      }
      return { ok: true };
    }

    if (data === "promo_broadcast") {
      await sendPromoPrompt(token, chatId);
      return { ok: true };
    }

    if (data === "bayclub_prices") {
      await sendBayClubPricePrompt(token, chatId);
      return { ok: true };
    }

    if (data === "group_leads_config") {
      await sendGroupLeadsMenu(token, chatId);
      return { ok: true };
    }

    if (data === "recent_actions") {
      await sendRecentAdminActions(token, chatId);
      return { ok: true };
    }

    if (data === "logout") {
      await sendBotMessage(token, chatId, "Panel yopildi. Qayta kirish: <code>/login</code>", {
        reply_markup: buildRemoveKeyboard(),
      });
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
    pendingAdminLogins.set(String(chatId), {
      login,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    await deleteChatMessages(token, chatId, [
      message.message_id,
      message.reply_to_message?.message_id,
    ]);
    await sendBotMessage(
      token,
      chatId,
      [
        PASSWORD_REPLY_MARKER,
        "Login qabul qilindi.",
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
    const pendingLogin = pendingAdminLogins.get(String(chatId));
    pendingAdminLogins.delete(String(chatId));
    const login = pendingLogin?.expiresAt > Date.now() ? clean(pendingLogin.login, "") : "";
    const password = text.trim();
    await deleteChatMessages(token, chatId, [
      message.message_id,
      message.reply_to_message?.message_id,
    ]);
    if (!getBroadcastPassword()) {
      await sendBotMessage(token, chatId, "TELEGRAM_BROADCAST_PASSWORD Vercel env ichida kiritilmagan.");
    } else if (!login) {
      await sendBotMessage(token, chatId, "Login sessiyasi tugadi. Qayta kirish: <code>/login</code>");
    } else if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
    } else if (login === getAdminLogin() && password === getBroadcastPassword()) {
      await sendBotMessage(token, chatId, "Xush kelibsiz.");
      await sendAdminPanel(token, chatId);
    } else {
      await sendBotMessage(token, chatId, "Login yoki parol noto'g'ri. Qayta kirish: <code>/login</code>");
    }
    return { ok: true };
  }

  if (replyText.includes(PROMO_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runPromoBroadcast(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(PRICE_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runBayClubPriceUpdate(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(GROUP_LEADS_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runGroupLeadsConfigUpdate(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(GROUP_LEADS_GROUPS_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runGroupLeadsGroupsUpdate(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(GROUP_LEADS_KEYWORDS_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runGroupLeadsKeywordsUpdate(token, chatId, text);
    return { ok: true };
  }

  if (replyText.includes(GROUP_LEADS_EMPLOYEES_REPLY_MARKER) && !text.startsWith("/")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runGroupLeadsEmployeesUpdate(token, chatId, text);
    return { ok: true };
  }

  if ([
    BUTTON_PROMO,
    BUTTON_BAYCLUB_PRICES,
    BUTTON_GROUP_LEADS,
    BUTTON_LEAD_SCANNER,
    BUTTON_GROUPS,
    BUTTON_KEYWORDS,
    BUTTON_EMPLOYEES,
    BUTTON_STATS,
    BUTTON_RECENT_ACTIONS,
    BUTTON_CLEANUP,
    BUTTON_LOGOUT,
    BUTTON_BACK,
  ].includes(text)) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }

    if (text === BUTTON_PROMO) {
      await sendPromoPrompt(token, chatId);
    } else if (text === BUTTON_BAYCLUB_PRICES) {
      await sendBayClubPricePrompt(token, chatId);
    } else if (text === BUTTON_GROUP_LEADS) {
      await sendGroupLeadsMenu(token, chatId);
    } else if (text === BUTTON_LEAD_SCANNER) {
      await runLeadScannerNow(token, chatId, context.baseUrl);
    } else if (text === BUTTON_GROUPS) {
      await sendGroupLeadsGroupsPrompt(token, chatId);
    } else if (text === BUTTON_KEYWORDS) {
      await sendGroupLeadsKeywordsPrompt(token, chatId);
    } else if (text === BUTTON_EMPLOYEES) {
      await sendGroupLeadsEmployeesPrompt(token, chatId);
    } else if (text === BUTTON_STATS) {
      await sendLeadStats(token, chatId);
    } else if (text === BUTTON_RECENT_ACTIONS) {
      await sendRecentAdminActions(token, chatId);
    } else if (text === BUTTON_CLEANUP) {
      await deleteBotMessage(token, chatId, message.message_id);
      await runBotMessageCleanup(token, chatId);
    } else if (text === BUTTON_LOGOUT) {
      await sendBotMessage(token, chatId, "Panel yopildi. Qayta kirish: <code>/login</code>", {
        reply_markup: buildRemoveKeyboard(),
      });
    } else if (text === BUTTON_BACK) {
      await sendAdminPanel(token, chatId);
    }
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
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }

    const type = text.replace(/^\/testlead(@\w+)?\s*/i, "").trim() || "contact";
    await runTestLead(token, chatId, type);
    return { ok: true };
  }

  if (text.startsWith("/panel")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await sendAdminPanel(token, chatId);
    return { ok: true };
  }

  if (text.startsWith("/scan") || text.startsWith("/scanner")) {
    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
      return { ok: true };
    }
    await runLeadScannerNow(token, chatId, context.baseUrl);
    return { ok: true };
  }

  if (text.startsWith("/logout")) {
    await sendBotMessage(token, chatId, "Panel yopildi. Qayta kirish: <code>/login</code>", {
      reply_markup: buildRemoveKeyboard(),
    });
    return { ok: true };
  }

  if (text.startsWith("/promo") || text.startsWith("/aksiya")) {
    const bodyText = text.replace(/^\/(promo|aksiya)(@\w+)?\s*/i, "").trim();
    const [password, ...messageParts] = bodyText.split(/\s+/);
    const promoMessage = messageParts.join(" ").trim();

    if (!isAllowedAdmin(message)) {
      await sendBotMessage(token, chatId, buildAdminDeniedText(message));
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
    return `Assalomu aleykum, ${name}. BayTrip turizm kompaniyasi operatori bo'laman. Sayt orqali murojaatingiz bo'yicha yozyotgan edim. Sizga yordam berish uchun yozdim.`;
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

  if (clean(delivery.error, "").startsWith("Tasdiqlashdan keyin")) {
    return clean(delivery.error);
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

  if (body.type === "contact") {
    lines.splice(0, 2);
  }

  lines.push(
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
    const debugAllowed = isDebugRequestAuthorized(req);
    const publicHealth = {
      ok: true,
      service: "telegram",
      webhook: "/api/telegram",
      configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    };

    if (!debugAllowed) {
      return res.status(200).json(publicHealth);
    }

    const topicIds = {
      external: getTopicId("external-tour"),
      domestic: getTopicId("domestic-tour"),
      bayclub: getTopicId("bayclub-card"),
      promo: getTopicId("promo-subscribe"),
      contact: getTopicId("contact"),
      groupLeads: process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID ? Number(process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID) : undefined,
      groupLeadsConfig: getGroupLeadsConfigTopicId(),
    };
    return res.status(200).json({
      ...publicHealth,
      hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
      hasStorageChatId: Boolean(getStorageChatId()),
      topicStorageEnabled: isThreadStorageEnabled(),
      hasAdminSession: Boolean(getAdminProfileConfig()),
      groupLeadDefaults: {
        scanWindowMinutes: DEFAULT_GROUP_LEAD_SCAN_WINDOW_MINUTES,
        messageLimit: DEFAULT_GROUP_LEAD_MESSAGE_LIMIT,
        groupCount: DEFAULT_GROUP_LEAD_GROUPS.length,
        keywordCount: DEFAULT_GROUP_LEAD_KEYWORD_COUNT,
        russianKeywordCount: DEFAULT_GROUP_LEAD_RUSSIAN_KEYWORD_COUNT,
      },
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

  const isTelegramUpdate = Object.prototype.hasOwnProperty.call(body ?? {}, "update_id");

  if (isTelegramUpdate) {
    try {
      const result = await handleBotUpdate(body, token, {
        baseUrl: getRequestBaseUrl(req),
      });
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
    const profileDelivery = body.type === "contact"
      ? { enabled: true, sent: false, error: "Tasdiqlashdan keyin mijozga yuboriladi." }
      : await withTimeout(
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

    if (body.type === "contact") {
      payload.reply_markup = buildLeadApprovalKeyboard();
    }

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
