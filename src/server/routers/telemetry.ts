import { router } from "@/server/trpc";

// Telemetry data now flows through SSE (/api/telemetry/stream), not tRPC.
// This router is kept as a namespace placeholder for future telemetry-related
// queries (e.g. historical data retrieval from the data warehouse).
export const telemetryRouter = router({});
