import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";
import { fmsFetch } from "@/lib/fms";
import { validateSysadminPassword } from "@/lib/password";
import type {
  SysadminResetVerifyResponse,
  SysadminTokenRedeemResponse,
} from "@/lib/types";

const sysadminPasswordSchema = z.string().superRefine((password, ctx) => {
  const error = validateSysadminPassword(password);
  if (error) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
  }
});

export const sysadminResetPasswordRouter = router({
  verify: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().min(6) }))
    .mutation(async ({ input }) => {
      return fmsFetch<SysadminResetVerifyResponse>(
        "/sysadmin/reset-password/verify",
        {
          method: "POST",
          body: { email: input.email, code: input.code },
        }
      );
    }),

  confirm: publicProcedure
    .input(z.object({ token: z.string().min(1), password: sysadminPasswordSchema }))
    .mutation(async ({ input }) => {
      return fmsFetch<SysadminTokenRedeemResponse>(
        "/sysadmin/reset-password/confirm",
        {
          method: "POST",
          body: { token: input.token, password: input.password },
        }
      );
    }),

  acceptInvite: publicProcedure
    .input(z.object({ token: z.string().min(1), password: sysadminPasswordSchema }))
    .mutation(async ({ input }) => {
      return fmsFetch<SysadminTokenRedeemResponse>(
        "/sysadmin/admins/accept-invite",
        {
          method: "POST",
          body: { token: input.token, password: input.password },
        }
      );
    }),
});
