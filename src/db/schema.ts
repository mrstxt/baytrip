import { pgTable, serial, text, integer, timestamp, real, varchar, date } from "drizzle-orm/pg-core";

// 📋 Subscription plans — 3, 6, 12 oylik obuna modellari
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  planType: varchar("plan_type", { length: 10 }).notNull(), // "3", "6", "12"
  price: real("price").notNull(),
  status: text("status").notNull().default("active"), // active, expired, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// 📊 Tur analitikasi — oylik ko'rsatkichlar
export const tourAnalytics = pgTable("tour_analytics", {
  id: serial("id").primaryKey(),
  tourId: text("tour_id").notNull(),
  tourName: text("tour_name").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  bookingsCount: integer("bookings_count").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
  viewsCount: integer("views_count").notNull().default(0),
  rating: real("rating").notNull().default(0),
});

// 📦 Tur buyurtmalari (bron)
export const tourBookings = pgTable("tour_bookings", {
  id: serial("id").primaryKey(),
  tourId: text("tour_id").notNull(),
  tourName: text("tour_name").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  people: integer("people").notNull().default(1),
  totalPrice: real("total_price").notNull(),
  bookingDate: text("booking_date").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
