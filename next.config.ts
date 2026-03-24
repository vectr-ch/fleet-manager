import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

if (!process.env.OVERLORD_URL) { throw new Error('OVERLORD_URL environment variable is required') }

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
};

export default withNextIntl(nextConfig);
