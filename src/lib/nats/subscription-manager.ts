import { type ConsumerMessages, DeliverPolicy } from "nats";
import { getNatsConnection } from "./client";
import { vectr } from "@/lib/proto/telemetry";
import type { TelemetryFrame } from "./types";
import { flightModeName } from "./types";

type Listener = (frame: TelemetryFrame) => void;

interface OrgSubscription {
  messages: ConsumerMessages;
  listeners: Set<Listener>;
  running: boolean;
}

const subscriptions = new Map<string, OrgSubscription>();

const MAX_LISTENERS_PER_ORG = 50;

function decodeFrame(data: Uint8Array): TelemetryFrame {
  const msg = vectr.TelemetryFrame.decode(data);
  return {
    nodeId: msg.nodeId ?? "",
    orgId: msg.orgId ?? "",
    baseId: msg.baseId ?? "",
    timestampMs: Number(msg.timestampMs ?? 0),
    attitude: msg.attitude
      ? {
          rollDeg: msg.attitude.rollDeg ?? 0,
          pitchDeg: msg.attitude.pitchDeg ?? 0,
          yawDeg: msg.attitude.yawDeg ?? 0,
        }
      : null,
    position: msg.position
      ? {
          latitude: msg.position.latitude ?? 0,
          longitude: msg.position.longitude ?? 0,
          altitudeM: msg.position.altitudeM ?? 0,
        }
      : null,
    batteryVoltage: msg.batteryVoltage ?? 0,
    batteryPercent: msg.batteryPercent ?? 0,
    flightMode: flightModeName(msg.flightMode ?? 0),
    armed: msg.armed ?? false,
    gps: msg.gps
      ? {
          fixType: msg.gps.fixType ?? 0,
          satellites: msg.gps.satellites ?? 0,
          hdop: msg.gps.hdop ?? 0,
        }
      : null,
  };
}

async function startConsuming(orgId: string, sub: OrgSubscription) {
  sub.running = true;
  try {
    for await (const msg of sub.messages) {
      if (!sub.running) break;
      try {
        const frame = decodeFrame(msg.data);
        for (const listener of sub.listeners) {
          listener(frame);
        }
      } catch (err) {
        console.error("[nats] failed to decode telemetry frame:", err);
      }
    }
  } catch (err) {
    if (sub.running) {
      console.error(`[nats] consumer for org ${orgId} failed:`, err);
    }
  }
}

export async function subscribe(
  orgId: string,
  listener: Listener
): Promise<() => void> {
  let sub = subscriptions.get(orgId);

  if (sub) {
    if (sub.listeners.size >= MAX_LISTENERS_PER_ORG) {
      throw new Error(
        `Max listeners (${MAX_LISTENERS_PER_ORG}) reached for org ${orgId}`
      );
    }
    sub.listeners.add(listener);
  } else {
    const nc = await getNatsConnection();
    const js = nc.jetstream();

    // Ordered consumer: ephemeral, auto-managed by NATS client.
    // DeliverNew skips the 175k+ historical messages — only live data.
    const consumer = await js.consumers.get("TELEMETRY", {
      filterSubjects: [`telemetry.${orgId}.>`],
      deliver_policy: DeliverPolicy.New,
    });

    const messages = await consumer.consume();

    sub = {
      messages,
      listeners: new Set([listener]),
      running: false,
    };
    subscriptions.set(orgId, sub);
    startConsuming(orgId, sub);
    console.log(`[nats] subscribed to telemetry for org ${orgId}`);
  }

  return () => {
    const s = subscriptions.get(orgId);
    if (!s) return;
    s.listeners.delete(listener);
    if (s.listeners.size === 0) {
      s.running = false;
      s.messages.close().catch(() => {});
      subscriptions.delete(orgId);
      console.log(`[nats] unsubscribed from telemetry for org ${orgId}`);
    }
  };
}
