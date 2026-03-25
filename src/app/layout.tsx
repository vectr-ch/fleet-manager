import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { TRPCProvider } from "@/lib/trpc/provider";
import "./globals.css";

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
    <html lang={locale} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&family=DM+Sans:wght@300;400;500;600&family=Inter:wght@100;200;300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
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
