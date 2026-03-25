"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot() {
  return window.innerHeight;
}

function getServerSnapshot() {
  return 800;
}

export function useViewportHeight() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
