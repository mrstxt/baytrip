import { db } from "@/db";
import { tourAnalytics } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(tourAnalytics)
      .orderBy(desc(tourAnalytics.year), desc(tourAnalytics.month))
      .limit(100);

    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
