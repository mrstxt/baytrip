import { Api, TelegramClient } from "telegram";
import { NewMessage } from "telegram/events/index.js";
import { StringSession } from "telegram/sessions/index.js";

const LIVE_CHAT_CONFIG_MARKER = "LIVE_CHAT_CONFIG";
const LIVE_CHAT_MEMORY_MARKER = "LIVE_CHAT_MEMORY";
const DEFAULT_STORAGE_CHAT_ID = "-5025743465";
const DEFAULT_STORAGE_CHAT_TITLE = "DATA \\ BAYTRIP";

const configCache = {
  value: null,
  loadedAt: 0,
};

const memoryCache = {
  value: null,
  loadedAt: 0,
};

let savingMemory = Promise.resolve();

function clean(value, fallback = "") {
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

function encodeMarkerPayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

function buildMarkerText(marker, payload) {
  return [
    marker,
    "",
    encodeMarkerPayload(payload),
  ].join("\n");
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
      // Eski JSON format buzilgan bo'lsa, pastdagi base64 format sinab ko'riladi.
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

function normalizeTitle(value) {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function getStorageChatId() {
  return clean(
    process.env.TELEGRAM_STORAGE_CHAT_ID ||
    DEFAULT_STORAGE_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID
  );
}

function getStorageChatTitles() {
  return [
    clean(process.env.TELEGRAM_STORAGE_CHAT_TITLE),
    DEFAULT_STORAGE_CHAT_TITLE,
  ].map(normalizeTitle).filter(Boolean);
}

function isStorageTitleMatch(title) {
  const normalized = normalizeTitle(title);
  if (!normalized) return false;
  const wantedTitles = getStorageChatTitles();
  return wantedTitles.includes(normalized) || (normalized.includes("data") && normalized.includes("baytrip"));
}

function getEntityInput(chatId) {
  const value = clean(chatId);
  if (/^-100\d{6,}$/.test(value)) {
    return new Api.PeerChannel({ channelId: Number(value.slice(4)) });
  }
  if (/^100\d{6,}$/.test(value)) {
    return new Api.PeerChannel({ channelId: Number(value.slice(3)) });
  }
  if (/^-\d+$/.test(value)) {
    const id = Number(value.slice(1));
    if (id > 2147483647) return new Api.PeerChannel({ channelId: id });
    return new Api.PeerChat({ chatId: id });
  }
  return /^-?\d+$/.test(value) ? Number(value) : value;
}

async function getStorageEntity(client) {
  const chatId = getStorageChatId();

  if (chatId) {
    try {
      return await client.getEntity(getEntityInput(chatId));
    } catch {
      // Dialog title fallback quyida sinab ko'riladi.
    }
  }

  const dialogs = await client.getDialogs({ limit: 500 });
  for (const dialog of dialogs) {
    const entity = dialog.entity;
    if (isStorageTitleMatch(entity?.title || dialog.title)) {
      return entity;
    }
  }

  throw new Error("DATA \\ BAYTRIP storage guruhi topilmadi. Admin session shu guruhga a'zo bo'lishi kerak.");
}

async function readLatestMarker(client, marker, limit = 80) {
  const entity = await getStorageEntity(client);
  const iterator = client.iterMessages(entity, { limit });

  for await (const message of iterator) {
    const parsed = parseMarkerJson(message.message, marker);
    if (parsed) return parsed;
  }

  return null;
}

function normalizeLiveChatConfig(config) {
  return {
    enabled: config?.enabled === true,
    enabledAt: clean(config?.enabledAt),
    disabledAt: clean(config?.disabledAt),
    updatedAt: clean(config?.updatedAt),
  };
}

async function getLiveChatConfig(client, { force = false } = {}) {
  const ttlMs = Number(process.env.TELEGRAM_LIVE_CHAT_CONFIG_CACHE_MS || 5000);
  if (!force && configCache.value && Date.now() - configCache.loadedAt < ttlMs) {
    return configCache.value;
  }

  configCache.value = normalizeLiveChatConfig(await readLatestMarker(client, LIVE_CHAT_CONFIG_MARKER));
  configCache.loadedAt = Date.now();
  return configCache.value;
}

async function getLiveChatMemory(client, { force = false } = {}) {
  const ttlMs = Number(process.env.TELEGRAM_LIVE_CHAT_MEMORY_CACHE_MS || 15000);
  if (!force && memoryCache.value && Date.now() - memoryCache.loadedAt < ttlMs) {
    return memoryCache.value;
  }

  memoryCache.value = (await readLatestMarker(client, LIVE_CHAT_MEMORY_MARKER)) || {};
  memoryCache.loadedAt = Date.now();
  return memoryCache.value;
}

async function saveLiveChatMemory(client, memory) {
  memoryCache.value = {
    ...memory,
    updatedAt: new Date().toISOString(),
  };
  memoryCache.loadedAt = Date.now();

  savingMemory = savingMemory.then(async () => {
    const entity = await getStorageEntity(client);
    await client.sendMessage(entity, {
      message: buildMarkerText(LIVE_CHAT_MEMORY_MARKER, memoryCache.value),
    });
  });

  await savingMemory;
}

function getSenderKey(sender) {
  return String(sender?.id?.value ?? sender?.id ?? sender?.username ?? "");
}

function buildLiveChatAutoReply(text) {
  const normalized = normalizeText(text);
  const matchedTour = [
    ["dubai", "Dubai"],
    ["dubay", "Dubai"],
    ["turkiya", "Turkiya"],
    ["istanbul", "Turkiya"],
    ["antalya", "Turkiya"],
    ["umra", "Umra"],
    ["haj", "Umra"],
    ["avia", "avia chipta"],
    ["bilet", "avia chipta"],
    ["mehmonxona", "mehmonxona"],
    ["hotel", "mehmonxona"],
    ["samarqand", "ichki tur"],
    ["buxoro", "ichki tur"],
    ["xiva", "ichki tur"],
  ].find(([term]) => normalized.includes(term))?.[1];

  return [
    "Assalomu alaykum! Xabaringizni oldik.",
    matchedTour
      ? `${matchedTour} bo'yicha mos variantlarni tekshirib, sizga tez orada aniq narx va sanalarni yuboramiz.`
      : "Sayohat bo'yicha so'rovingizni ko'rib chiqyapmiz, sizga tez orada javob beramiz.",
    "",
    "Qulay bo'lsa, nechta kishi, qaysi sana va taxminiy byudjetni yozib qoldiring.",
  ].join("\n");
}

function shouldIgnoreSender(sender) {
  return Boolean(sender?.bot || sender?.self);
}

async function handleIncomingMessage(client, event) {
  const message = event.message;
  if (!message || message.out || !event.isPrivate) return;

  const text = clean(message.message);
  if (!text) return;

  const sender = await message.getSender();
  if (!sender || shouldIgnoreSender(sender)) return;

  const config = await getLiveChatConfig(client);
  if (!config.enabled) return;

  const memory = await getLiveChatMemory(client);
  const answeredMessages = { ...(memory.answeredMessages || {}) };
  const senderKey = getSenderKey(sender);
  const messageId = Number(message.id);

  if (!senderKey || Number(answeredMessages[senderKey]) === messageId) {
    return;
  }

  await client.sendMessage(sender, {
    message: buildLiveChatAutoReply(text),
  });

  answeredMessages[senderKey] = messageId;
  await saveLiveChatMemory(client, {
    ...memory,
    enabled: true,
    realtime: {
      lastReplyAt: new Date().toISOString(),
      lastSender: senderKey,
      lastMessageId: messageId,
    },
    answeredMessages,
  });

  console.log("live-chat replied", {
    sender: senderKey,
    messageId,
  });
}

function getAdminProfileConfig() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = clean(process.env.TELEGRAM_API_HASH);
  const session = clean(process.env.TELEGRAM_ADMIN_SESSION);

  if (!Number.isFinite(apiId) || !apiHash || !session) {
    throw new Error("TELEGRAM_API_ID, TELEGRAM_API_HASH va TELEGRAM_ADMIN_SESSION kiritilishi kerak.");
  }

  return { apiId, apiHash, session };
}

async function main() {
  const config = getAdminProfileConfig();
  const client = new TelegramClient(new StringSession(config.session), config.apiId, config.apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  await getStorageEntity(client);
  const liveConfig = await getLiveChatConfig(client, { force: true });

  console.log("BayTrip live chat worker started", {
    enabled: liveConfig.enabled,
    storageChatId: getStorageChatId(),
  });

  client.addEventHandler((event) => {
    handleIncomingMessage(client, event).catch((error) => {
      console.error("live-chat handler failed", error instanceof Error ? error.message : error);
    });
  }, new NewMessage({ incoming: true }));

  await new Promise(() => {});
}

main().catch((error) => {
  console.error("BayTrip live chat worker failed", error instanceof Error ? error.message : error);
  process.exit(1);
});
