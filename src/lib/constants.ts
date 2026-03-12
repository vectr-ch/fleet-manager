/** Polling intervals for tRPC queries (milliseconds) */
export const REFETCH_INTERVAL = {
  REALTIME: 1000,
  FAST: 2000,
  MEDIUM: 3000,
  SLOW: 5000,
} as const;
