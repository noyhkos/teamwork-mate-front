"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // writes from another tab
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * localStorage as an external store. Reading it in an effect would mean a second
 * render pass on every mount; this keeps the server snapshot (null) honest and
 * re-renders every reader when `setStored` writes.
 */
export function useStored(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => localStorage.getItem(key), [key]),
    () => null,
  );
}

export function setStored(key: string, value: string | null) {
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
  listeners.forEach((l) => l());
}
