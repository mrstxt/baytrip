export type LeadType = "external-tour" | "domestic-tour" | "contact";

export type TourLeadPayload = {
  type: "external-tour" | "domestic-tour";
  name: string;
  phone: string;
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
  message?: string;
  source: string;
};

export type LeadPayload = TourLeadPayload | ContactLeadPayload;

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
