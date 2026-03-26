import { TRPCError } from "@trpc/server";

const FMS_URL = process.env.FMS_URL ?? "http://fms:4000";

interface FmsClientOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  headers?: Record<string, string>;
}

interface FmsErrorBody {
  error?: string;
  request_id?: string;
}

const STATUS_TO_TRPC_CODE: Record<number, TRPCError["code"]> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
};

export async function fmsFetch<T = unknown>(
  path: string,
  options: FmsClientOptions = {}
): Promise<T> {
  const { method = "GET", body, accessToken, headers: extraHeaders } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${FMS_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: FmsErrorBody = {};
    try {
      errorBody = await res.json();
    } catch {
      // response may not be JSON
    }

    const code = STATUS_TO_TRPC_CODE[res.status] ?? "INTERNAL_SERVER_ERROR";
    const retryAfter = res.headers.get("Retry-After");

    throw new TRPCError({
      code,
      message: errorBody.error ?? `fleet-manager-server responded with ${res.status}`,
      cause: retryAfter ? { retryAfter: parseInt(retryAfter, 10) } : undefined,
    });
  }

  // 204 No Content or empty body
  const text = await res.text();
  if (!text) return {} as T;

  return JSON.parse(text) as T;
}
