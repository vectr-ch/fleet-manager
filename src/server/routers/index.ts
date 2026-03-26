import { router } from "@/server/trpc";
import { authRouter } from "./auth";
import { orgRouter } from "./org";
import { usersRouter } from "./users";
import { basesRouter } from "./bases";
import { nodesRouter } from "./nodes";
import { invitesRouter } from "./invites";
import { userAccountRouter } from "./user-account";
import { missionsRouter } from "./missions";
import { alertsRouter } from "./alerts";
import { telemetryRouter } from "./telemetry";
import { auditRouter } from "./audit";
import { overviewRouter } from "./overview";
import { sysadminAuthRouter } from "./sysadmin-auth";
import { sysadminOrgsRouter } from "./sysadmin-orgs";
import { sysadminAdminsRouter } from "./sysadmin-admins";
import { initRouter } from "./init";

export const appRouter = router({
  init: initRouter,
  auth: authRouter,
  org: orgRouter,
  users: usersRouter,
  bases: basesRouter,
  nodes: nodesRouter,
  invites: invitesRouter,
  userAccount: userAccountRouter,
  missions: missionsRouter,
  alerts: alertsRouter,
  telemetry: telemetryRouter,
  audit: auditRouter,
  overview: overviewRouter,
  sysadminAuth: sysadminAuthRouter,
  sysadminOrgs: sysadminOrgsRouter,
  sysadminAdmins: sysadminAdminsRouter,
});

export type AppRouter = typeof appRouter;
