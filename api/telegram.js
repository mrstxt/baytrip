const LEAD_LABELS = {
  "external-tour": "Tashqi tur paketi",
  "domestic-tour": "Ichki tur paketi",
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

function validateLead(body) {
  if (!body || typeof body !== "object") return "So'rov formati noto'g'ri.";
  if (!Object.prototype.hasOwnProperty.call(LEAD_LABELS, body.type)) return "So'rov turi noto'g'ri.";
  if (clean(body.name, "").length < 3) return "Ism to'liq emas.";
  if (!/^\+?[\d\s()-]{9,}$/.test(clean(body.phone, ""))) return "Telefon raqam noto'g'ri.";

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
    contact: process.env.TELEGRAM_CONTACT_TOPIC_ID,
  };

  const raw = map[type];
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildMessage(body) {
  const label = LEAD_LABELS[body.type];
  const source = clean(body.source, "Sayt");
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
  ];

  if (body.type === "contact") {
    lines.push(`💬 <b>Xabar:</b> ${escapeHtml(clean(body.message, "Ko'rsatilmagan"))}`);
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

  lines.push("", `🔎 <b>Manba:</b> ${escapeHtml(source)}`, `🕒 <b>Vaqt:</b> ${escapeHtml(createdAt)}`);

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

  const payload = {
    chat_id: chatId,
    text: buildMessage(body),
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

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: "Telegram bilan aloqa uzildi." });
  }
}
