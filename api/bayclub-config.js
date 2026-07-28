const PRICE_CONFIG_MARKER = "BAYCLUB_PRICE_CONFIG";
const DEFAULT_STORAGE_CHAT_ID = "-5025743465";

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

function getStorageChatIds() {
  return uniqueValues([getStorageChatId(), clean(process.env.TELEGRAM_CHAT_ID)]);
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

  try {
    const plans = await withAdminClient(async (client) => {
      const configs = [];
      const wantedPlans = new Set(["3 oy", "6 oy", "12 oy"]);
      const topicIds = getBayClubConfigTopicIds();

      for (const target of getStorageReadTargets(topicIds)) {
        const entity = await client.getEntity(target.chatId);
        for (const topicId of target.topicIds) {
          const iterator = client.iterMessages(entity, buildMessageSearchOptions(150, topicId));

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
