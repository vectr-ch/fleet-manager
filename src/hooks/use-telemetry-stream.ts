"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { TelemetryFrame } from "@/lib/nats/types";

const HISTORY_SIZE = 60;

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface TelemetryHistory {
  altitude: number[];
  battery: number[];
  yaw: number[];
  satellites: number[];
}

function emptyHistory(): TelemetryHistory {
  return {
    altitude: [],
    battery: [],
    yaw: [],
    satellites: [],
  };
}

function pushHistory(history: TelemetryHistory, frame: TelemetryFrame) {
  const push = (arr: number[], val: number) => {
    arr.push(val);
    if (arr.length > HISTORY_SIZE) arr.shift();
  };
  push(history.altitude, frame.position?.altitudeM ?? 0);
  push(history.battery, frame.batteryPercent);
  push(history.yaw, frame.attitude?.yawDeg ?? 0);
  push(history.satellites, frame.gps?.satellites ?? 0);
}

export function useTelemetryStream() {
  const [frames, setFrames] = useState<Map<string, TelemetryFrame>>(new Map());
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  const historyRef = useRef<Map<string, TelemetryHistory>>(new Map());
  const [historyVersion, setHistoryVersion] = useState(0);

  const getHistory = useCallback(
    (nodeId: string): TelemetryHistory => {
      // historyVersion used to trigger re-reads
      void historyVersion;
      return historyRef.current.get(nodeId) ?? emptyHistory();
    },
    [historyVersion]
  );

  useEffect(() => {
    let es: EventSource | null = null;
    let closed = false;
    let batchTimeout: ReturnType<typeof setTimeout> | null = null;
    const pendingFrames = new Map<string, TelemetryFrame>();

    function flushBatch() {
      if (pendingFrames.size === 0) return;
      const batch = new Map(pendingFrames);
      pendingFrames.clear();

      setFrames((prev) => {
        const next = new Map(prev);
        for (const [nodeId, frame] of batch) {
          next.set(nodeId, frame);
        }
        return next;
      });
      setHistoryVersion((v) => v + 1);
    }

    function connect() {
      if (closed) return;
      setStatus("connecting");

      es = new EventSource("/api/telemetry/stream");

      es.addEventListener("telemetry", (e: MessageEvent) => {
        try {
          const frame: TelemetryFrame = JSON.parse(e.data);
          pendingFrames.set(frame.nodeId, frame);

          // Update history immediately (mutable ref, no re-render)
          if (!historyRef.current.has(frame.nodeId)) {
            historyRef.current.set(frame.nodeId, emptyHistory());
          }
          pushHistory(historyRef.current.get(frame.nodeId)!, frame);

          // Batch state updates at ~10fps
          if (!batchTimeout) {
            batchTimeout = setTimeout(() => {
              batchTimeout = null;
              flushBatch();
            }, 100);
          }
        } catch {
          // Ignore malformed messages
        }
      });

      es.addEventListener("error", () => {
        if (closed) return;
        setStatus("disconnected");
      });

      es.onopen = () => {
        setStatus("connected");
      };
    }

    connect();

    return () => {
      closed = true;
      if (batchTimeout) clearTimeout(batchTimeout);
      flushBatch();
      if (es) {
        es.close();
        es = null;
      }
    };
  }, []);

  const droneIds = Array.from(frames.keys()).sort();

  return { frames, droneIds, status, getHistory };
}
