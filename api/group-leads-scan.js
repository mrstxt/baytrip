const GROUP_LEADS_CONFIG_MARKER = "GROUP_LEADS_CONFIG";
const GROUP_LEADS_STATE_MARKER = "GROUP_LEADS_STATE";
const DEFAULT_GROUP_LEAD_KEYWORDS = [
  "tur kerak",
  "tur bormi",
  "tur narxi",
  "tur paket",
  "sayohat kerak",
  "sayohat bormi",
  "dam olish",
  "putyovka",
  "yo'llanma",
  "avia",
  "avia chipta",
  "aviabilet",
  "bilet kerak",
  "chipta kerak",
  "samolyot bileti",
  "mehmonxona",
  "hotel",
  "otel",
  "joy kerak",
  "nomer kerak",
  "transfer kerak",
  "gid kerak",
  "ekskursiya",
  "viza kerak",
  "visa kerak",
  "sug'urta",
  "straxovka",
  "umra",
  "haj",
  "dubay",
  "dubai",
  "turkiya",
  "istanbul",
  "antalya",
  "misr",
  "sharm",
  "xurgada",
  "maldiv",
  "tailand",
  "yevropa",
  "italiya",
  "fransiya",
  "ispaniya",
  "germaniya",
  "chexiya",
  "praga",
  "rossiya",
  "moskva",
  "sankt peterburg",
  "gruziya",
  "tbilisi",
  "ozarbayjon",
  "baku",
  "qozog'iston",
  "almaty",
  "samarqand",
  "buxoro",
  "xiva",
  "xorazm",
  "toshkent",
  "farg'ona",
  "andijon",
  "namangan",
  "zomin",
  "chorvoq",
  "amirsoy",
  "necha pul",
  "qancha turadi",
  "narxi qancha",
  "chegirma",
  "нужен тур",
  "тур нужен",
  "есть тур",
  "цена тура",
  "тур пакет",
  "путевка",
  "горящий тур",
  "отдых",
  "отпуск",
  "авиа",
  "авиабилет",
  "билет нужен",
  "самолет билет",
  "отель",
  "гостиница",
  "номер нужен",
  "трансфер",
  "нужен гид",
  "экскурсия",
  "виза",
  "страховка",
  "сколько стоит",
  "какая цена",
  "цена",
  "скидка",
  "акция",
  "дешево",
  "семейный",
  "с детьми",
  "на двоих",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function clean(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function getAdminProfileConfig() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = clean(process.env.TELEGRAM_API_HASH);
  const session = clean(process.env.TELEGRAM_ADMIN_SESSION);

  if (!Number.isFinite(apiId) || !apiHash || !session) {
    return null;
  }

  return { apiId, apiHash, session };
}

function getTopicNumber(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function getConfigTopicId() {
  return getTopicNumber(
    process.env.TELEGRAM_GROUP_LEADS_CONFIG_TOPIC_ID,
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID,
    process.env.TELEGRAM_CONTACT_TOPIC_ID
  );
}

function getLeadTopicId() {
  return getTopicNumber(
    process.env.TELEGRAM_GROUP_LEADS_TOPIC_ID,
    process.env.TELEGRAM_CONTACT_TOPIC_ID
  );
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
    throw new Error(data?.description || "Telegramga xabar yuborilmadi.");
  }
  return data;
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

async function readLatestMarker(client, marker) {
  const topicId = getConfigTopicId();
  if (!topicId) return null;

  const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
  const iterator = client.iterMessages(entity, {
    limit: Number(process.env.TELEGRAM_GROUP_LEADS_CONFIG_SCAN_LIMIT || 150),
    replyTo: topicId,
  });

  for await (const message of iterator) {
    const parsed = parseMarkerJson(message.message, marker);
    if (parsed) return parsed;
  }

  return null;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/ʻ|ʼ|`/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function findMatchedKeywords(message, keywords) {
  const normalized = normalizeText(message);
  return keywords.filter((keyword) => normalized.includes(normalizeText(keyword)));
}

function getLeadKeywords(config) {
  return [
    ...new Set(
      [
        ...(Array.isArray(config?.keywords) ? config.keywords : []),
        ...DEFAULT_GROUP_LEAD_KEYWORDS,
      ]
        .map((keyword) => clean(keyword).toLowerCase())
        .filter(Boolean)
    ),
  ];
}

function getScanWindowMinutes(config) {
  const parsed = Number(
    process.env.TELEGRAM_GROUP_LEADS_SCAN_WINDOW_MINUTES ||
    config?.scanWindowMinutes ||
    60
  );
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

function getScanMessageLimit() {
  const parsed = Number(process.env.TELEGRAM_GROUP_LEADS_SCAN_LIMIT || 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
}

function getMessageDate(message) {
  return message?.date instanceof Date ? message.date : new Date(message?.date);
}

function isWithinScanWindow(message, cutoffDate) {
  if (!cutoffDate) return true;
  const messageDate = getMessageDate(message);
  return Number.isFinite(messageDate.getTime()) && messageDate >= cutoffDate;
}

function getSenderLabel(message) {
  const sender = message.sender;
  if (!sender) return "Noma'lum";

  const first = clean(sender.firstName);
  const last = clean(sender.lastName);
  const title = clean(sender.title);
  const username = clean(sender.username);
  const name = clean([first, last].filter(Boolean).join(" "), title || "Noma'lum");

  return username ? `${name} (@${username})` : name;
}

function getMessageLink(groupId, messageId) {
  const value = String(groupId ?? "");
  if (value.startsWith("@")) return `https://t.me/${value.slice(1)}/${messageId}`;
  const channelId = value.startsWith("-100") ? value.slice(4) : "";
  return channelId ? `https://t.me/c/${channelId}/${messageId}` : "";
}

function getEntityInput(groupId) {
  const value = clean(groupId);
  return /^-?\d+$/.test(value) ? Number(value) : value;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date instanceof Date ? date : new Date());
}

function buildLeadText({ group, message, matchedKeywords }) {
  const link = getMessageLink(group.id, message.id);
  const sender = getSenderLabel(message);
  const lines = [
    "<b>🔎 Guruhdan yangi lid</b>",
    "",
    `💬 <b>Xabar:</b> ${escapeHtml(clean(message.message))}`,
    "",
    `👤 <b>Kim yozdi:</b> ${escapeHtml(sender)}`,
    `👥 <b>Qaysi guruh:</b> ${escapeHtml(clean(group.title, group.id))}`,
    `🏷 <b>Kalit so'z:</b> ${escapeHtml(matchedKeywords.join(", "))}`,
    `🕒 <b>Vaqt:</b> ${escapeHtml(formatDate(message.date))}`,
  ];

  if (link) {
    lines.push(`🔗 <b>Asl xabar:</b> ${escapeHtml(link)}`);
  }

  return lines.join("\n");
}

function buildLeadApprovalKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "✅ Tasdiqlash", callback_data: "gl_confirm" }],
    ],
  };
}

async function saveState(token, state) {
  const chatId = clean(process.env.TELEGRAM_CHAT_ID);
  const topicId = getConfigTopicId();
  const text = [
    `<b>${GROUP_LEADS_STATE_MARKER}</b>`,
    "",
    `<code>${escapeHtml(JSON.stringify(state))}</code>`,
  ].join("\n");

  await sendBotMessage(token, chatId, text, topicId ? { message_thread_id: topicId } : {});
}

function isAuthorized(req) {
  const secret = clean(process.env.CRON_SECRET || process.env.TELEGRAM_GROUP_LEADS_CRON_SECRET);
  if (!secret) return true;

  const header = clean(req.headers.authorization);
  const querySecret = clean(req.query?.secret);
  return header === `Bearer ${secret}` || querySecret === secret;
}

async function scanGroup(client, group, config, state) {
  const entity = await client.getEntity(getEntityInput(group.id));
  const lastId = Number(state[group.id] || 0);
  const limit = getScanMessageLimit();
  const shouldScanHistory = process.env.TELEGRAM_GROUP_LEADS_SCAN_HISTORY === "true";
  const windowMinutes = getScanWindowMinutes(config);
  const cutoffDate = shouldScanHistory ? null : new Date(Date.now() - windowMinutes * 60 * 1000);
  const found = [];
  let newestId = lastId;
  let checked = 0;
  let skippedOld = 0;

  const iterator = client.iterMessages(entity, {
    limit,
    minId: Number.isFinite(lastId) ? lastId : 0,
  });

  const messages = [];
  for await (const message of iterator) {
    messages.push(message);
  }

  for (const message of messages.reverse()) {
    if (!message?.id) continue;
    newestId = Math.max(newestId, message.id);
    checked += 1;

    if (!isWithinScanWindow(message, cutoffDate)) {
      skippedOld += 1;
      continue;
    }

    const text = clean(message.message);
    if (!text) continue;

    const matchedKeywords = findMatchedKeywords(text, getLeadKeywords(config));
    if (matchedKeywords.length === 0) continue;

    found.push({ group, message, matchedKeywords });
  }

  return { found, newestId, checked, skippedOld };
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Faqat GET yoki POST so'rov qabul qilinadi." });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: "Cron secret noto'g'ri." });
  }

  const token = clean(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = clean(process.env.TELEGRAM_CHAT_ID);
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: "Telegram bot sozlamalari kiritilmagan." });
  }

  try {
    const result = await withAdminClient(async (client) => {
      const config = await readLatestMarker(client, GROUP_LEADS_CONFIG_MARKER);
      if (!config?.enabled || !Array.isArray(config.groups)) {
        return { scanned: 0, sent: 0, skipped: "config_missing" };
      }

      const state = (await readLatestMarker(client, GROUP_LEADS_STATE_MARKER)) || {};
      const nextState = { ...state };
      const leadTopicId = getLeadTopicId();
      let sent = 0;
      let checked = 0;
      let skippedOld = 0;
      const errors = [];

      for (const group of config.groups) {
        try {
          const scan = await scanGroup(client, group, config, state);
          nextState[group.id] = scan.newestId;
          checked += scan.checked || 0;
          skippedOld += scan.skippedOld || 0;

          for (const lead of scan.found) {
            await sendBotMessage(
              token,
              chatId,
              buildLeadText(lead),
              {
                ...(leadTopicId ? { message_thread_id: leadTopicId } : {}),
                reply_markup: buildLeadApprovalKeyboard(),
              }
            );
            sent += 1;
          }
        } catch (error) {
          errors.push({
            group: group.id,
            error: error instanceof Error ? error.message : "noma'lum xatolik",
          });
        }
      }

      await saveState(token, nextState);
      return {
        scanned: config.groups.length,
        checked,
        skippedOld,
        sent,
        windowMinutes: getScanWindowMinutes(config),
        messageLimit: getScanMessageLimit(),
        keywordCount: getLeadKeywords(config).length,
        errors,
      };
    });

    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "Guruh lid scan ishlamadi.",
    });
  }
}
