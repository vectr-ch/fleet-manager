export interface Context {
  accessToken: string | null;
  orgSlug: string | null;
}

export async function createContext(): Promise<Context> {
  // Don't eagerly read cookies here — cookies() from next/headers
  // can fail when called inside tRPC's fetchRequestHandler context.
  // Instead, protectedProcedure middleware reads cookies lazily,
  // and public procedures (auth.login, etc.) handle cookies directly.
  return {
    accessToken: null,
    orgSlug: null,
  };
}
