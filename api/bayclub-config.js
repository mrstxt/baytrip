import { Api } from "telegram";

const PRICE_CONFIG_MARKER = "BAYCLUB_PRICE_CONFIG";
const DEFAULT_STORAGE_CHAT_ID = "-5025743465";
const DEFAULT_STORAGE_CHAT_TITLE = "DATA \\ BAYTRIP";

function clean(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function getStorageChatId() {
  return clean(
    process.env.TELEGRAM_STORAGE_CHAT_ID ||
    DEFAULT_STORAGE_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID
  );
}

function uniqueValues(values) {
  return values.filter((value, index) => value && values.indexOf(value) === index);
}

function normalizeTitle(value) {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function getStorageChatIds() {
  return uniqueValues([getStorageChatId(), clean(process.env.TELEGRAM_CHAT_ID)]);
}

function getStorageChatTitles() {
  return uniqueValues([
    clean(process.env.TELEGRAM_STORAGE_CHAT_TITLE),
    DEFAULT_STORAGE_CHAT_TITLE,
  ].map(normalizeTitle));
}

function isStorageTitleMatch(title) {
  const normalized = normalizeTitle(title);
  if (!normalized) return false;
  const wantedTitles = getStorageChatTitles();
  return wantedTitles.includes(normalized) || (normalized.includes("data") && normalized.includes("baytrip"));
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

function buildMessageSearchOptions(limit, topicId) {
  return topicId ? { limit, replyTo: topicId } : { limit };
}

function getTelegramEntityInput(chatId) {
  const value = clean(chatId);
  if (/^-100\d{6,}$/.test(value)) {
    return new Api.PeerChannel({ channelId: BigInt(value.slice(4)) });
  }
  if (/^-\d+$/.test(value)) {
    return new Api.PeerChat({ chatId: BigInt(value.slice(1)) });
  }
  return /^-?\d+$/.test(value) ? Number(value) : value;
}

async function getReadableEntities(client, chatId) {
  const entities = [];

  try {
    entities.push(await client.getEntity(getTelegramEntityInput(chatId)));
  } catch {
    // Dialog title fallback quyida sinab ko'riladi.
  }

  try {
    const dialogs = await client.getDialogs({ limit: 500 });
    for (const dialog of dialogs) {
      const entity = dialog.entity;
      if (isStorageTitleMatch(entity?.title || dialog.title) && !entities.some((item) => String(item?.id) === String(entity?.id))) {
        entities.push(entity);
      }
    }
  } catch {
    // Dialog fallback ishlamasa, mavjud entitylar bilan davom etiladi.
  }

  return entities;
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

function parseConfigMessage(text) {
  const raw = String(text ?? "");
  if (!raw.includes(PRICE_CONFIG_MARKER)) return null;
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");

  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    try {
      return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    } catch {
      // Eski JSON format buzilgan bo'lsa, pastdagi yopiq format ham tekshiriladi.
    }
  }

  const markerIndex = raw.indexOf(PRICE_CONFIG_MARKER);
  const afterMarker = raw.slice(markerIndex + PRICE_CONFIG_MARKER.length);
  const encoded = afterMarker.match(/[A-Za-z0-9+/]{16,}={0,2}/)?.[0];
  if (!encoded) return null;

  try {
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function mergePriceConfigs(configs) {
  return configs.reduce((merged, config) => ({ ...merged, ...config }), {});
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Faqat GET so'rov qabul qilinadi." });
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const plans = await withAdminClient(async (client) => {
      const configs = [];
      const wantedPlans = new Set(["3 oy", "6 oy", "12 oy"]);
      const topicIds = getBayClubConfigTopicIds();

      for (const target of getStorageReadTargets(topicIds)) {
        try {
          const entities = await getReadableEntities(client, target.chatId);
          for (const entity of entities) {
            for (const topicId of target.topicIds) {
              const iterator = client.iterMessages(entity, buildMessageSearchOptions(300, topicId));

              for await (const message of iterator) {
                const parsed = parseConfigMessage(message.message);
                if (!parsed) continue;

                configs.unshift(parsed);
                const merged = mergePriceConfigs(configs);
                if ([...wantedPlans].every((plan) => merged[plan])) {
                  return merged;
                }
              }
            }
          }
        } catch {
          // Storage yoki eski topic session uchun ko'rinmasa, keyingi target sinab ko'riladi.
        }
      }

      return mergePriceConfigs(configs);
    });

    return res.status(200).json({ ok: true, plans });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      plans: {},
      error: error instanceof Error ? error.message : "BayClub config o'qilmadi.",
    });
  }
}
