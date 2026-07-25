import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, planType, price } = body;

    if (!name || !email || !phone || !planType || price === undefined) {
      return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const months = parseInt(planType);
    if (![3, 6, 12].includes(months)) {
      return Response.json({ ok: false, error: "Invalid plan type" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    await db.insert(subscriptions).values({
      name,
      email,
      phone,
      planType,
      price,
      status: "active",
      expiresAt,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await db.select().from(subscriptions).orderBy(subscriptions.createdAt);
    return Response.json({ ok: true, data: result });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
