import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-runtime",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mono-runtime",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500"],
  variable: "--lp-font-body-runtime",
});

export const metadata: Metadata = {
  title: "VECTR",
  description: "Autonomous fleet infrastructure",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`dark ${dmSans.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <TRPCProvider>
            {children}
          </TRPCProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
