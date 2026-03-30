import { cookies } from "next/headers";
import { subscribe } from "@/lib/nats/subscription-manager";
import type { TelemetryFrame } from "@/lib/nats/types";

const FMS_URL = process.env.FMS_URL ?? "http://fms:4000";

export const dynamic = "force-dynamic";

async function resolveOrgId(
  accessToken: string,
  orgSlug: string
): Promise<string | null> {
  try {
    const res = await fetch(`${FMS_URL}/orgs/${orgSlug}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    const org = await res.json();
    return org.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const orgSlug = cookieStore.get("current_org")?.value;

  if (!accessToken || !orgSlug) {
    return new Response("Unauthorized", { status: 401 });
  }

  const orgId = await resolveOrgId(accessToken, orgSlug);
  if (!orgId) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeat every 15s to detect stale connections
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":ping\n\n"));
        } catch {
          // Controller closed, cleanup will happen via cancel/abort
        }
      }, 15000);

      try {
        unsubscribe = await subscribe(orgId, (frame: TelemetryFrame) => {
          try {
            const event = `event: telemetry\ndata: ${JSON.stringify(frame)}\n\n`;
            controller.enqueue(encoder.encode(event));
          } catch {
            // Controller closed
          }
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "NATS subscription failed";
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
    cancel() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (unsubscribe) unsubscribe();
    },
  });

  // Clean up when the client disconnects
  request.signal.addEventListener("abort", () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (unsubscribe) unsubscribe();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
