import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";

import "@/app/globals.css";
import { SiteProviders } from "@/components/site-providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ShePlays — Stay in the game",
  description:
    "Youth sports coaching and mentorship for girls. Verified coaches, safe chat, goals, and the Girls Mentorship Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${dmSans.variable} h-full scroll-smooth`}>
      <body className="relative min-h-screen antialiased">
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
