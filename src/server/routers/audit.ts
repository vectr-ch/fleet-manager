import { router, protectedProcedure } from "@/server/trpc";
import type { AuditEntry } from "@/lib/types";

export const auditRouter = router({
  list: protectedProcedure.query(async (): Promise<AuditEntry[]> => []),
});
