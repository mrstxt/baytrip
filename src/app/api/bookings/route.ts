import { db } from "@/db";
import { tourBookings, tourAnalytics } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tourId, tourName, clientName, clientPhone, people, totalPrice, bookingDate } = body;

    if (!tourId || !clientName || !clientPhone || !people || !totalPrice) {
      return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    await db.insert(tourBookings).values({
      tourId,
      tourName,
      clientName,
      clientPhone,
      people,
      totalPrice,
      bookingDate,
      status: "pending",
    });

    // Update analytics
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const existing = await db
      .select()
      .from(tourAnalytics)
      .where(
        and(
          eq(tourAnalytics.tourId, tourId),
          eq(tourAnalytics.month, month),
          eq(tourAnalytics.year, year)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(tourAnalytics)
        .set({
          bookingsCount: sql`${tourAnalytics.bookingsCount} + ${people}`,
          revenue: sql`${tourAnalytics.revenue} + ${totalPrice}`,
        })
        .where(eq(tourAnalytics.id, existing[0].id));
    } else {
      await db.insert(tourAnalytics).values({
        tourId,
        tourName,
        month,
        year,
        bookingsCount: people,
        revenue: totalPrice,
        viewsCount: 0,
        rating: 4.5,
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Booking error:", error);
    return Response.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
