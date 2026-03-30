"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

let cachedMql: MediaQueryList | null = null;
function getMql() {
  if (!cachedMql) cachedMql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  return cachedMql;
}

function subscribe(callback: () => void) {
  const mql = getMql();
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
