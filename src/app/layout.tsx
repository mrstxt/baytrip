import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "bayTrip — Tur agentligi | Toshkent",
  description:
    "bayTrip — Toshkentdagi tur agentligi. Dubai, Istanbul, Bali, Maldiv va boshqa yo'nalishlarga to'liq tur dasturlari. Aviachipta, mehmonxona va gid — bir joyda.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-mist font-body text-ink antialiased">{children}</body>
    </html>
  );
}
