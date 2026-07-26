export type LeadType = "external-tour" | "domestic-tour" | "contact" | "bayclub-card" | "promo-subscribe";

export type TourLeadPayload = {
  type: "external-tour" | "domestic-tour";
  name: string;
  phone: string;
  telegramUsername?: string;
  tourTitle: string;
  tourCity: string;
  tourCountry: string;
  date: string;
  people: number;
  price: string;
  total: string;
  source: string;
};

export type ContactLeadPayload = {
  type: "contact";
  name: string;
  phone: string;
  telegramUsername?: string;
  message?: string;
  source: string;
};

export type BayClubLeadPayload = {
  type: "bayclub-card";
  name: string;
  phone: string;
  telegramUsername: string;
  cardType: string;
  plan: string;
  price: string;
  source: string;
};

export type PromoSubscribeLeadPayload = {
  type: "promo-subscribe";
  telegramUsername: string;
  source: string;
};

export type LeadPayload = TourLeadPayload | ContactLeadPayload | BayClubLeadPayload | PromoSubscribeLeadPayload;

export async function sendLead(payload: LeadPayload) {
  const response = await fetch("/api/telegram", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? "Arizani yuborib bo'lmadi.");
  }

  return data;
}
