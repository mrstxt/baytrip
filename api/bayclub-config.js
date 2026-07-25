const PRICE_CONFIG_MARKER = "BAYCLUB_PRICE_CONFIG";

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

function getBayClubConfigTopicId() {
  const raw = process.env.TELEGRAM_BAYCLUB_CONFIG_TOPIC_ID || process.env.TELEGRAM_BAYCLUB_TOPIC_ID;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  if (jsonStart < 0 || jsonEnd <= jsonStart) return null;
  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Faqat GET so'rov qabul qilinadi." });
  }

  try {
    const topicId = getBayClubConfigTopicId();
    if (!topicId) {
      return res.status(200).json({ ok: true, plans: {} });
    }

    const plans = await withAdminClient(async (client) => {
      const entity = await client.getEntity(clean(process.env.TELEGRAM_CHAT_ID));
      const iterator = client.iterMessages(entity, { limit: 100, replyTo: topicId });

      for await (const message of iterator) {
        const parsed = parseConfigMessage(message.message);
        if (parsed) return parsed;
      }

      return {};
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
